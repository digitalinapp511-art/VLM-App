import Student from '../models/Student.js';
import Plan from '../models/Plan.js';
import Session from '../models/Session.js';
import DoubtRequest from '../models/DoubtRequest.js';
import Teacher from '../models/Teacher.js';
import McqTask from '../models/McqTask.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Referral from '../models/Referral.js';
import Parent from '../models/Parent.js';
import ParentChildRequest from '../models/ParentChildRequest.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { findMatchingTeachers } from '../services/matchingService.js';
import { createNotification } from '../services/notificationService.js';
import { getIo } from '../socket/index.js';
import { getFileUrl } from '../middleware/upload.js';
import { generateVlmId } from '../utils/vlmIdGenerator.js';
import User from '../models/User.js';

const logStudentPointsTransaction = async (userId, points, type, description) => {
  try {
    await WalletTransaction.create({
      userId,
      role: 'student',
      type: 'credit',
      earningType: type,
      points,
      description,
      status: 'credited'
    });
  } catch (err) {
    console.error("Failed to log points transaction:", err);
  }
};

export const createStudentProfile = asyncHandler(async (req, res) => {
  // Fetch the User to sync verified email/mobile
  const authUser = await User.findById(req.user._id);
  if (!authUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

  let student = await Student.findOne({ userId: req.user._id });
  if (student) {
    // Guard: make sure this doc belongs to the authenticated user
    if (student.userId.toString() !== req.user._id.toString()) {
      console.error(`[SECURITY] Profile userId mismatch! Expected ${req.user._id}, got ${student.userId}`);
      return res.status(403).json({ success: false, message: 'Profile ownership mismatch' });
    }
    Object.assign(student, req.body);
    // Sync contact from User record (don't let client override verified fields)
    if (authUser.email) student.email = authUser.email;
    if (authUser.mobile) student.mobile = authUser.mobile;
    await student.save();
  } else {
    const vlmStudentId = await generateVlmId('STU');
    student = await Student.create({
      userId: req.user._id,
      vlmStudentId,
      email: authUser.email || req.body.email,
      mobile: authUser.mobile || req.body.mobile,
      ...req.body,
    });
  }
  res.json({ success: true, data: student });
});

export const getStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.json({ success: true, data: null });
  res.json({ success: true, data: student });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.json({ success: true, data: null });

  const recentSessions = await Session.find({ studentId: student._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('teacherId', 'fullName profilePhoto');

  res.json({
    success: true,
    data: {
      student,
      recentSessions,
      wallet: student.wallet,
      subscription: student.subscription,
      streak: student.streak,
      totalPoints: student.totalPoints,
      spinUnlocked: student.spinUnlocked,
    },
  });
});

export const getPlans = asyncHandler(async (req, res) => {
  const { class: cls } = req.query;
  const query = cls ? { class: cls, isActive: true } : { isActive: true };
  const plans = await Plan.find(query).sort({ sortOrder: 1 });
  res.json({ success: true, data: plans });
});

export const activateTrial = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const student = await Student.findOne({ userId: req.user._id });
  let plan;
  
  try {
    plan = await Plan.findById(planId);
  } catch(e) {
    // planId might be a mock id like "1" that causes CastError
    plan = null;
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + (plan?.trialDays || 3));

  student.subscription = {
    planId: plan?._id || null,
    status: 'trial',
    trialEndsAt,
    autopayEnabled: true,
  };
  student.wallet.aiCredits = plan?.benefits?.aiCredits || 10;
  student.wallet.humanChatCredits = plan?.benefits?.humanChatCredits || 5;
  student.wallet.audioMinutes = plan?.benefits?.audioMinutes || 30;
  student.wallet.videoMinutes = plan?.benefits?.videoMinutes || 15;
  await student.save();

  res.json({ success: true, message: 'Trial activated', data: student });
});

