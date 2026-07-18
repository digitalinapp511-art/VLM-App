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
import CashbackOffer from '../models/CashbackOffer.js';
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

export const getOrCreateStudentProfile = async (userId) => {
  let student = await Student.findOne({ userId });
  if (!student) {
    const user = await User.findById(userId);
    const vlmStudentId = await generateVlmId('STU');

    // Derive a sensible firstName from email or mobile
    const rawName = user?.email ? user.email.split('@')[0] : (user?.mobile || 'Student');
    const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    student = await Student.create({
      userId,
      vlmStudentId,
      email: user?.email || '',
      mobile: user?.mobile || '',
      firstName,
      class: '10',
      board: 'CBSE',
      subjects: ['Math', 'Science', 'English', 'Social Science', 'Hindi'],
    });
  }
  return student;
};

export const createStudentProfile = asyncHandler(async (req, res) => {
  // Validate DOB if provided
  if (req.body.dateOfBirth) {
    const birthDate = new Date(req.body.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (birthDate.getFullYear() < today.getFullYear() - 100 || birthDate > today) {
      return res.status(400).json({ success: false, message: 'Invalid Date of Birth' });
    }
    if (age < 8) {
      return res.status(400).json({ success: false, message: 'Student must be at least 8 years old' });
    }
  }

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
    authUser.isMobileVerified = false;
    authUserUpdated = true;
  }
  if (req.body.email && !authUser.email) {
    const cleanEmail = req.body.email.trim().toLowerCase();
    const duplicateUser = await User.findOne({ email: cleanEmail });
    if (duplicateUser && duplicateUser._id.toString() !== authUser._id.toString()) {
      return res.status(400).json({ success: false, message: 'This email address is already linked to another account' });
    }
    authUser.email = cleanEmail;
    authUser.isEmailVerified = false;
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
    // Sync contact from User record only if not already present
    if (!student.email) student.email = authUser.email;
    if (!student.mobile) student.mobile = authUser.mobile;
    await student.save();
  } else {
    const vlmStudentId = await generateVlmId('STU');
    student = await Student.create({
      userId: req.user._id,
      vlmStudentId,
      email: req.body.email || authUser.email,
      mobile: req.body.mobile || authUser.mobile,
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
    .populate('userId', 'username email mobile isEmailVerified isMobileVerified');
  if (!student) return res.json({ success: true, data: null });

  const studentObj = student.toObject();
  // NOTE: activeSecondsSinceLastSpin is deliberately NOT computed here (expensive
  // aggregate). It is fetched separately by the Spinner / Dashboard screens.
  res.json({ success: true, data: studentObj });
});export const getDashboard = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id })
    .select('firstName nickname streak totalPoints mcqPoints lastSpinActiveSeconds lastSpinDate wallet.totalPoints class board profilePhoto');
  
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
        mcqPoints: student.mcqPoints || 0,
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
  let query = { isActive: true };
  if (cls) {
    const classNum = parseInt(String(cls).replace(/\D/g, ''), 10);
    if (!isNaN(classNum)) {
      let classRange = '9-10';
      if (classNum >= 1 && classNum <= 8) {
        classRange = '1-8';
      } else if (classNum >= 9 && classNum <= 10) {
        classRange = '9-10';
      } else if (classNum >= 11 && classNum <= 12) {
        classRange = '11-12';
      }
      query.class = classRange;
    } else {
      query.class = cls;
    }
  }
  const plans = await Plan.find(query).sort({ sortOrder: 1 });
  res.json({ success: true, data: plans });
});

