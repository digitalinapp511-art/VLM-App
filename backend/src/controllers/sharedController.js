import Session from '../models/Session.js';
import Message from '../models/Message.js';
import DoubtRequest from '../models/DoubtRequest.js';
import Teacher from '../models/Teacher.js';
import TeacherMetrics from '../models/TeacherMetrics.js';
import Student from '../models/Student.js';
import Review from '../models/Review.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Withdrawal from '../models/Withdrawal.js';
import Notification from '../models/Notification.js';
import SupportTicket from '../models/SupportTicket.js';
import LiveClass from '../models/LiveClass.js';
import ShortVideo from '../models/ShortVideo.js';
import Referral from '../models/Referral.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { creditTeacher, calculateSessionEarning } from '../services/rewardService.js';
import { detectRestrictedContent } from '../utils/helpers.js';
import { createNotification } from '../services/notificationService.js';
import { getFileUrl } from '../middleware/upload.js';

export const getIncomingRequests = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  const requests = await DoubtRequest.find({
    'routedTeachers.teacherId': teacher._id,
    'routedTeachers.status': 'pending',
    status: 'searching',
  }).populate('studentId', 'fullName class nickname');

  const filtered = requests.filter((r) => {
    const rt = r.routedTeachers.find((t) => t.teacherId.toString() === teacher._id.toString());
    return rt && (!rt.timerExpiresAt || rt.timerExpiresAt > new Date());
  });

  res.json({ success: true, data: filtered });
});

export const respondToRequest = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

  const { requestId, action } = req.body;

  if (action === 'accept' && teacher.availabilityStatus === 'busy') {
    return res.status(400).json({ success: false, message: 'You are already in an active session' });
  }

  const request = await DoubtRequest.findById(requestId);
  if (!request || request.status !== 'searching') {
    return res.status(400).json({ success: false, message: 'Request not available' });
  }

  const rtIndex = request.routedTeachers.findIndex(
    (t) => t.teacherId.toString() === teacher._id.toString() && t.status === 'pending'
  );
  if (rtIndex === -1) return res.status(400).json({ success: false, message: 'Not routed to you' });

  if (action === 'accept') {
    teacher.availabilityStatus = 'busy';
    request.routedTeachers[rtIndex].status = 'accepted';
    request.routedTeachers[rtIndex].respondedAt = new Date();
    request.assignedTeacherId = teacher._id;
    request.status = 'active';

    request.routedTeachers.forEach((t, i) => {
      if (i !== rtIndex && t.status === 'pending') t.status = 'cancelled';
    });

    const session = await Session.findById(request.sessionId);
    session.teacherId = teacher._id;
    session.status = 'active';
    session.acceptedAt = new Date();
    session.startedAt = new Date();
    await session.save();

    const student = await Student.findById(request.studentId);
    await createNotification(
      student.userId,
      'session_assigned',
      'Teacher Found!',
      `${teacher.fullName} accepted your request`,
      { sessionId: session._id }
    );

    // Set teacher as IN_SESSION in Redis (removes from available pool)
    try {
      const { setTeacherState, releaseDispatchLock, TEACHER_PRESENCE } = await import('../services/presenceService.js');
      await setTeacherState(teacher._id, TEACHER_PRESENCE.IN_SESSION);
      await releaseDispatchLock(teacher._id);
    } catch (e) {
      console.error('[respondToRequest accept presenceService error]', e.message);
    }
  } else {
    request.routedTeachers[rtIndex].status = 'rejected';
    request.routedTeachers[rtIndex].respondedAt = new Date();
    // Increment missedRequests on the split TeacherMetrics model
    await TeacherMetrics.findOneAndUpdate(
      { teacherId: teacher._id },
      { $inc: { missedRequests: 1 } },
      { upsert: true }
    );

    // Release dispatch lock so the next teacher can be dispatched immediately
    try {
      const { releaseDispatchLock } = await import('../services/presenceService.js');
      await releaseDispatchLock(teacher._id);
    } catch (e) {
      console.error('[respondToRequest reject presenceService error]', e.message);
    }
  }

  await request.save();
  await teacher.save();

  res.json({ success: true, message: action === 'accept' ? 'Request accepted' : 'Request rejected' });
});