export const submitDoubt = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  const { subject, class: cls, board, language, sessionType, doubtText, doubtImage, topic, preferredTeacherId } = req.body;

  const session = await Session.create({
    studentId: student._id,
    type: sessionType || 'chat',
    subject,
    class: cls || student.class,
    board: board || student.board,
    language: language || student.preferredLanguage,
    doubtText,
    doubtImage,
    topic,
    status: 'searching',
  });

  const teachers = await findMatchingTeachers({
    subject,
    class: cls || student.class,
    language: language || student.preferredLanguage,
    board: board || student.board,
    preferredTeacherId,
  });

  const timerSec = parseInt(process.env.REQUEST_RESPONSE_TIMER_SEC || '20', 10);
  const timerExpiresAt = new Date(Date.now() + timerSec * 1000);

  const doubtRequest = await DoubtRequest.create({
    studentId: student._id,
    sessionId: session._id,
    subject,
    class: cls || student.class,
    board,
    language,
    sessionType,
    doubtText,
    doubtImage,
    topic,
    preferredTeacherId,
    routedTeachers: teachers.map((t) => ({
      teacherId: t._id,
      timerExpiresAt,
    })),
    status: 'searching',
    timerExpiresAt,
  });

  session.routedTeachers = teachers.map((t) => t._id);
  await session.save();

  for (const teacher of teachers) {
    await createNotification(
      teacher.userId,
      'new_request',
      'New Doubt Request',
      `${subject} - Class ${cls || student.class}`,
      { sessionId: session._id, doubtRequestId: doubtRequest._id },
      `/teacher/requests/${doubtRequest._id}`
    );
  }

  res.json({
    success: true,
    data: { session, doubtRequest, teachersFound: teachers.length },
    message: teachers.length ? 'Searching for teachers...' : 'No teachers available',
  });
});

export const submitDoubtWithImages = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  const doubtText = req.body.text || req.body.doubtText || '';
  const doubtImage = req.file ? getFileUrl(req.file.filename, 'documents') : (req.body.doubtImage || '');
  const subject = req.body.subject || 'General';
  const cls = req.body.class || student?.class || '10';
  const board = req.body.board || student?.board || 'CBSE';
  const language = req.body.language || student?.preferredLanguage || 'English';
  const sessionType = req.body.sessionType || 'chat';
  const topic = req.body.topic || '';
  const preferredTeacherId = req.body.preferredTeacherId;

  const session = await Session.create({
    studentId: student?._id,
    type: sessionType,
    subject,
    class: cls,
    board,
    language,
    doubtText,
    doubtImage,
    topic,
    status: 'searching',
  });

  const teachers = await findMatchingTeachers({
    subject,
    class: cls,
    language,
    board,
    preferredTeacherId,
  });

  const timerSec = parseInt(process.env.REQUEST_RESPONSE_TIMER_SEC || '20', 10);
  const timerExpiresAt = new Date(Date.now() + timerSec * 1000);

  const doubtRequest = await DoubtRequest.create({
    studentId: student?._id,
    sessionId: session._id,
    subject,
    class: cls,
    board,
    language,
    sessionType,
    doubtText,
    doubtImage,
    topic,
    preferredTeacherId,
    routedTeachers: teachers.map((t) => ({
      teacherId: t._id,
      timerExpiresAt,
    })),
    status: 'searching',
    timerExpiresAt,
  });

  session.routedTeachers = teachers.map((t) => t._id);
  await session.save();

  for (const teacher of teachers) {
    await createNotification(
      teacher.userId,
      'new_request',
      'New Doubt Request',
      `${subject} - Class ${cls}`,
      { sessionId: session._id, doubtRequestId: doubtRequest._id },
      `/teacher/requests/${doubtRequest._id}`
    );
  }

  res.json({
    success: true,
    data: { session, doubtRequest, teachersFound: teachers.length },
    message: teachers.length ? 'Searching for teachers...' : 'No teachers available',
  });
});

export const getDoubtById = asyncHandler(async (req, res) => {
  const doubtRequest = await DoubtRequest.findById(req.params.id)
    .populate('studentId')
    .populate('sessionId')
    .populate('assignedTeacherId');
  
  if (!doubtRequest) {
    return res.status(404).json({ success: false, message: 'Doubt request not found' });
  }

  res.json({ success: true, data: doubtRequest });
});

export const getAvailableTeachers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || '5', 10);
  
  const teachers = await Teacher.find({ applicationStatus: 'approved' })
    .limit(limit);

  if (!teachers.length) {
    const mockTeachers = [
      {
        id: "mock-t-1",
        fullName: "Prof. Priya Sharma",
        rating: "4.9",
        qualification: "PhD in Mathematics, IIT Delhi",
        bio: "Fast Math, JEE prep expert."
      },
      {
        id: "mock-t-2",
        fullName: "Dr. Alan Grant",
        rating: "4.8",
        qualification: "M.Sc Physics, IISc Bangalore",
        bio: "High-trust physics, IIT JEE focus."
      },
      {
        id: "mock-t-3",
        fullName: "Mrs. Iyer",
        rating: "4.9",
        qualification: "MA in English Literature, DU",
        bio: "Instant English, perfect composition."
      },
      {
        id: "mock-t-4",
        fullName: "Emily Chen",
        rating: "5.0",
        qualification: "B.Tech Computer Science, Stanford",
        bio: "Python Loop in 5 Minutes master."
      }
    ];
    return res.json(mockTeachers);
  }

  const formattedTeachers = teachers.map(t => ({
    id: t._id,
    fullName: t.fullName,
    rating: "4.9",
    qualification: t.qualification?.highestQualification || "Expert Educator",
    bio: t.bio || "Available for instant sessions"
  }));

  res.json(formattedTeachers);
});