export const activateTrial = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  let plan;
  try {
    if (planId) {
      plan = await Plan.findById(planId);
    }
  } catch(e) {
    plan = null;
  }

  const studentClassStr = student.class || '10';
  const classNum = parseInt(studentClassStr.replace(/\D/g, ''), 10) || 10;

  // Fallback to active monthly plan for this class if no specific plan was found
  if (!plan) {
    let classRange = '9-10';
    if (classNum >= 1 && classNum <= 8) {
      classRange = '1-8';
    } else if (classNum >= 9 && classNum <= 10) {
      classRange = '9-10';
    } else if (classNum >= 11 && classNum <= 12) {
      classRange = '11-12';
    }
    plan = await Plan.findOne({ class: classRange, duration: 'monthly', isActive: true });
  }

  // Dynamic or fallback values
  const trialDays = plan ? (plan.trialDays !== undefined ? plan.trialDays : 3) : 3;
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  let aiCredits = 2000;
  if (plan && plan.benefits?.aiCredits !== undefined) {
    aiCredits = plan.benefits.aiCredits;
  } else {
    if (classNum >= 1 && classNum <= 8) {
      aiCredits = 1000;
    } else if (classNum >= 9 && classNum <= 10) {
      aiCredits = 2000;
    } else if (classNum >= 11 && classNum <= 12) {
      aiCredits = 3000;
    }
  }

  student.subscription = {
    planId: plan?._id || null,
    status: 'trial',
    trialEndsAt,
    autopayEnabled: true,
  };
  student.wallet.aiCredits = aiCredits;
  student.wallet.humanChatCredits = plan ? (plan.benefits?.humanChatCredits || 0) : 0;
  student.wallet.audioMinutes = plan ? (plan.benefits?.audioMinutes || 0) : 0;
  student.wallet.videoMinutes = plan ? (plan.benefits?.videoMinutes || 0) : 0;
  
  // Award points & coins configured by admin in the plan
  if (plan) {
    if (plan.grantPoints) {
      student.totalPoints = (student.totalPoints || 0) + plan.grantPoints;
    }
    if (plan.grantCoins) {
      student.wallet.totalPoints = (student.wallet.totalPoints || 0) + plan.grantCoins;
    }
  }

  await student.save();

  res.json({ success: true, message: 'Subscription activated', data: student });
});

export const submitDoubt = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const { subject, class: cls, board, language, sessionType, doubtText, doubtImage, topic, preferredTeacherId } = req.body;

  const finalClass = cls || student.class;
  const finalBoard = board || student.board;
  const finalLanguage = language || student.preferredLanguage || 'English';

  const typeStr = sessionType || 'chat';
  if (typeStr !== 'ai') {
    const studentClassStr = finalClass || '10';
    const classNum = parseInt(studentClassStr.replace(/\D/g, ''), 10) || 10;
    let rate = 4;
    if (classNum >= 1 && classNum <= 8) rate = 3;
    else if (classNum >= 9 && classNum <= 10) rate = 4;
    else if (classNum >= 11 && classNum <= 12) rate = 5;

    const currentCredits = student.wallet?.humanChatCredits || 0;
    if (currentCredits < rate) {
      return res.status(400).json({
        success: false,
        message: `Insufficient doubt credits. You need at least ${rate} credits to start a session. Current balance: ${currentCredits} credits.`
      });
    }
  }

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

  if (sessionType !== 'ai') {
    const studentClassStr = cls || '10';
    const classNum = parseInt(studentClassStr.replace(/\D/g, ''), 10) || 10;
    let rate = 4;
    if (classNum >= 1 && classNum <= 8) rate = 3;
    else if (classNum >= 9 && classNum <= 10) rate = 4;
    else if (classNum >= 11 && classNum <= 12) rate = 5;

    const currentCredits = student.wallet?.humanChatCredits || 0;
    if (currentCredits < rate) {
      return res.status(400).json({
        success: false,
        message: `Insufficient doubt credits. You need at least ${rate} credits to start a session. Current balance: ${currentCredits} credits.`
      });
    }
  }

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
  const student = await getOrCreateStudentProfile(req.user._id);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedClass = student.class || '10';

  // Only return existing task — NO generation here
  let task = await McqTask.findOne({ studentId: student._id, class: selectedClass, date: { $gte: today } });

  // Auto-detect and delete dummy/placeholder tasks (so generateDailyMcq will create real ones)
  if (task && task.status === 'pending') {
    const hasDummyQuestions = task.questions?.some(q =>
      (q.question?.startsWith('Practice ') && q.options?.[0] === 'Option A') ||
      q.options?.[0] === 'Option A'
    );
    if (hasDummyQuestions) {
      await McqTask.deleteOne({ _id: task._id });
      task = null;
    }
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
    .sort({ mcqPoints: -1 })
    .limit(10)
    .select('firstName lastName nickname totalPoints mcqPoints streak profilePhoto');

  res.json({
    success: true,
    data: task || null,           // null means not generated yet today
    taskReady: !!task,            // tells frontend whether to skip generation step
    streak: student.streak || 0,
    completedDays,
    leaderboard
  });
});