export const getSessionMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ sessionId: req.params.sessionId }).sort({ createdAt: 1 });
  res.json({ success: true, data: messages });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { sessionId, content, type = 'text', mediaUrl } = req.body;
  const flag = detectRestrictedContent(content);
  if (flag.flagged) {
    return res.status(400).json({ success: false, message: flag.reason });
  }

  const message = await Message.create({
    sessionId,
    senderId: req.user._id,
    senderRole: req.user.activeRole,
    type,
    content,
    mediaUrl,
    isFlagged: flag.flagged,
  });

  res.json({ success: true, data: message });
});

export const completeSession = asyncHandler(async (req, res) => {
  const { sessionId, summary, keyNotes, studentBehaviourRating } = req.body;
  const session = await Session.findById(sessionId);
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

  session.status = 'completed';
  session.endedAt = new Date();
  session.duration = Math.floor((session.endedAt - session.startedAt) / 1000) || 1;
  session.teacherSummary = summary;
  session.keyNotes = keyNotes;
  session.studentBehaviourRating = studentBehaviourRating;

  // Calculate and credit base earnings immediately when session is completed
  if (!session.earnings) {
    session.earnings = { points: 0, status: 'pending' };
  }

  if (session.earnings.status !== 'credited') {
    const durationMinutes = Math.max(1, Math.floor(session.duration / 60));
    const points = await calculateSessionEarning(session, durationMinutes, 0); // 0 rating initially
    await creditTeacher(session.teacherId, session.type, points, `Session ${session.type} completed`, sessionId);
    session.earnings.points = points;
    session.earnings.status = 'credited';
  }

  await session.save();

  const teacher = await Teacher.findById(session.teacherId);
  if (teacher) {
    teacher.availabilityStatus = 'online';
    await teacher.save();
    await TeacherMetrics.findOneAndUpdate(
      { teacherId: teacher._id },
      { $inc: { totalSessions: 1 } },
      { upsert: true }
    );
    try {
      const { setTeacherState, TEACHER_PRESENCE } = await import('../services/presenceService.js');
      await setTeacherState(teacher._id, TEACHER_PRESENCE.ONLINE);
      console.log(`[completeSession] Teacher ${teacher._id} restored to ONLINE.`);
    } catch (e) {
      console.error('[completeSession] presenceService error]', e.message);
    }
  }

  res.json({ success: true, data: session });
});

export const resolveSession = asyncHandler(async (req, res) => {
  const { sessionId, rating, feedback, categories } = req.body;
  const session = await Session.findById(sessionId);
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

  session.isResolved = true;
  session.resolvedAt = new Date();

  const review = await Review.create({
    sessionId,
    studentId: session.studentId,
    teacherId: session.teacherId,
    overallRating: rating,
    ...categories,
    feedback,
    isPositive: rating >= 3,
  });

  const durationMinutes = Math.max(1, Math.floor(session.duration / 60));
  const newPoints = await calculateSessionEarning(session, durationMinutes, rating);

  if (!session.earnings) {
    session.earnings = { points: 0, status: 'pending' };
  }

  if (session.earnings.status === 'credited') {
    // If already credited (from completeSession), credit the rating bonus if any
    const bonus = newPoints - (session.earnings.points || 0);
    if (bonus > 0) {
      await creditTeacher(session.teacherId, session.type, bonus, `Rating bonus for Session ${session.type}`, sessionId);
      session.earnings.points = (session.earnings.points || 0) + bonus;
    }
  } else {
    // If not credited yet (fallback), credit the full amount
    await creditTeacher(session.teacherId, session.type, newPoints, `Session ${session.type} completed`, sessionId);
    session.earnings.points = newPoints;
    session.earnings.status = 'credited';
  }

  await session.save();

  const teacher = await Teacher.findById(session.teacherId);
  if (teacher) {
    teacher.availabilityStatus = 'online';
    await teacher.save();

    // Update rating and totalSessions atomically on TeacherMetrics
    const existingMetrics = await TeacherMetrics.findOne({ teacherId: teacher._id });
    if (existingMetrics) {
      const newCount = existingMetrics.ratingCount + 1;
      const newRating = ((existingMetrics.rating * existingMetrics.ratingCount) + rating) / newCount;
      await TeacherMetrics.findOneAndUpdate(
        { teacherId: teacher._id },
        { $set: { rating: newRating, ratingCount: newCount }, $inc: { totalSessions: 1 } }
      );
    } else {
      await TeacherMetrics.create({ teacherId: teacher._id, rating, ratingCount: 1, totalSessions: 1 });
    }

    try {
      const { setTeacherState, TEACHER_PRESENCE } = await import('../services/presenceService.js');
      await setTeacherState(teacher._id, TEACHER_PRESENCE.ONLINE);
      console.log(`[resolveSession] Teacher ${teacher._id} restored to ONLINE after session.`);
    } catch (e) {
      console.error('[resolveSession] presenceService error:', e.message);
    }
  }

  res.json({ success: true, data: { session, review, pointsCredited: newPoints } });
});

