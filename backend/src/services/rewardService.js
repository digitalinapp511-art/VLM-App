import WalletTransaction from '../models/WalletTransaction.js';
import Teacher from '../models/Teacher.js';
import TeacherMetrics from '../models/TeacherMetrics.js';
import Student from '../models/Student.js';
import AdminSettings from '../models/AdminSettings.js';
import { pointsToInr } from '../utils/helpers.js';

const getRates = async () => {
  const settings = await AdminSettings.find({ category: 'payout' });
  const rates = {};
  settings.forEach((s) => { rates[s.key] = s.value; });
  return {
    perMinuteAudio: rates.audio_rate || 5,
    perMinuteVideo: rates.video_rate || 10,
    perDoubt: rates.doubt_rate || 20,
    perChat: rates.chat_rate || 15,
    perLiveClass: rates.live_class_rate || 50,
    perShortVideo: rates.short_video_rate || 100,
    ratingBonus: rates.rating_bonus || 10,
    streakBonus: rates.streak_bonus || 5,
    missedPenalty: rates.missed_penalty || -10,
    rejectPenalty: rates.reject_penalty || -5,
  };
};

export const creditTeacher = async (teacherId, earningType, points, description, sessionId = null) => {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw new Error('Teacher not found');

  // Ensure metrics doc exists
  let metrics = await TeacherMetrics.findOne({ teacherId });
  if (!metrics) metrics = await TeacherMetrics.create({ teacherId });

  const todayStr = new Date().toISOString().split('T')[0];
  if (metrics.todayEarningsDate !== todayStr) {
    metrics.todayEarnings = 0;
    metrics.todayEarningsDate = todayStr;
  }

  const isSessionEarning = ['session', 'chat', 'audio', 'video', 'doubt'].includes(earningType);

  if (isSessionEarning) {
    const inrAmount = points;
    teacher.wallet.withdrawableBalance += inrAmount;
    metrics.todayEarnings += inrAmount;
    await teacher.save();
    await metrics.save();

    return WalletTransaction.create({
      userId: teacher.userId,
      role: 'teacher',
      type: 'credit',
      earningType,
      points: 0,
      inrAmount,
      description,
      sessionId,
      status: 'credited',
    });
  } else {
    teacher.wallet.totalPoints += points;
    teacher.wallet.withdrawableBalance += pointsToInr(points);
    metrics.todayEarnings += pointsToInr(points);
    await teacher.save();
    await metrics.save();

    return WalletTransaction.create({
      userId: teacher.userId,
      role: 'teacher',
      type: 'credit',
      earningType,
      points,
      inrAmount: pointsToInr(points),
      description,
      sessionId,
      status: 'credited',
    });
  }
};

export const debitTeacher = async (teacherId, earningType, points, description) => {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw new Error('Teacher not found');

  teacher.wallet.totalPoints = Math.max(0, teacher.wallet.totalPoints - points);
  await teacher.save();

  return WalletTransaction.create({
    userId: teacher.userId,
    role: 'teacher',
    type: 'debit',
    earningType,
    points,
    inrAmount: pointsToInr(points),
    description,
    status: 'credited',
  });
};

export const creditStudent = async (studentId, points, description, earningType = 'bonus') => {
  const student = await Student.findById(studentId);
  if (!student) throw new Error('Student not found');

  student.wallet.totalPoints += points;
  student.totalPoints += points;
  await student.save();

  return WalletTransaction.create({
    userId: student.userId,
    role: 'student',
    type: 'credit',
    earningType,
    points,
    inrAmount: pointsToInr(points),
    description,
    status: 'credited',
  });
};

export const calculateSessionEarning = async (session, durationMinutes, rating = 0) => {
  const type = typeof session === 'string' ? session : session?.type;
  const cls = typeof session === 'object' ? session?.class : null;

  const rates = await getRates();
  let points = 0;

  // Determine rate per minute based on student class
  let classRate = 4; // default (Class 9-10)
  if (cls) {
    const classNum = parseInt(cls.replace(/\D/g, ''), 10);
    if (classNum >= 1 && classNum <= 8) {
      classRate = 3;
    } else if (classNum >= 9 && classNum <= 10) {
      classRate = 4;
    } else if (classNum >= 11 && classNum <= 12) {
      classRate = 5;
    }
  }

  switch (type) {
    case 'audio':
    case 'video':
    case 'chat':
    case 'ai':
      points = classRate * durationMinutes;
      break;
    case 'doubt':
      points = rates.perDoubt;
      break;
    default:
      points = 0;
  }

  return points;
};

export { getRates };