// Called on-demand when student clicks "Start Daily MCQ"
export const generateDailyMcq = asyncHandler(async (req, res) => {
  const student = await getOrCreateStudentProfile(req.user._id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedClass = student.class || '10';

  // If today's task already exists and has real questions, return it immediately
  let task = await McqTask.findOne({ studentId: student._id, class: selectedClass, date: { $gte: today } });

  // Delete dummy tasks so we regenerate with real AI
  if (task && task.status === 'pending') {
    const hasDummyQuestions = task.questions?.some(q =>
      (q.question?.startsWith('Practice ') && q.options?.[0] === 'Option A') ||
      q.options?.[0] === 'Option A'
    );
    if (hasDummyQuestions) {
      await McqTask.deleteOne({ _id: task._id });
      task = null;
    }
  }

  if (task) {
    // Already generated today — return it directly without calling AI
    return res.json({ success: true, data: task });
  }

  // ── AI GENERATION ──
  const subjects = student.subjects?.length ? student.subjects : ['Math', 'Science', 'English', 'Social Science', 'Hindi'];

  // Fetch incorrect MCQ answers from the last 3 days to personalize questions
  const startOf3DaysAgo = new Date();
  startOf3DaysAgo.setDate(startOf3DaysAgo.getDate() - 3);
  startOf3DaysAgo.setHours(0, 0, 0, 0);

  const pastThreeDaysTasks = await McqTask.find({
    studentId: student._id,
    status: 'completed',
    completedAt: { $gte: startOf3DaysAgo }
  });

  const wrongQuestions = [];
  for (const t of pastThreeDaysTasks) {
    if (t.answers?.length) {
      for (const ans of t.answers) {
        if (!ans.isCorrect) {
          const questionDetail = t.questions[ans.questionIndex];
          if (questionDetail) {
            wrongQuestions.push({
              subject: questionDetail.subject,
              question: questionDetail.question,
              correctAnswerText: questionDetail.options[questionDetail.correctAnswer],
              explanation: questionDetail.explanation
            });
          }
        }
      }
    }
  }

  let questions = [];
  let lastError = null;

  const { getIntegrationConfig } = await import('../services/integrationService.js');
  const geminiConfig = await getIntegrationConfig('integration_gemini_ai');
  const apiKey = geminiConfig.GEMINI_API_KEY;
  const baseUrl = geminiConfig.GEMINI_BASE_URL;

  console.log(`[MCQ] Generating for student ${student._id} class ${selectedClass} | model: ${geminiConfig.GEMINI_MODEL} | key: ${apiKey?.slice(0,10)}`);

  // Summarize weak subjects from wrong answers instead of embedding raw JSON
  const weakSubjects = [...new Set(wrongQuestions.map(q => q.subject).filter(Boolean))].slice(0, 5);
  const weakSubjectsNote = weakSubjects.length
    ? `Focus more on these subjects where the student struggled recently: ${weakSubjects.join(', ')}.`
    : '';

  const prompt = `Generate exactly 20 multiple choice questions for a Class ${selectedClass} student studying: ${subjects.join(', ')}.
${weakSubjectsNote}
Return ONLY a raw JSON array (no markdown, no explanation) in this exact format:
[{"subject":"Math","question":"What is 2+2?","options":["3","4","5","6"],"correctAnswer":1,"explanation":"2+2=4"},...]
Generate all 20 questions now.`;

  // Helper to call Gemini and extract questions
  const callGemini = async (promptText) => {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: geminiConfig.GEMINI_MODEL,
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 4096
      })
    });

    const rawText = await response.text();
    let responseData;
    try { responseData = JSON.parse(rawText); } catch { return { error: `Non-JSON response: ${rawText.slice(0,100)}` }; }

    if (!response.ok) return { error: `HTTP ${response.status}: ${rawText.slice(0, 200)}` };
    if (responseData.error) return { error: responseData.error.message || JSON.stringify(responseData.error) };

    const content = responseData.choices?.[0]?.message?.content || '';
    if (!content) {
      console.error('[MCQ] Empty content from Gemini. Full response:', JSON.stringify(responseData).slice(0, 400));
      return { error: `Empty content, finish_reason=${responseData.choices?.[0]?.finish_reason}` };
    }

    let cleaned = content.trim();
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```[\s\S]*$/, '').trim();
    const arrayStart = cleaned.indexOf('[');
    const arrayEnd = cleaned.lastIndexOf(']');
    if (arrayStart !== -1 && arrayEnd > arrayStart) cleaned = cleaned.slice(arrayStart, arrayEnd + 1);

    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) return { questions: parsed };
      return { error: 'Parsed but got empty array' };
    } catch (e) {
      return { error: `JSON parse failed: ${e.message} | snippet: ${cleaned.slice(0, 100)}` };
    }
  };

  // Try up to 3 times with slight prompt variation on retry
  for (let attempt = 1; attempt <= 3; attempt++) {
    const promptText = `Create exactly 20 school exam MCQ questions for Class ${selectedClass}.