export const getSessionHistory = asyncHandler(async (req, res) => {
  const role = req.user.activeRole;
  const { type, status, page = 1, limit = 20 } = req.query;
  const query = {};

  if (role === 'teacher') {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    query.teacherId = teacher._id;
  } else if (role === 'student') {
    const student = await Student.findOne({ userId: req.user._id });
    query.studentId = student._id;
  }

  if (type) query.type = type;
  if (status) {
    query.status = status;
  } else {
    query.status = { $in: ['active', 'completed'] };
  }

  const sessions = await Session.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('teacherId', 'fullName profilePhoto')
    .populate('studentId', 'fullName nickname class');

  res.json({ success: true, data: sessions });
});

export const getWallet = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  const transactions = await WalletTransaction.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    data: {
      wallet: teacher?.wallet,
      transactions,
      pointsToInr: parseInt(process.env.POINTS_TO_INR_RATIO || '10', 10),
    },
  });
});

export const requestWithdrawal = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  const { amount } = req.body;
  const minAmount = parseInt(process.env.MIN_WITHDRAWAL_AMOUNT || '500', 10);

  if (amount < minAmount) {
    return res.status(400).json({ success: false, message: `Minimum withdrawal is ₹${minAmount}` });
  }
  if (!teacher.bankDetails?.isVerified) {
    return res.status(400).json({ success: false, message: 'Bank details not verified' });
  }
  if (teacher.wallet.withdrawableBalance < amount) {
    return res.status(400).json({ success: false, message: 'Insufficient balance' });
  }

  const ratio = parseInt(process.env.POINTS_TO_INR_RATIO || '10', 10);
  const withdrawal = await Withdrawal.create({
    teacherId: teacher._id,
    amount,
    points: amount * ratio,
    netAmount: amount * 0.9,
    tds: amount * 0.05,
    commission: amount * 0.05,
    bankDetails: teacher.bankDetails,
    status: 'pending',
  });

  teacher.wallet.withdrawableBalance -= amount;
  teacher.wallet.pendingConversion += amount;
  await teacher.save();

  res.json({ success: true, data: withdrawal });
});

export const getWithdrawals = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  const withdrawals = await Withdrawal.find({ teacherId: teacher._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: withdrawals });
});

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
  res.json({ success: true, data: notifications, unreadCount });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
});

export const createTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.create({
    userId: req.user._id,
    role: req.user.activeRole,
    ...req.body,
  });
  res.status(201).json({ success: true, data: ticket });
});

export const getTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: tickets });
});

export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user._id });
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  res.json({ success: true, data: ticket });
});

export const replyTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user._id });
  ticket.replies.push({
    senderId: req.user._id,
    senderRole: req.user.activeRole,
    message: req.body.message,
    attachments: req.body.attachments || [],
  });
  ticket.status = 'waiting_support';
  await ticket.save();
  res.json({ success: true, data: ticket });
});

export const getReviews = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  const reviews = await Review.find({ teacherId: teacher._id, isHidden: false })
    .sort({ createdAt: -1 })
    .populate('studentId', 'nickname fullName profilePhoto');
  res.json({ success: true, data: reviews });
});

