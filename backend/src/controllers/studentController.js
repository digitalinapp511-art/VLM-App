import Student from '../models/Student.js';
import StudentUsage from '../models/StudentUsage.js';
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
import { createNotification } from '../services/notificationService.js';
import { getIo } from '../socket/index.js';
import { getFileUrl } from '../middleware/upload.js';
import { generateVlmId } from '../utils/vlmIdGenerator.js';
import User from '../models/User.js';
import AiChatMessage from '../models/AiChatMessage.js';

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

  // Sync phone and email to authUser if they are provided in body but missing on User model
  let authUserUpdated = false;
  if (req.body.mobile && !authUser.mobile) {
    const cleanMobile = req.body.mobile.trim();
    const duplicateUser = await User.findOne({ mobile: cleanMobile });
    if (duplicateUser && duplicateUser._id.toString() !== authUser._id.toString()) {
      return res.status(400).json({ success: false, message: 'This mobile number is already linked to another account' });
    }
    authUser.mobile = cleanMobile;
    authUser.isMobileVerified = true;
    authUserUpdated = true;
  }
  if (req.body.email && !authUser.email) {
    const cleanEmail = req.body.email.trim().toLowerCase();
    const duplicateUser = await User.findOne({ email: cleanEmail });
    if (duplicateUser && duplicateUser._id.toString() !== authUser._id.toString()) {
      return res.status(400).json({ success: false, message: 'This email address is already linked to another account' });
    }
    authUser.email = cleanEmail;
    authUser.isEmailVerified = true;
    authUserUpdated = true;
  }
  if (authUserUpdated) {
    await authUser.save();
  }

  let student = await Student.findOne({ userId: req.user._id });
  if (student) {
    // Guard: make sure this doc belongs to the authenticated user
    if (student.userId.toString() !== req.user._id.toString()) {
      console.error(`[SECURITY] Profile userId mismatch! Expected ${req.user._id}, got ${student.userId}`);
      return res.status(403).json({ success: false, message: 'Profile ownership mismatch' });
    }
    Object.assign(student, req.body);
    // Sync contact from User record
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

  // Delete any pending MCQ task for today to force a new customized one matching newly saved subjects
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await McqTask.deleteMany({ studentId: student._id, date: { $gte: today }, status: 'pending' }).catch(() => {});

  res.json({ success: true, data: student });
});