export const getDailyMcq = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let task = await McqTask.findOne({ studentId: student._id, date: { $gte: today } });
  if (!task) {
    const subjects = student.subjects?.length ? student.subjects : ['Math', 'Science', 'English'];
    const questions = [];
    for (let i = 0; i < 20; i++) {
      const subj = subjects[i % subjects.length];
      questions.push({
        subject: subj,
        question: `Sample ${subj} question ${i + 1} for Class ${student.class}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: `Explanation for question ${i + 1}`,
      });
    }
    task = await McqTask.create({
      studentId: student._id,
      class: student.class,
      date: today,
      questions,
      timerSeconds: 1200,
    });
  }
  res.json({ success: true, data: task });
});

export const submitMcq = asyncHandler(async (req, res) => {
  const { taskId, answers } = req.body;
  const task = await McqTask.findById(taskId);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  let score = 0;
  const processedAnswers = answers.map((a) => {
    const correct = task.questions[a.questionIndex]?.correctAnswer === a.selectedAnswer;
    if (correct) score++;
    return { ...a, isCorrect: correct };
  });

  task.answers = processedAnswers;
  task.score = score;
  task.pointsEarned = score * 5;
  task.status = 'completed';
  task.completedAt = new Date();
  await task.save();

  const student = await Student.findById(task.studentId);
  student.totalPoints += task.pointsEarned;
  student.wallet.totalPoints += task.pointsEarned;
  student.markModified('wallet');
  await student.save();

  if (task.pointsEarned > 0) {
    await logStudentPointsTransaction(student.userId, task.pointsEarned, 'bonus', 'Daily MCQ Completion Bonus');
  }

  res.json({ success: true, data: { score, total: task.questions.length, pointsEarned: task.pointsEarned } });
});

export const toggleFavoriteTeacher = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  const { teacherId } = req.body;
  const idx = student.favoriteTeachers.indexOf(teacherId);
  if (idx > -1) {
    student.favoriteTeachers.splice(idx, 1);
  } else {
    student.favoriteTeachers.push(teacherId);
  }
  await student.save();
  res.json({ success: true, data: student.favoriteTeachers });
});

export const getSubjects = asyncHandler(async (req, res) => {
  const subjects = [
    { id: "math", name: "Mathematics" },
    { id: "phy", name: "Physics" },
    { id: "chem", name: "Chemistry" },
    { id: "bio", name: "Biology" },
    { id: "hist", name: "History" },
    { id: "geo", name: "Geography" },
    { id: "eng", name: "English" },
    { id: "cs", name: "Computer Science" },
    { id: "hin", name: "Hindi" },
  ];
  res.json({ success: true, data: subjects });
});

export const getChapters = asyncHandler(async (req, res) => {
  const { subject } = req.query;
  const chapters = [
    { id: "ch1", name: `${subject || 'Subject'} - Chapter 1: Introduction` },
    { id: "ch2", name: `${subject || 'Subject'} - Chapter 2: Core Concepts` },
    { id: "ch3", name: `${subject || 'Subject'} - Chapter 3: Advanced Topics` },
    { id: "ch4", name: `${subject || 'Subject'} - Chapter 4: Practice Problems` },
  ];
  res.json({ success: true, data: chapters });
});

export const claimSpinReward = asyncHandler(async (req, res) => {
  const { rewardType, amount } = req.body;
  const student = await Student.findOne({ userId: req.user._id });
  
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const now = new Date();
  if (student.lastSpinDate) {
    const timeDiff = now.getTime() - student.lastSpinDate.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    if (hoursDiff < 24) {
      const secondsRemaining = Math.ceil(24 * 3600 - (timeDiff / 1000));
      return res.status(400).json({ 
        success: false, 
        message: 'You can only spin once every 24 hours',
        secondsLeft: secondsRemaining 
      });
    }
  }

  student.lastSpinDate = now;

  if (rewardType === 'POINTS') {
    student.totalPoints += amount;
    student.wallet.totalPoints += amount;
    student.wallet.balance += amount;
    await logStudentPointsTransaction(req.user._id, amount, 'bonus', 'Lucky Spin Wheel Reward');
  } else if (rewardType === 'CREDITS') {
    student.wallet.aiCredits += amount;
    await logStudentPointsTransaction(req.user._id, amount, 'bonus', `Lucky Spin Wheel Reward (${amount} AI Credits)`);
  }
  
  student.markModified('wallet');
  await student.save();
  res.json({ success: true, message: `Successfully claimed ${amount} ${rewardType}`, data: student });
});

export const getStudentWalletHistory = asyncHandler(async (req, res) => {
  const walletTx = await WalletTransaction.find({ userId: req.user._id, role: 'student' })
    .sort({ createdAt: -1 })
    .limit(50);

  const referrals = await Referral.find({ referrerId: req.user._id, status: 'rewarded' })
    .sort({ createdAt: -1 })
    .limit(50);

  const formattedTx = walletTx.map(tx => ({
    id: tx._id,
    title: tx.description || 'Reward Earned',
    type: tx.earningType || 'bonus',
    points: tx.points,
    change: `+${tx.points} PTS`,
    time: tx.createdAt,
  }));

  const formattedRef = referrals.map(ref => ({
    id: ref._id,
    title: `Referral Reward (${ref.refereeName || 'Friend Invited'})`,
    type: 'referral',
    points: ref.rewardPoints,
    change: `+${ref.rewardPoints} PTS`,
    time: ref.createdAt,
  }));

  const history = [...formattedTx, ...formattedRef]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 50);

  res.json({ success: true, data: history });
});

export const getParentRequests = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  // Query ParentChildRequest collection and populate parent's User details
  const pendingRequests = await ParentChildRequest.find({
    studentId: student._id,
    status: 'pending'
  }).populate({
    path: 'parentId',
    select: 'fullName email profilePhoto userId',
    populate: {
      path: 'userId',
      select: 'email mobile'
    }
  });

  const formattedParents = pendingRequests.map(r => {
    const parentEmail = r.parentId?.email || r.parentId?.userId?.email;
    const parentMobile = r.parentId?.userId?.mobile;
    return {
      _id: r.parentId?._id,
      requestId: r._id,
      fullName: r.parentId?.fullName,
      email: parentEmail,
      mobile: parentMobile,
      profilePhoto: r.parentId?.profilePhoto,
    };
  }).filter(p => p._id);

  res.json({ success: true, data: formattedParents });
});

export const approveParentRequest = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const { parentId } = req.params;
  const parent = await Parent.findById(parentId);
  if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });

  // Update status in ParentChildRequest
  const linkReq = await ParentChildRequest.findOne({
    parentId: parent._id,
    studentId: student._id,
    status: 'pending'
  });

  if (linkReq) {
    linkReq.status = 'approved';
    await linkReq.save();
  }

  // Update status in parent.linkedChildren
  const childLink = parent.linkedChildren.find(c => c.studentId?.toString() === student._id.toString());
  if (childLink) {
    childLink.status = 'approved';
    childLink.linkedAt = new Date();
    await parent.save();
  } else {
    parent.linkedChildren.push({ studentId: student._id, status: 'approved', linkedAt: new Date() });
    await parent.save();
  }

  // Add to student.linkedParents if not present
  if (!student.linkedParents.includes(parent._id)) {
    student.linkedParents.push(parent._id);
    await student.save();
  }

  // Notify parent via socket
  const io = getIo();
  if (io) {
    io.to(`user:${parent.userId}`).emit('parent_link_approved', {
      studentId: student._id,
      studentName: student.fullName
    });
  }

  res.json({ success: true, message: 'Request approved successfully' });
});

export const rejectParentRequest = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const { parentId } = req.params;
  const parent = await Parent.findById(parentId);
  if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });

  // Update request status
  const linkReq = await ParentChildRequest.findOne({
    parentId: parent._id,
    studentId: student._id,
    status: 'pending'
  });

  if (linkReq) {
    linkReq.status = 'rejected';
    await linkReq.save();
  }

  parent.linkedChildren = parent.linkedChildren.filter(c => c.studentId?.toString() !== student._id.toString());
  await parent.save();

  student.linkedParents = student.linkedParents.filter(pid => pid.toString() !== parent._id.toString());
  await student.save();

  res.json({ success: true, message: 'Request rejected' });
});
