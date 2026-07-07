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

  // Delete any pending MCQ task for today to force a new customized one matching newly saved subjects
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await McqTask.deleteMany({ studentId: student._id, date: { $gte: today }, status: 'pending' }).catch(() => {});

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

  // Emit socket event to each matched teacher's personal room
  const io = getIo();
  if (io) {
    const requestPayload = {
      requestId: doubtRequest._id.toString(),
      sessionId: session._id.toString(),
      sessionType: sessionType || 'chat',
      subject,
      class: cls || student.class,
      board: board || student.board,
      language: language || student.preferredLanguage,
      doubtText,
      topic,
      timerExpiresAt,
      student: {
        name: student.fullName,
        nickname: student.nickname,
        class: student.class,
        photo: student.profilePhoto,
      },
    };

    for (const teacher of teachers) {
      const targetUserId = teacher.userId._id ? teacher.userId._id.toString() : teacher.userId.toString();
      const roomName = `user:${targetUserId}`;
      const room = io.sockets.adapter.rooms.get(roomName);
      console.log(`Emitting new_request to ${roomName}. Sockets in room:`, room ? room.size : 0);
      console.log('Payload being sent:', JSON.stringify(requestPayload));
      io.to(roomName).emit('new_request', requestPayload);

      // Also persist DB notification
      await createNotification(
        targetUserId,
        'new_request',
        'New Doubt Request',
        `${subject} - Class ${cls || student.class}`,
        { sessionId: session._id, doubtRequestId: doubtRequest._id },
        `/teacher/requests/${doubtRequest._id}`
      );
    }
  } else {
    // Fallback: just send DB notifications
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

  // Emit socket event to each matched teacher's personal room
  const io = getIo();
  if (io) {
    const requestPayload = {
      requestId: doubtRequest._id.toString(),
      sessionId: session._id.toString(),
      sessionType: sessionType || 'chat',
      subject,
      class: cls,
      board,
      language,
      doubtText,
      doubtImage,
      topic,
      timerExpiresAt,
      student: {
        name: student?.fullName || '',
        nickname: student?.nickname || '',
        class: student?.class || '',
        photo: student?.profilePhoto || student?.photo || '',
      },
    };

    for (const teacher of teachers) {
      const targetUserId = teacher.userId._id ? teacher.userId._id.toString() : teacher.userId.toString();
      const roomName = `user:${targetUserId}`;
      const room = io.sockets.adapter.rooms.get(roomName);
      console.log(`Emitting new_request to ${roomName} (image). Sockets in room:`, room ? room.size : 0);
      io.to(roomName).emit('new_request', requestPayload);

      // Also persist DB notification
      await createNotification(
        targetUserId,
        'new_request',
        'New Doubt Request',
        `${subject} - Class ${cls}`,
        { sessionId: session._id, doubtRequestId: doubtRequest._id },
        `/teacher/requests/${doubtRequest._id}`
      );
    }
  } else {
    // Fallback: just send DB notifications
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