export const getStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id })
    .populate('userId', 'email mobile isEmailVerified isMobileVerified');
  if (!student) return res.json({ success: true, data: null });

  const studentObj = student.toObject();
  // NOTE: activeSecondsSinceLastSpin is deliberately NOT computed here (expensive
  // aggregate). It is fetched separately by the Spinner / Dashboard screens.
  res.json({ success: true, data: studentObj });
});export const getDashboard = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id })
    .select('firstName nickname streak totalPoints lastSpinActiveSeconds lastSpinDate wallet.totalPoints class board profilePhoto');
  
  if (!student) return res.json({ success: true, data: null });

  // Lightweight parallel calls
  const { default: Notification } = await import('../models/Notification.js');
  const { default: ParentChildRequest } = await import('../models/ParentChildRequest.js');

  const [
    totalActiveSeconds,
    unreadNotificationCount,
    pendingParentRequestCount
  ] = await Promise.all([
    getAccumulatedActiveSeconds(student._id),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
    ParentChildRequest.countDocuments({ studentId: student._id, status: 'pending' })
  ]);

  let activeTeachersCount = 0;
  try {
    const { getOnlineTeacherCount } = await import('../services/presenceService.js');
    activeTeachersCount = await getOnlineTeacherCount();
  } catch (err) {
    console.error('[Dashboard online count error]', err);
  }

  const activeSecondsSinceLastSpin = totalActiveSeconds - (student.lastSpinActiveSeconds || 0);

  res.json({
    success: true,
    data: {
      student: {
        _id: student._id,
        firstName: student.firstName,
        nickname: student.nickname,
        profilePhoto: student.profilePhoto || "",
        streak: student.streak || 0,
        totalPoints: student.totalPoints || 0,
        activeSecondsSinceLastSpin,
        lastSpinDate: student.lastSpinDate,
        class: student.class,
        board: student.board,
      },
      activeTeachersCount,
      unreadNotificationCount,
      pendingParentRequestCount,
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
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const { subject, class: cls, board, language, sessionType, doubtText, doubtImage, topic, preferredTeacherId } = req.body;

  const finalClass = cls || student.class;
  const finalBoard = board || student.board;
  const finalLanguage = language || student.preferredLanguage || 'English';

  // Step 1: Create Session document
  const session = await Session.create({
    studentId: student._id,
    type: sessionType || 'chat',
    subject,
    class: finalClass,
    board: finalBoard,
    language: finalLanguage,
    doubtText,
    doubtImage,
    topic,
    status: 'searching',
  });

  // Step 2: Create DoubtRequest with status = queued (matching happens in worker)
  const doubtRequest = await DoubtRequest.create({
    studentId: student._id,
    sessionId: session._id,
    subject,
    class: finalClass,
    board: finalBoard,
    language: finalLanguage,
    sessionType: sessionType || 'chat',
    doubtText,
    doubtImage,
    topic,
    preferredTeacherId,
    routedTeachers: [],     // Populated by dispatch worker as it dispatches
    status: 'searching',
  });

  // Step 3: Enqueue dispatch job — controller returns immediately, worker does the matching
  const { enqueueDispatch } = await import('../queues/dispatchQueue.js');
  await enqueueDispatch(doubtRequest._id);

  // Notify student their request is queued
  const io = getIo();
  if (io) {
    io.to(`user:${req.user._id.toString()}`).emit('request-created', {
      requestId: doubtRequest._id.toString(),
      sessionId: session._id.toString(),
      status: 'searching',
      message: 'Finding the best teacher for you...',
    });
  }

  res.json({
    success: true,
    data: { session, doubtRequest },
    message: 'Searching for teachers...',
  });
});

export const submitDoubtWithImages = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const doubtText = req.body.text || req.body.doubtText || '';
  const doubtImage = req.file ? getFileUrl(req.file.filename, 'documents') : (req.body.doubtImage || '');
  const subject = req.body.subject || 'General';
  const cls = req.body.class || student.class || '10';
  const board = req.body.board || student.board || 'CBSE';
  const language = req.body.language || student.preferredLanguage || 'English';
  const sessionType = req.body.sessionType || 'chat';
  const topic = req.body.topic || '';
  const preferredTeacherId = req.body.preferredTeacherId;

  // Step 1: Create Session
  const session = await Session.create({
    studentId: student._id,
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

  // Step 2: Create DoubtRequest — controller does NOT match here
  const doubtRequest = await DoubtRequest.create({
    studentId: student._id,
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
    routedTeachers: [],
    status: 'searching',
  });

  // Step 3: Enqueue dispatch job asynchronously
  const { enqueueDispatch } = await import('../queues/dispatchQueue.js');
  await enqueueDispatch(doubtRequest._id);

  const io = getIo();
  if (io) {
    io.to(`user:${req.user._id.toString()}`).emit('request-created', {
      requestId: doubtRequest._id.toString(),
      sessionId: session._id.toString(),
      status: 'searching',
      message: 'Finding the best teacher for you...',
    });
  }

  res.json({
    success: true,
    data: { session, doubtRequest },
    message: 'Searching for teachers...',
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

export const cancelDoubtRequest = asyncHandler(async (req, res) => {
  const doubtRequest = await DoubtRequest.findById(req.params.id);
  if (!doubtRequest) {
    return res.status(404).json({ success: false, message: 'Doubt request not found' });
  }

  // Only cancel if still pending or searching
  if (['searching', 'queued', 'dispatching'].includes(doubtRequest.status)) {
    doubtRequest.status = 'cancelled';
    await doubtRequest.save();

    if (doubtRequest.sessionId) {
      const Session = (await import('../models/Session.js')).default;
      await Session.findByIdAndUpdate(doubtRequest.sessionId, { status: 'cancelled' });
    }

    // Release dispatch lock for currently routed teacher
    const activeRoute = doubtRequest.routedTeachers.find(t => t.status === 'pending');
    if (activeRoute) {
      try {
        const { releaseDispatchLock } = await import('../services/presenceService.js');
        await releaseDispatchLock(activeRoute.teacherId);

        // Notify active teacher via Socket.io
        const Teacher = (await import('../models/Teacher.js')).default;
        const teacherDoc = await Teacher.findById(activeRoute.teacherId).select('userId');
        if (teacherDoc && teacherDoc.userId) {
          const room = `user:${teacherDoc.userId.toString()}`;
          const cancelPayload = { requestId: doubtRequest._id.toString() };
          
          const io = getIo();
          if (io) {
            io.to(room).emit('request_expired', cancelPayload);
          }
          const { publishSocketEvent } = await import('../services/redisService.js');
          await publishSocketEvent(room, 'request_expired', cancelPayload);
          console.log(`[CancelDoubtRequest] Emitted request_expired to room user:${teacherDoc.userId.toString()}`);
        }
      } catch (err) {
        console.error('[CancelDoubtRequest] Failed to release lock/notify teacher:', err.message);
      }
    }
  }

  res.json({ success: true, message: 'Doubt request cancelled successfully' });
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
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedClass = student.class || '10';

  let task = await McqTask.findOne({ studentId: student._id, class: selectedClass, date: { $gte: today } });
  if (!task) {
    const subjects = student.subjects?.length ? student.subjects : ['Math', 'Science', 'English'];
    const weakSubjects = student.weakSubjects?.length ? student.weakSubjects : [];
    
    let questions = [];

    // Call LLM to generate exactly 15 customized MCQ questions
    const apiKey = process.env.AICREDITS_API_KEY || 'sk-live-a92f285a97499b113c4bb6ef0098e42ac4a0875f83afb0903512abb77491db96';
    const baseUrl = process.env.AICREDITS_BASE_URL || 'https://aicredits.in/v1';

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an educational assistant that generates daily MCQ test tasks for students. Generate exactly 15 MCQ questions in JSON format. The response must be a valid JSON array containing exactly 15 objects with the following schema:
[
  {
    "subject": "string",
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": 0/1/2/3 (index of correct option),
    "explanation": "string"
  }
]`
            },
            {
              role: 'user',
              content: `Generate exactly 15 multiple choice questions for a Class ${selectedClass} student.
The student takes the following subjects: ${subjects.join(', ')}.
The student's weak subjects are: ${weakSubjects.join(', ')}. Please weight the questions to focus more (approx 50-60%) on these weak subjects so they can practice and improve.
Return ONLY a valid JSON array, do not wrap in markdown or backticks.`
            }
          ],
          max_tokens: 2000
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        const replyText = responseData.choices?.[0]?.message?.content || '';
        let cleaned = replyText.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          questions = parsed.slice(0, 15);
        }
      }
    } catch (err) {
      console.error("Failed to generate MCQs using LLM:", err.message);
    }

    // Fallback if LLM fails or returns invalid format
    if (questions.length < 15) {
      questions = [];
      for (let i = 0; i < 15; i++) {
        const subj = weakSubjects.length && i % 2 === 0
          ? weakSubjects[Math.floor(Math.random() * weakSubjects.length)]
          : subjects[i % subjects.length];
        questions.push({
          subject: subj,
          question: `Practice ${subj} problem ${i + 1} for Class ${selectedClass}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: Math.floor(Math.random() * 4),
          explanation: `Practice makes perfect. Solution for question ${i + 1}`,
        });
      }
    }

    task = await McqTask.create({
      studentId: student._id,
      class: selectedClass,
      date: today,
      questions,
      timerSeconds: 1200,
    });
  }

  // Calculate completed days for this week (Sun-Sat)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const completedTasks = await McqTask.find({
    studentId: student._id,
    status: 'completed',
    completedAt: { $gte: startOfWeek }
  });

  const completedDays = completedTasks.map(t => new Date(t.completedAt).getDay());

  // Fetch Class Leaderboard
  const leaderboard = await Student.find({ class: student.class })
    .sort({ totalPoints: -1 })
    .limit(10)
    .select('fullName nickname totalPoints streak avatarUrl');

  res.json({
    success: true,
    data: task,
    streak: student.streak || 0,
    completedDays,
    leaderboard
  });
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

  // Streak logic
  const lastActive = student.lastActiveDate;
  const now = new Date();
  if (!lastActive) {
    student.streak = 1;
  } else {
    const lastDate = new Date(lastActive);
    lastDate.setHours(0, 0, 0, 0);
    const todayDate = new Date(now);
    todayDate.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      student.streak += 1;
    } else if (diffDays > 1) {
      student.streak = 1;
    }
  }
  student.lastActiveDate = now;
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

  // ── 24-hour cooldown gate (matches frontend timer) ──
  if (student.lastSpinDate) {
    const diffMs = Date.now() - new Date(student.lastSpinDate).getTime();
    const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours
    if (diffMs < cooldownMs) {
      const secondsRemaining = Math.ceil((cooldownMs - diffMs) / 1000);
      return res.status(400).json({
        success: false,
        message: `Spin Wheel is locked! Come back in ${Math.ceil(secondsRemaining / 3600)} hours`,
        secondsLeft: secondsRemaining,
      });
    }
  }

  const now = new Date();
  student.lastSpinDate = now;

  if (rewardType === 'POINTS') {
    student.totalPoints += (amount || 0);
    student.wallet.totalPoints += (amount || 0);
    student.wallet.balance += (amount || 0);
    await logStudentPointsTransaction(req.user._id, amount, 'bonus', 'Lucky Spin Wheel Reward');
  } else if (rewardType === 'CREDITS') {
    student.wallet.aiCredits += (amount || 0);
    await logStudentPointsTransaction(req.user._id, amount, 'bonus', `Lucky Spin Wheel Reward (${amount} AI Credits)`);
  }
  // TRY_AGAIN and OFF rewards just record the spin date, no credit given
  
  student.markModified('wallet');
  await student.save();
  res.json({ success: true, message: rewardType === 'TRY_AGAIN' ? 'Better luck next time!' : `Successfully claimed ${amount} ${rewardType}`, data: student });
});