Subjects: ${subjects.join(', ')}.${weakSubjectsNote ? '\n' + weakSubjectsNote : ''}
Output ONLY a JSON array of 20 objects. No extra text. Format:
[{"subject":"Physics","question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]`;

    console.log(`[MCQ] Attempt ${attempt}/3 for student ${student._id}`);
    const result = await callGemini(promptText).catch(err => ({ error: err.message }));

    if (result.questions?.length > 0) {
      questions = result.questions.slice(0, 20);
      console.log(`[MCQ] ✅ Generated ${questions.length} questions on attempt ${attempt}`);
      break;
    }

    lastError = result.error || 'Unknown error';
    console.error(`[MCQ] Attempt ${attempt} failed:`, lastError);
    if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * attempt)); // backoff
  }

  if (questions.length < 1) {
    return res.status(503).json({
      success: false,
      message: 'AI could not generate questions right now. Please try again in a moment.',
      retryable: true,
      debug: process.env.NODE_ENV === 'development' ? lastError : undefined,
    });
  }

  task = await McqTask.create({
    studentId: student._id,
    class: selectedClass,
    date: today,
    questions,
    timerSeconds: 1500,
  });

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
  student.mcqPoints += (score * 10); // MCQ Points specifically for leaderboard calculation
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

export const getMcqHistory = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const tasks = await McqTask.find({
    studentId: student._id,
    status: 'completed'
  }).sort({ completedAt: -1 });

  res.json({ success: true, data: tasks });
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const { type = 'Class' } = req.query; // 'Class', 'City', 'State', or 'Global'
  const query = {};

  if (type === 'Class') {
    query.class = student.class;
  } else if (type === 'City') {
    if (student.city) query.city = student.city;
  } else if (type === 'State') {
    if (student.state) query.state = student.state;
  }

  const list = await Student.find(query)
    .sort({ mcqPoints: -1, totalPoints: -1 })
    .limit(50)
    .select('firstName lastName nickname totalPoints mcqPoints streak profilePhoto class city state');

  res.json({
    success: true,
    data: list
  });
});

