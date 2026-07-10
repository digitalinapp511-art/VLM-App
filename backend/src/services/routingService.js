import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import AdminSettings from '../models/AdminSettings.js';
import { getRedisClient } from './redisService.js';

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

/**
 * Cache/update teacher availability state inside Redis.
 * Key: `teachers:online` holds set of active/online teacher IDs.
 */
export const updateTeacherOnlineStatus = async (teacherId, isOnline) => {
  try {
    const redis = getRedisClient();
    const key = 'teachers:online';
    if (isOnline) {
      await redis.sAdd(key, teacherId.toString());
    } else {
      await redis.sRem(key, teacherId.toString());
    }
  } catch (err) {
    console.error('[Redis Cache] Failed to update teacher online status:', err.message);
  }
};

/**
 * Perform query filtering and sorting for matched online/active teachers.
 * Prioritizes favorite teachers matching the criteria, then sorts by weight calculation.
 */
export const findMatchingTeachers = async ({
  studentId, subject, class: cls, language, board, preferredTeacherId
}) => {
  let onlineTeacherIds = [];
  try {
    const redis = getRedisClient();
    // Use the correct key that presenceService maintains
    onlineTeacherIds = await redis.sMembers('teachers:available');
    console.log(`[RoutingService] Redis teachers:available set has ${onlineTeacherIds.length} teacher(s)`);
  } catch (err) {
    console.error('[Redis Cache] sMembers query failed, falling back to DB lookup:', err.message);
  }

  // Build query — no applicationStatus gate here since teacher being in Redis
  // already means they went through teacher_online validation.
  const query = {};

  // If Redis has online teachers, only pull those.
  // Otherwise, fallback to DB availabilityStatus.
  if (onlineTeacherIds.length > 0) {
    query._id = { $in: onlineTeacherIds };
  } else {
    query.availabilityStatus = 'online';
  }

  // Filter by subject, class and board matches if provided
  if (subject && subject.toLowerCase() !== 'general') {
    const s = subject.toLowerCase();
    let pattern;
    if (s === 'math' || s === 'maths' || s === 'mathematics') {
      pattern = '^(math|maths|mathematics)$';
    } else {
      pattern = `^${s}$`;
    }
    query.subjects = { $in: [new RegExp(pattern, 'i')] };
  }
  if (cls) {
    const clean = cls.toString().replace(/\s+/g, '');
    const classMatchValues = [];
    const rangeMatch = clean.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      // Already a range like "11-12" — include the range itself + each individual
      const lo = parseInt(rangeMatch[1], 10);
      const hi = parseInt(rangeMatch[2], 10);
      classMatchValues.push(clean);
      for (let i = lo; i <= hi; i++) classMatchValues.push(String(i));
    } else {
      const clsNum = parseInt(clean.replace(/\D/g, ''), 10);
      if (clsNum) {
        let group = null;
        if (clsNum >= 1 && clsNum <= 5)   group = '1-5';
        else if (clsNum >= 6 && clsNum <= 8)   group = '6-8';
        else if (clsNum >= 9 && clsNum <= 10)  group = '9-10';
        else if (clsNum >= 11 && clsNum <= 12) group = '11-12';
        // Include both group range AND individual number
        if (group) classMatchValues.push(group);
        classMatchValues.push(String(clsNum));
      }
    }
    if (classMatchValues.length) {
      query.classes = { $in: classMatchValues };
    }
  }
  if (board) {
    query.boards = { $in: [new RegExp(`^${board}$`, 'i')] };
  }

  let teachers = await Teacher.find(query).populate('userId', 'status');

  // Filter only active users
  teachers = teachers.filter((t) => t.userId?.status === 'active');

  // Load weights config
  const settings = await AdminSettings.findOne({ key: 'matching_weights' });
  const weights = settings?.value || DEFAULT_WEIGHTS;

  // Intersect with Student's Favorite Teachers list if studentId is provided
  let favoriteTeacherIds = [];
  if (studentId) {
    const student = await Student.findById(studentId).select('favoriteTeachers');
    if (student && student.favoriteTeachers) {
      favoriteTeacherIds = student.favoriteTeachers.map(id => id.toString());
    }
  }

  // Calculate scores & rank
  teachers.sort((a, b) => {
    const isFavA = favoriteTeacherIds.includes(a._id.toString());
    const isFavB = favoriteTeacherIds.includes(b._id.toString());

    // Strict priority: Fav gets additional booster score
    let scoreA = calculateScore(a, weights, preferredTeacherId);
    let scoreB = calculateScore(b, weights, preferredTeacherId);

    if (isFavA) scoreA += 100;
    if (isFavB) scoreB += 100;

    return scoreB - scoreA;
  });

  return teachers;
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
  return score;
};