export const rechargeWallet = asyncHandler(async (req, res) => {
  const { amount, points, aiCredits, humanChatCredits, redeemedPoints } = req.body;
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // Update wallet values (points cannot be bought; only aiCredits and humanChatCredits are bought)
  student.wallet.balance = (student.wallet.balance || 0) + (amount || 0);
  
  if (redeemedPoints) {
    student.wallet.totalPoints = Math.max(0, student.wallet.totalPoints - redeemedPoints);
    student.totalPoints = Math.max(0, student.totalPoints - redeemedPoints);
  }
  
  if (aiCredits) student.wallet.aiCredits = (student.wallet.aiCredits || 0) + aiCredits;
  if (humanChatCredits) student.wallet.humanChatCredits = (student.wallet.humanChatCredits || 0) + humanChatCredits;

  student.markModified('wallet');
  await student.save();

  // Create wallet transaction for recharge
  await WalletTransaction.create({
    userId: req.user._id,
    role: 'student',
    points: 0,
    amount: amount || 0,
    earningType: 'purchase',
    description: `Recharge: Bought ${aiCredits || 0} AI / ${humanChatCredits || 0} Doubt Credits`,
  });

  // Create wallet transaction for redeemed points
  if (redeemedPoints) {
    await WalletTransaction.create({
      userId: req.user._id,
      role: 'student',
      points: -redeemedPoints,
      amount: 0,
      earningType: 'redeem',
      description: `Redeemed points discount for recharge`,
    });
  }

  res.json({ success: true, message: 'Recharge successful!', data: student });
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

export const getAiChatHistory = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const { sessionId } = req.query;
  const filter = { studentId: student._id };
  if (sessionId) {
    filter.sessionId = sessionId;
  }

  const history = await AiChatMessage.find(filter)
    .sort({ createdAt: 1 })
    .limit(100);

  res.json({ success: true, data: history });
});