export const replyReview = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  const review = await Review.findOne({ _id: req.params.id, teacherId: teacher._id });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  review.teacherReply = req.body.reply;
  await review.save();
  res.json({ success: true, data: review });
});

export const createLiveClass = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  const liveClass = await LiveClass.create({ teacherId: teacher._id, ...req.body, status: 'approved' });
  res.status(201).json({ success: true, data: liveClass });
});

export const getLiveClasses = asyncHandler(async (req, res) => {
  const role = req.user.activeRole;
  let query = {};
  if (role === 'teacher') {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    query.teacherId = teacher._id;
  } else {
    query.status = { $in: ['approved', 'live'] };
  }
  const classes = await LiveClass.find(query)
    .populate('teacherId', 'fullName profilePhoto subjects')
    .sort({ scheduledAt: -1 });
  res.json({ success: true, data: classes });
});

export const uploadShortVideo = asyncHandler(async (req, res) => {
  const maxDuration = req.user.activeRole === 'teacher' ? 180 : 90;
  const video = await ShortVideo.create({
    uploaderId: req.user._id,
    uploaderRole: req.user.activeRole,
    videoUrl: req.body.videoUrl || (req.file ? getFileUrl(req.file.filename, 'videos') : ''),
    duration: req.body.duration,
    ...req.body,
    status: 'pending',
  });

  if (video.duration > maxDuration) {
    video.status = 'rejected';
    video.rejectionReason = `Max duration ${maxDuration}s exceeded`;
    await video.save();
    return res.status(400).json({ success: false, message: video.rejectionReason });
  }

  res.status(201).json({ success: true, data: video });
});

export const getShortVideos = asyncHandler(async (req, res) => {
  const { class: cls, subject } = req.query;
  const query = { status: 'approved' };
  if (cls) query.class = cls;
  if (subject) query.subject = subject;
  const videos = await ShortVideo.find(query).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: videos });
});

export const getMyVideos = asyncHandler(async (req, res) => {
  const videos = await ShortVideo.find({ uploaderId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: videos });
});

export const getReferralData = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  let studentRefCode = req.user.referralCode;
  let teacherRefCode = req.user.referralCode;

  if (student) {
    let updated = false;
    if (!student.studentReferralCode) {
      student.studentReferralCode = `STU-${req.user.referralCode?.replace('VLM', '') || Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      updated = true;
    }
    if (!student.teacherReferralCode) {
      student.teacherReferralCode = `TCH-${req.user.referralCode?.replace('VLM', '') || Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      updated = true;
    }
    if (updated) {
      await student.save();
    }
    studentRefCode = student.studentReferralCode;
    teacherRefCode = student.teacherReferralCode;
  }

  const referrals = await Referral.find({ referrerId: req.user._id }).sort({ createdAt: -1 });
  const totalPoints = referrals.filter((r) => r.status === 'rewarded').reduce((s, r) => s + r.rewardPoints, 0);

  res.json({
    success: true,
    data: {
      referralCode: req.user.referralCode,
      studentLink: `${process.env.FRONTEND_URL}/signup?ref=${studentRefCode}&type=student`,
      teacherLink: `${process.env.FRONTEND_URL}/signup?ref=${teacherRefCode}&type=teacher`,
      studentRef: `vlm.academy/ref/${studentRefCode}`,
      teacherRef: `vlm.academy/ref/${teacherRefCode}`,
      referrals,
      totalReferrals: referrals.length,
      totalPoints,
    },
  });
});

export const getEarningsHistory = asyncHandler(async (req, res) => {
  const { type, from, to } = req.query;
  const query = { userId: req.user._id, type: 'credit' };
  if (type) query.earningType = type;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  const earnings = await WalletTransaction.find(query).sort({ createdAt: -1 });
  res.json({ success: true, data: earnings });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  const metrics = await TeacherMetrics.findOne({ teacherId: teacher._id }) || {};
  const earnings = await WalletTransaction.find({
    userId: req.user._id,
    type: 'credit',
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  res.json({
    success: true,
    data: {
      metrics,
      earningsTrend: earnings,
      referralCount: await Referral.countDocuments({ referrerId: req.user._id, status: 'rewarded' }),
    },
  });
});
