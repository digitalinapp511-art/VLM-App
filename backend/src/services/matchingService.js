/**
 * matchingService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure matching logic. Has NO knowledge of Socket.io or BullMQ.
 * Returns an ordered array of eligible Teacher documents.
 *
 * Filtering order (hard gates — teacher must pass ALL):
 *   1. Teacher is in Redis AVAILABLE set (online + not busy)
 *   2. applicationStatus === 'approved'
 *   3. Teacher not currently locked (no pending dispatch)
 *   4. Teacher teaches requested class (group match: "12" → "11-12")
 *   5. Teacher teaches requested subject
 *   6. Teacher supports requested board
 *   7. (Optional) Teacher supports requested language
 *
 * Prioritization:
 *   - Student's favourite teachers move to front of list
 *   - Within each tier: sort by rating desc
 */

import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { getAvailableTeacherIds, hasDispatchLock } from './presenceService.js';

/**
 * For a given student class string, return ALL values that a matching teacher
 * could have stored in their classes[] array.
 *
 * Teacher UI lets them pick ranges like "11-12", "9-10", "6-8", "1-5".
 * But some teachers may also have individual numbers ("11", "12") stored.
 * We return ALL possible representations so both formats match.
 *
 * Examples:
 *   "12"        → ["11-12", "12"]
 *   "11"        → ["11-12", "11"]
 *   "9"         → ["9-10", "9"]
 *   "Class 11"  → ["11-12", "11"]
 *   "11-12"     → ["11-12", "11", "12"]  (already a range — expand both)
 */
const getClassMatchValues = (cls) => {
  if (!cls) return [];
  const clean = cls.toString().replace(/\s+/g, '');

  // Student class is already in range format (e.g. "11-12") — expand it
  const rangeMatch = clean.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const lo = parseInt(rangeMatch[1], 10);
    const hi = parseInt(rangeMatch[2], 10);
    const group = clean; // "11-12"
    const individuals = [];
    for (let i = lo; i <= hi; i++) {
      individuals.push(String(i));
      individuals.push(`${i}th`);
      individuals.push(`Class ${i}`);
      individuals.push(`Class${i}`);
    }
    return [group, `Class ${group}`, `Class${group}`, ...individuals];
  }

  // Extract numeric class
  const n = parseInt(clean.replace(/\D/g, ''), 10);
  if (!n) return [cls.toString(), `Class ${cls}`, `Class${cls}`];

  let group = null;
  if (n >= 1 && n <= 5)  group = '1-5';
  else if (n >= 6 && n <= 8)  group = '6-8';
  else if (n >= 9 && n <= 10) group = '9-10';
  else if (n >= 11 && n <= 12) group = '11-12';

  const matches = [
    String(n),
    `${n}th`,
    `Class ${n}`,
    `Class${n}`
  ];

  if (group) {
    matches.push(group);
    matches.push(`Class ${group}`);
    matches.push(`Class${group}`);
    const parts = group.split('-');
    matches.push(`${parts[0]}th-${parts[1]}th`);
  }

  return [...new Set(matches)];
};

/**
 * Find an ordered list of eligible teachers for the given request parameters.
 *
 * @param {object} params
 * @param {string} params.subject      - Subject name e.g. "maths"
 * @param {string} params.class        - Student class e.g. "12"
 * @param {string} params.board        - Board e.g. "CBSE"
 * @param {string} [params.language]   - Preferred language (optional filter)
 * @param {string} [params.mode]       - Session mode: chat|audio|video
 * @param {string} [params.studentId]  - Used to load favourite teachers
 * @param {string[]} [params.excludeIds] - TeacherIds already tried in this round
 * @returns {Promise<Array>}           - Ordered array of Teacher documents
 */