export const getStudentResources = asyncHandler(async (req, res) => {
  const student = await getOrCreateStudentProfile(req.user._id);

  const { default: StudyResource } = await import('../models/StudyResource.js');

  // Normalize class to support all variations (e.g. "Class 12", "12", "12th")
  const classNum = student.class?.replace(/\D/g, '') || '10';
  const classVariants = [
    classNum,
    `${classNum}th`,
    `Class ${classNum}`,
    `Class${classNum}`,
    `class-${classNum}`
  ];

  const query = {
    className: { $in: classVariants },
    visibility: { $in: ['public', 'active'] },
    status: 'active',
    $or: [
      { pdfUrl: { $exists: true, $ne: '' } },
      { videoUrl: { $exists: true, $ne: '' } },
      { fileUrl: { $exists: true, $ne: '' } }
    ]
  };

  if (req.query.subject) {
    query.subject = { $regex: new RegExp(`^${req.query.subject}$`, 'i') };
  }

  if (req.query.type) {
    const t = req.query.type.toLowerCase();
    if (t === 'note' || t === 'notes' || t === 'pdf-notes') query.type = 'note';
    else if (t === 'video' || t === 'videos') query.type = 'video';
    else if (t === 'pyq' || t === 'pyqs') query.type = 'pyq';
    else query.type = t;
  }

  const resources = await StudyResource.find(query).sort({ createdAt: -1 });

  const mapped = resources.map(r => ({
    _id: r._id,
    title: r.title,
    board: r.board,
    className: r.className,
    subject: r.subject,
    chapterName: r.chapterName,
    topic: r.topic,
    description: r.description,
    type: r.type,
    resourceType: r.type === 'video' ? 'video' : 'note',
    pdfUrl: r.pdfUrl || r.fileUrl,
    videoUrl: r.videoUrl || r.fileUrl,
    fileUrl: r.fileUrl,
    thumbnailUrl: r.thumbnailUrl,
    createdAt: r.createdAt
  }));

  res.json({ success: true, data: mapped });
});