export const getAiChatSessions = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const sessions = await AiChatMessage.aggregate([
    { $match: { studentId: student._id } },
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: '$sessionId',
        firstMsgText: { $first: '$text' },
        createdAt: { $first: '$createdAt' }
      }
    },
    { $sort: { createdAt: -1 } }
  ]);

  res.json({ success: true, data: sessions });
});

export const deleteAiChatSession = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const { sessionId } = req.params;
  await AiChatMessage.deleteMany({ studentId: student._id, sessionId });

  res.json({ success: true, message: 'Session deleted successfully' });
});

export const clearAllAiChatHistory = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  await AiChatMessage.deleteMany({ studentId: student._id });

  res.json({ success: true, message: 'All chat history cleared successfully' });
});

export const submitAiChatQuery = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  // Enforce credits check
  const currentCredits = student.wallet?.aiCredits ?? 0;
  if (currentCredits <= 0) {
    return res.status(403).json({
      success: false,
      message: 'Insufficient AI credits. Please recharge your wallet.'
    });
  }

  const { query, sessionId } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, message: 'Query is required' });
  }

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Session ID is required' });
  }

  // Get image URL if uploaded or passed directly in body
  let imageUrl = null;
  if (req.file) {
    imageUrl = getFileUrl(req.file.filename, 'profiles');
  } else if (req.body.imageUrl || req.body.image) {
    imageUrl = req.body.imageUrl || req.body.image;
  }

  // Fetch recent history for memory inside current session (last 6 messages to reduce token size and input tokens)
  const pastMessages = await AiChatMessage.find({ studentId: student._id, sessionId })
    .sort({ createdAt: -1 })
    .limit(6);
  
  // Format history for OpenAI API
  const messagesContext = [];
  
  // System instructions - enforce NO LATEX
  messagesContext.push({
    role: 'system',
    content: `You are VLM AI Tutor, a helpful and friendly educational assistant. Help the student ${student.fullName} with step-by-step solutions to math, science, or other textbook problems. 
    
    IMPORTANT INSTRUCTION: Format all math expressions, formulas, and equations in clean, readable plain text using standard keyboard characters (e.g. use ^ for power like x^2, * for multiplication, and simple text formatting). DO NOT use raw LaTeX formatting indicators like \\( , \\) , \\[ , or \\] under any circumstances.`
  });

  // Add history in chronological order
  const orderedHistory = pastMessages.reverse();
  for (const msg of orderedHistory) {
    messagesContext.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  }

  // Choose model and format query content
  const model = imageUrl ? 'gpt-4o' : 'gpt-4o-mini';
  
  if (imageUrl) {
    messagesContext.push({
      role: 'user',
      content: [
        { type: 'text', text: query },
        { type: 'image_url', image_url: { url: imageUrl } }
      ]
    });
  } else {
    messagesContext.push({
      role: 'user',
      content: query
    });
  }

  // Make request to aicredits.in API
  const apiKey = process.env.AICREDITS_API_KEY || 'sk-live-a92f285a97499b113c4bb6ef0098e42ac4a0875f83afb0903512abb77491db96';
  const baseUrl = process.env.AICREDITS_BASE_URL || 'https://aicredits.in/v1';

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messagesContext,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AICredits API error:', errText);
      return res.status(500).json({ success: false, message: 'AI Tutor failed to respond' });
    }

    const responseData = await response.json();
    const replyText = responseData.choices?.[0]?.message?.content || '';
    const usage = responseData.usage || { prompt_tokens: 0, completion_tokens: 0 };

    // Calculate credits to deduct
    let costUsd = 0;
    if (model === 'gpt-4o') {
      costUsd = (usage.prompt_tokens * 0.0000025) + (usage.completion_tokens * 0.0000100);
    } else {
      costUsd = (usage.prompt_tokens * 0.000000150) + (usage.completion_tokens * 0.000000600);
    }
    const creditsUsed = Math.max(1, Math.ceil(costUsd * 10000));

    console.log(`AI Chat cost: ${costUsd} USD -> Deducting ${creditsUsed} credits. Current balance: ${currentCredits}`);

    // Deduct credits from student
    student.wallet.aiCredits = Math.max(0, currentCredits - creditsUsed);
    student.markModified('wallet');
    await student.save();

    // Save message logs
    const userMsg = await AiChatMessage.create({
      studentId: student._id,
      sessionId,
      sender: 'user',
      text: query,
      image: imageUrl || undefined,
      tokensUsed: usage.prompt_tokens,
      creditsDeducted: 0
    });

    const aiMsg = await AiChatMessage.create({
      studentId: student._id,
      sessionId,
      sender: 'ai',
      text: replyText,
      tokensUsed: usage.completion_tokens,
      creditsDeducted: creditsUsed
    });

    res.json({
      success: true,
      data: {
        userMessage: userMsg,
        aiMessage: aiMsg,
        aiCredits: student.wallet.aiCredits,
        creditsDeducted: creditsUsed
      }
    });

  } catch (apiErr) {
    console.error('AI chat processing error:', apiErr);
    res.status(500).json({ success: false, message: 'AI Tutor connection failed' });
  }
});

