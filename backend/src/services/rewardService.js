import WalletTransaction from '../models/WalletTransaction.js';
import Teacher from '../models/Teacher.js';
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

  teacher.wallet.totalPoints += points;
  teacher.wallet.withdrawableBalance += pointsToInr(points);
  teacher.metrics.todayEarnings += pointsToInr(points);
  await teacher.save();

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

export const calculateSessionEarning = async (sessionType, durationMinutes, rating = 0) => {
  const rates = await getRates();
  let points = 0;

  switch (sessionType) {
    case 'audio':
      points = rates.perMinuteAudio * durationMinutes;
      break;
    case 'video':
      points = rates.perMinuteVideo * durationMinutes;
      break;
    case 'chat':
      points = rates.perChat;
      break;
    case 'doubt':
      points = rates.perDoubt;
      break;
    default:
      points = 0;
  }

  if (rating >= 4) points += rates.ratingBonus;
  return points;
};

export { getRates };