export const getStudentSubjects = asyncHandler(async (req, res) => {
  const student = await getOrCreateStudentProfile(req.user._id);
  const { default: StudyResource } = await import('../models/StudyResource.js');

  const classNum = student.class?.replace(/\D/g, '') || '10';
  const classVariants = [
    classNum,
    `${classNum}th`,
    `Class ${classNum}`,
    `Class${classNum}`,
    `class-${classNum}`
  ];

  const subjects = await StudyResource.distinct('subject', {
    className: { $in: classVariants },
    visibility: { $in: ['public', 'active'] },
    status: 'active',
    $or: [
      { pdfUrl: { $exists: true, $ne: '' } },
      { videoUrl: { $exists: true, $ne: '' } },
      { fileUrl: { $exists: true, $ne: '' } }
    ]
  });

  res.json({ success: true, data: subjects });
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
  const student = await Student.findOne({ userId: req.user._id });
  
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // Get accumulated active seconds of all time
  const totalActiveSeconds = await getAccumulatedActiveSeconds(student._id);
  const activeSecondsSinceSpin = totalActiveSeconds - (student.lastSpinActiveSeconds || 0);

  // ── Dynamic cooldown gate ──
  if (student.lastSpinDate) {
    const { default: AdminSettings } = await import('../models/AdminSettings.js');
    const cooldownSetting = await AdminSettings.findOne({ key: 'spin_cooldown_hours' });
    const cooldownHours = cooldownSetting ? Number(cooldownSetting.value) || 2 : 2;
    
    const diffMs = Date.now() - new Date(student.lastSpinDate).getTime();
    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    
    if (diffMs < cooldownMs) {
      const secondsRemaining = Math.ceil((cooldownMs - diffMs) / 1000);
      return res.status(400).json({
        success: false,
        message: `Spin Wheel is locked! Come back in ${Math.ceil(secondsRemaining / 3600)} hours`,
        secondsLeft: secondsRemaining,
      });
    }
  }
  // 1. Fetch spin settings from DB
  const { default: AdminSettings } = await import('../models/AdminSettings.js');
  let settings = await AdminSettings.findOne({ key: 'spin_rewards' });
  const rawSegments = settings?.value || [
    { id: 1, name: '10 Coins', probability: 30, color: '#f59e0b', type: 'coins', amount: 10 },
    { id: 2, name: 'Free Chat Session', probability: 20, color: '#3b82f6', type: 'chat_credit', amount: 1 },
    { id: 3, name: 'Better luck next time', probability: 40, color: '#0f172a', type: 'none', amount: 0 },
    { id: 4, name: '50 Coins', probability: 10, color: '#ef4444', type: 'coins', amount: 50 }
  ];

  // Filter out any segment that has been disabled by the admin
  const segments = rawSegments.filter(s => s.isActive !== false);

  // 2. Perform Weighted Random Roll on the Backend
  const totalWeight = segments.reduce((sum, s) => sum + (Number(s.probability) || 0), 0);
  let randomWeight = Math.random() * (totalWeight || 1);
  let winnerIndex = 0;
  
  if (totalWeight > 0) {
    for (let i = 0; i < segments.length; i++) {
      randomWeight -= (Number(segments[i].probability) || 0);
      if (randomWeight <= 0) {
        winnerIndex = i;
        break;
      }
    }
  } else {
    // Equal fallback if total weight is 0
    winnerIndex = Math.floor(Math.random() * segments.length);
  }

  const reward = segments[winnerIndex];
  const amount = reward.amount || 0;
  const rawType = (reward.type || '').toLowerCase();
  
  const isTryAgain = rawType === 'none';

  // 3. Apply reward to student wallet
  const now = new Date();
  student.lastSpinDate = now;
  student.lastSpinActiveSeconds = totalActiveSeconds;

  if (!isTryAgain) {
    if (rawType === 'coins') {
      student.totalPoints += amount;
      student.wallet.totalPoints += amount;
      student.wallet.balance += amount;
      await logStudentPointsTransaction(req.user._id, amount, 'bonus', `Lucky Spin Wheel Reward (${reward.name})`);
    } else if (rawType === 'xp') {
      student.mcqPoints = (student.mcqPoints || 0) + amount;
      await logStudentPointsTransaction(req.user._id, amount, 'bonus', `Lucky Spin Wheel Reward (${reward.name})`);
    } else if (rawType === 'ai_credit') {
      student.wallet.aiCredits += amount;
      await logStudentPointsTransaction(req.user._id, amount, 'bonus', `Lucky Spin Wheel Reward (${reward.name})`);
    } else if (rawType === 'doubt_credit') {
      student.wallet.humanChatCredits = (student.wallet.humanChatCredits || 0) + amount;
      await logStudentPointsTransaction(req.user._id, amount, 'bonus', `Lucky Spin Wheel Reward (${reward.name})`);
    }
  }

  student.markModified('wallet');
  await student.save();

  const customMessage = reward.message || (isTryAgain 
    ? 'Better luck next time! Your daily spin has been used.' 
    : `You just won ${reward.name}!`);

  const customTitle = reward.title || (isTryAgain
    ? 'TRY AGAIN!'
    : 'CONGRATULATIONS!');

  // Return the selected winnerIndex so the frontend spins to exactly this slice!
  res.json({
    success: true,
    message: isTryAgain ? 'Better luck next time!' : `Successfully claimed ${amount} ${rawType}`,
    data: student,
    winnerIndex,
    title: customTitle,
    rewardMessage: customMessage,
    reward: {
      label: reward.name.split(' ')[0] || 'REWARD',
      sub: reward.name.split(' ').slice(1).join(' ').toUpperCase() || '',
      type: reward.type,
      amount: reward.amount,
      value: reward.value || ''
    }
  });
});

