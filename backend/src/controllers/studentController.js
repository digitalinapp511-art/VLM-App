import Student from '../models/Student.js';
import Plan from '../models/Plan.js';
import Session from '../models/Session.js';
import DoubtRequest from '../models/DoubtRequest.js';
import McqTask from '../models/McqTask.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { findMatchingTeachers } from '../services/matchingService.js';
import { createNotification } from '../services/notificationService.js';

export const createStudentProfile = asyncHandler(async (req, res) => {
  let student = await Student.findOne({ userId: req.user._id });
  if (student) {
    Object.assign(student, req.body);
    await student.save();
  } else {
    student = await Student.create({ userId: req.user._id, ...req.body });
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
  await student.save();

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

  if (rewardType === 'POINTS') {
    student.totalPoints += amount;
    student.wallet.totalPoints += amount;
    student.wallet.balance += amount;
  } else if (rewardType === 'CREDITS') {
    student.wallet.aiCredits += amount;
  }
  
  await student.save();
  res.json({ success: true, message: `Successfully claimed ${amount} ${rewardType}` });
});