export const getStudentStats = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const { timeframe } = req.query;
  let dateFilter = {};

  if (timeframe === 'month') {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    dateFilter = { createdAt: { $gte: monthAgo } };
  } else if (timeframe === 'year') {
    const yearAgo = new Date();
    yearAgo.setDate(yearAgo.getDate() - 365);
    dateFilter = { createdAt: { $gte: yearAgo } };
  } else {
    // default: week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter = { createdAt: { $gte: weekAgo } };
  }

  // Get student's subjects list or fall back to default
  const subjectsList = (student.subjects && student.subjects.length > 0)
    ? student.subjects
    : ["Mathematics", "Science", "English", "Social Science"];

  const subjectProgress = [];
  let totalProgress = 0;

  for (const sub of subjectsList) {
    // Count resolved sessions in this subject for this student
    const resolvedSessionsCount = await Session.countDocuments({
      studentId: student._id,
      subject: new RegExp(`^${sub}$`, 'i'),
      isResolved: true,
      ...dateFilter
    });

    // Baseline progress (e.g. 50%) + 10% for each resolved doubt (max 100%)
    // Add a deterministic offset based on the character length of the subject name
    const nameOffset = (sub.length * 3) % 25;
    const progress = Math.min(100, 50 + nameOffset + (resolvedSessionsCount * 10));

    subjectProgress.push({
      name: sub,
      progress
    });
    totalProgress += progress;
  }

  const overallProgress = subjectProgress.length > 0
    ? Math.round(totalProgress / subjectProgress.length)
    : 0;

  res.json({
    success: true,
    data: {
      overallProgress,
      subjectProgress
    }
  });
});