export const findEligibleTeachers = async ({
  subject,
  class: cls,
  board,
  language,
  studentId,
  excludeIds = [],
}) => {
  // ── Step 1: Get online teacher IDs ────────────────────────────────────────
  // Primary source: Redis available set (real-time)
  // Fallback: DB availabilityStatus=online (handles server restarts / Redis flush)
  let onlineIds = await getAvailableTeacherIds();

  if (!onlineIds.length) {
    console.log('[MatchingService] Redis available set is empty — falling back to DB availabilityStatus lookup');
    const dbOnlineTeachers = await Teacher.find({
      availabilityStatus: 'online',
    }).select('_id').lean();
    onlineIds = dbOnlineTeachers.map(t => t._id.toString());
    console.log(`[MatchingService] DB fallback found ${onlineIds.length} online teacher(s)`);
  }

  if (!onlineIds.length) return [];

  // Filter out excluded (already tried) teachers
  const excludeSet = new Set(excludeIds.map(String));
  const candidateIds = onlineIds.filter(id => !excludeSet.has(id));
  if (!candidateIds.length) return [];

  // ── Step 2: Build MongoDB query ────────────────────────────────────────────
  // Note: applicationStatus is NOT checked here — if teacher is in Redis available
  // set, they were put there by teacher_online which already validates approval.
  const query = {
    _id: { $in: candidateIds },
    availabilityStatus: 'online',
  };

  const classMatchValues = getClassMatchValues(cls);
  if (classMatchValues.length) query.classes = { $in: classMatchValues };
  console.log(`[MatchingService] Class filter: student class='${cls}' → matching against: [${classMatchValues.join(', ')}]`);

  if (subject && subject.toLowerCase() !== 'general') {
    const s = subject.toLowerCase().trim();

    // Synonym groups — any of these stored values match any of these search terms
    const synonymGroups = [
      ['math', 'maths', 'mathematics'],
      ['science', 'general science'],
      ['english', 'english language', 'english literature'],
      ['sst', 'social science', 'social studies', 'history', 'geography', 'civics'],
      ['hindi', 'hindi language', 'hindi literature'],
      ['accounts', 'accountancy', 'accounting'],
      ['computer', 'computer science', 'computers', 'it', 'information technology'],
    ];

    const synonymGroup = synonymGroups.find(g => g.includes(s));
    if (synonymGroup) {
      // Match any synonym in the group
      const patterns = synonymGroup.map(w => `^${w}$`).join('|');
      query.subjects = { $in: [new RegExp(patterns, 'i')] };
    } else {
      // Partial match — e.g. "Physics" matches "Applied Physics"
      query.subjects = { $in: [new RegExp(s, 'i')] };
    }
    console.log(`[MatchingService] Subject filter: '${subject}' → pattern used for subjects query`);
  }

  if (board) {
    // Board is a soft filter — teachers with no boards set can match any board
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { boards: { $in: [new RegExp(`^${board}$`, 'i')] } },
        { boards: { $size: 0 } },
        { boards: { $exists: false } },
      ],
    });
  }

  if (language) {
    const l = language.toLowerCase().trim();

    // Map common language formats
    const langSynonyms = [
      ['english', 'en', 'eng'],
      ['hindi', 'hi', 'hin'],
      ['urdu', 'ur', 'urd'],
      ['bengali', 'bn', 'ben'],
      ['tamil', 'ta', 'tam'],
      ['telugu', 'te', 'tel'],
      ['marathi', 'mr', 'mar'],
      ['gujarati', 'gu', 'guj'],
    ];

    const langGroup = langSynonyms.find(g => g.includes(l));
    let patterns = '';
    if (langGroup) {
      patterns = langGroup.map(w => `^${w}$`).join('|');
    } else {
      patterns = `^${l}$`;
    }

    // Language is a SOFT filter — skip if no language set on teacher
    // Teachers with empty languages array can teach in any language
    query.$or = [
      { languages: { $in: [new RegExp(patterns, 'i')] } },
      { languages: { $size: 0 } },
      { languages: { $exists: false } },
    ];
    console.log(`[MatchingService] Language filter: '${language}' → pattern used for languages query`);
  }

  // ── Step 3: Load from DB ───────────────────────────────────────────────────
  let teachers = await Teacher.find(query)
    .populate('userId', 'status')
    .lean();

  // Log for debugging
  console.log(`[MatchingService] Redis online IDs: ${onlineIds.length}, candidates after exclusions: ${candidateIds.length}, DB matches: ${teachers.length}`);

  // Hard filter: user account must be active
  teachers = teachers.filter(t => t.userId?.status === 'active');

  // ── Step 4: Remove teachers currently locked for another dispatch ──────────
  const lockChecks = await Promise.all(
    teachers.map(t => hasDispatchLock(t._id))
  );
  teachers = teachers.filter((_, i) => !lockChecks[i]);

  console.log(`[MatchingService] After active-user filter + lock check: ${teachers.length} eligible teachers`);

  if (!teachers.length) return [];

  // ── Step 5: Load student favourites ───────────────────────────────────────
  let favouriteIds = new Set();
  if (studentId) {
    const student = await Student.findById(studentId).select('favoriteTeachers').lean();
    if (student?.favoriteTeachers?.length) {
      favouriteIds = new Set(student.favoriteTeachers.map(String));
    }
  }

  // ── Step 6: Sort – favourites first, then by rating desc ──────────────────
  teachers.sort((a, b) => {
    const aFav = favouriteIds.has(a._id.toString()) ? 1 : 0;
    const bFav = favouriteIds.has(b._id.toString()) ? 1 : 0;
    if (bFav !== aFav) return bFav - aFav; // favourites first
    return (b.metrics?.rating || 0) - (a.metrics?.rating || 0); // then rating
  });

  return teachers;
};