export const getStudentSpinSettings = asyncHandler(async (req, res) => {
  const { default: AdminSettings } = await import('../models/AdminSettings.js');
  let settings = await AdminSettings.findOne({ key: 'spin_rewards' });
  let cooldownSetting = await AdminSettings.findOne({ key: 'spin_cooldown_hours' });
  const cooldownHours = cooldownSetting ? cooldownSetting.value : 2; // Default to 2 hours
  
  let rawSegments = settings?.value || [
    { id: 1, name: '10 Coins', probability: 30, color: '#f59e0b', type: 'coins', amount: 10 },
    { id: 2, name: 'Free Chat Session', probability: 20, color: '#3b82f6', type: 'chat_credit', amount: 1 },
    { id: 3, name: 'Better luck next time', probability: 40, color: '#0f172a', type: 'none', amount: 0 },
    { id: 4, name: '50 Coins', probability: 10, color: '#ef4444', type: 'coins', amount: 50 }
  ];

  // Return only the active segments to the student portal
  const activeSegments = rawSegments.filter(s => s.isActive !== false);
  
  res.json({
    success: true,
    data: activeSegments,
    cooldownHours: Number(cooldownHours) || 2
  });
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

  // ── AUTO-CASHBACK: find best applicable active offer ──
  let appliedCashback = 0;
  let cashbackOfferApplied = null;
  if (amount > 0) {
    const now = new Date();
    const offers = await CashbackOffer.find({
      isActive: true,
      minRechargeAmount: { $lte: amount },
      $or: [{ validUntil: null }, { validUntil: { $gte: now } }],
      $or: [{ validFrom: { $lte: now } }],
    }).sort({ minRechargeAmount: -1 }); // best (highest min) offer first

    for (const offer of offers) {
      // Check global usage limit
      if (offer.usageLimit > 0 && offer.usedCount >= offer.usageLimit) continue;

      // Check per-user limit
      if (offer.perUserLimit > 0) {
        const userUsageCount = await WalletTransaction.countDocuments({
          userId: req.user._id,
          'metadata.cashbackOfferId': offer._id,
          earningType: 'cashback',
        });
        if (userUsageCount >= offer.perUserLimit) continue;
      }

      // Calculate cashback amount
      if (offer.cashbackPercent > 0) {
        appliedCashback = Math.round((amount * offer.cashbackPercent) / 100);
        if (offer.maxCashback > 0) appliedCashback = Math.min(appliedCashback, offer.maxCashback);
      } else {
        appliedCashback = offer.cashbackAmount;
      }

      cashbackOfferApplied = offer;
      break; // apply only the best offer
    }

    if (appliedCashback > 0 && cashbackOfferApplied) {
      student.wallet.balance = (student.wallet.balance || 0) + appliedCashback;
      cashbackOfferApplied.usedCount = (cashbackOfferApplied.usedCount || 0) + 1;
      await cashbackOfferApplied.save();
    }
  }

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

  // Create wallet transaction for cashback
  if (appliedCashback > 0 && cashbackOfferApplied) {
    await WalletTransaction.create({
      userId: req.user._id,
      role: 'student',
      points: 0,
      inrAmount: appliedCashback,
      earningType: 'cashback',
      description: `🎉 Cashback: ${cashbackOfferApplied.title} — ₹${appliedCashback} added to your wallet!`,
      metadata: { cashbackOfferId: cashbackOfferApplied._id },
    });

    // Push in-app notification
    await createNotification(req.user._id, 'student', {
      title: '🎉 Cashback Credited!',
      message: `₹${appliedCashback} cashback from "${cashbackOfferApplied.title}" has been added to your wallet.`,
      type: 'reward',
    });
  }

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

  res.json({
    success: true,
    message: appliedCashback > 0
      ? `Recharge successful! ₹${appliedCashback} cashback added 🎉`
      : 'Recharge successful!',
    data: student,
    cashback: appliedCashback > 0 ? {
      amount: appliedCashback,
      offer: cashbackOfferApplied?.title,
    } : null,
  });
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
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  
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

  // Make request to Google Gemini API
  const { getIntegrationConfig } = await import('../services/integrationService.js');
  const geminiConfig = await getIntegrationConfig('integration_gemini_ai');
  const apiKey = geminiConfig.GEMINI_API_KEY;
  const baseUrl = geminiConfig.GEMINI_BASE_URL;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || geminiConfig.GEMINI_MODEL,
        messages: messagesContext,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return res.status(500).json({ success: false, message: 'AI Tutor failed to respond' });
    }

    const responseData = await response.json();
    const replyText = responseData.choices?.[0]?.message?.content || '';
    const usage = responseData.usage || { prompt_tokens: 0, completion_tokens: 0 };
    
    // Deduct 1 flat credit per request for Gemini
    const creditsUsed = 1;

    console.log(`Gemini AI Chat success -> Deducting ${creditsUsed} credit. Current balance: ${currentCredits}`);

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

  const hasNeverSpun = !student.lastSpinDate;
  const canSpin = hasNeverSpun || activeSecondsSinceSpin >= 7200; // 2 hours = 7200 seconds

  res.json({
    success: true,
    totalActiveSeconds: usage.totalActiveSeconds,
    activeSecondsSinceLastSpin: activeSecondsSinceSpin,
    canSpin,
  });
});

