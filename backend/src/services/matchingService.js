import Teacher from '../models/Teacher.js';
import AdminSettings from '../models/AdminSettings.js';
import { TEACHER_STATUS } from '../config/constants.js';

const DEFAULT_WEIGHTS = {
  subject: 25,
  class: 20,
  language: 15,
  board: 10,
  online: 20,
  slot: 10,
  rating: 15,
  responseSpeed: 10,
  completionRate: 10,
  preferred: 30,
  adminPriority: 20,
};

export const findMatchingTeachers = async ({
  subject, class: cls, language, board, preferredTeacherId, limit = 4,
}) => {
  const settings = await AdminSettings.findOne({ key: 'matching_weights' });
  const weights = settings?.value || DEFAULT_WEIGHTS;
  const maxTeachers = parseInt(process.env.MAX_TEACHERS_PER_REQUEST || '4', 10);

  const query = {
    isApproved: true,
    applicationStatus: TEACHER_STATUS.APPROVED,
    availabilityStatus: 'online',
    subjects: subject,
    classes: cls,
    languages: language,
  };
  if (board) query.boards = board;

  let teachers = await Teacher.find(query).populate('userId', 'status');

  teachers = teachers.filter((t) => t.userId?.status === 'active');

  if (preferredTeacherId) {
    const preferred = teachers.find((t) => t._id.toString() === preferredTeacherId);
    if (preferred) {
      const others = teachers.filter((t) => t._id.toString() !== preferredTeacherId);
      teachers = [preferred, ...others];
    }
  }

  teachers.sort((a, b) => {
    const scoreA = calculateScore(a, weights, preferredTeacherId);
    const scoreB = calculateScore(b, weights, preferredTeacherId);
    return scoreB - scoreA;
  });

  return teachers.slice(0, limit || maxTeachers);
};

const calculateScore = (teacher, weights, preferredId) => {
  let score = 0;
  score += (teacher.metrics?.rating || 0) * (weights.rating / 5);
  score += (teacher.metrics?.responseSpeed || 0) * (weights.responseSpeed / 100);
  score += (teacher.metrics?.completionRate || 0) * (weights.completionRate / 100);
  score += (teacher.adminPriority || 0) * (weights.adminPriority / 10);
  if (preferredId && teacher._id.toString() === preferredId) {
    score += weights.preferred;
  }
  if (teacher.availabilityStatus === 'online') score += weights.online;
  return score;
};