const getAccumulatedActiveSeconds = async (studentId) => {
  const result = await StudentUsage.aggregate([
    { $match: { studentId: studentId } },
    { $group: { _id: null, total: { $sum: "$totalActiveSeconds" } } }
  ]);
  return result[0]?.total || 0;
};

export const submitUsageHeartbeat = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // Get dynamic activeSeconds parameter from req.body with a fallback of 60 seconds
  const activeSeconds = parseInt(req.body.activeSeconds || '60', 10);

  // Get current date normalized to UTC midnight
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // Find or create daily StudentUsage document
  let usage = await StudentUsage.findOne({ studentId: student._id, date: today });
  if (!usage) {
    usage = new StudentUsage({
      studentId: student._id,
      date: today,
      totalActiveMinutes: 0,
      totalActiveSeconds: 0,
      loginCount: 1,
      sessions: [{
        loginAt: now,
        device: req.headers['user-agent'] || 'Web',
        platform: 'WebApp'
      }],
    });
  }

  // Increment active seconds dynamically
  usage.totalActiveSeconds = (usage.totalActiveSeconds || 0) + activeSeconds;
  usage.totalActiveMinutes = Math.floor(usage.totalActiveSeconds / 60);
  usage.lastSeen = now;
  await usage.save();

  // Get accumulated active seconds of all time
  const totalActiveSeconds = await getAccumulatedActiveSeconds(student._id);
  const activeSecondsSinceSpin = totalActiveSeconds - (student.lastSpinActiveSeconds || 0);

  res.json({
    success: true,
    totalActiveSeconds: usage.totalActiveSeconds,
    activeSecondsSinceLastSpin: activeSecondsSinceSpin,
    canSpin: activeSecondsSinceSpin >= 7200, // 2 hours = 7200 seconds
  });
});

export const deductSessionCredits = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  // Deduct 10 credits
  const creditsToDeduct = 10;
  student.wallet.humanChatCredits = Math.max(0, (student.wallet.humanChatCredits || 0) - creditsToDeduct);
  await student.save();

  res.json({
    success: true,
    message: 'Credits deducted successfully',
    remainingCredits: student.wallet.humanChatCredits
  });
});