export const deductSessionCredits = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const studentClassStr = student.class || '10';
  const classNum = parseInt(studentClassStr.replace(/\D/g, ''), 10) || 10;
  
  let creditsToDeduct = 4; // default
  if (classNum >= 1 && classNum <= 8) {
    creditsToDeduct = 3;
  } else if (classNum >= 9 && classNum <= 10) {
    creditsToDeduct = 4;
  } else if (classNum >= 11 && classNum <= 12) {
    creditsToDeduct = 5;
  }

  student.wallet.humanChatCredits = Math.max(0, (student.wallet.humanChatCredits || 0) - creditsToDeduct);
  await student.save();

  res.json({
    success: true,
    message: `Credits deducted successfully (${creditsToDeduct}/min)`,
    remainingCredits: student.wallet.humanChatCredits
  });
});

export const getActiveBanners = asyncHandler(async (req, res) => {
  const { default: PromoBanner } = await import('../models/PromoBanner.js');
  const { default: AdminSettings } = await import('../models/AdminSettings.js');

  const [banners, rotationSetting] = await Promise.all([
    PromoBanner.find({ isActive: true }).sort({ order: 1 }),
    AdminSettings.findOne({ key: 'banner_rotation_time' })
  ]);

  const rotationTime = rotationSetting?.value ? parseInt(rotationSetting.value, 10) : 6;

  res.json({
    success: true,
    data: banners,
    rotationTime
  });
});

export const getOnboardingSlides = asyncHandler(async (req, res) => {
  const { default: OnboardingSlide } = await import('../models/OnboardingSlide.js');
  const slides = await OnboardingSlide.find({ isActive: true }).sort({ order: 1 });
  res.json({ success: true, data: slides });
});

// Student-facing: get active cashback offers to show on wallet/recharge screen
export const getActiveCashbackOffers = asyncHandler(async (req, res) => {
  const now = new Date();
  const offers = await CashbackOffer.find({
    isActive: true,
    $or: [{ validUntil: null }, { validUntil: { $gte: now } }],
  })
    .select('title description recommendedText minRechargeAmount cashbackAmount cashbackPercent maxCashback')
    .sort({ minRechargeAmount: 1 });

  res.json({ success: true, data: offers });
});

