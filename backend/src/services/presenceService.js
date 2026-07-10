/**
 * presenceService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all teacher real-time state stored in Redis.
 *
 * Redis Key Schema:
 *   teacher:state:<teacherId>    → Hash {status, socketId, updatedAt}
 *   teacher:pending:<teacherId>  → String (requestId they are currently being dispatched)
 *   teachers:available           → Set of teacherIds with status ONLINE
 *
 * Teacher states: ONLINE | OFFLINE | BUSY | IN_SESSION | BREAK | DO_NOT_DISTURB
 * Only ONLINE teachers are returned by getAvailableTeacherIds().
 */

import { getRedisClient } from './redisService.js';

const AVAILABLE_SET = 'teachers:available';
const TEACHER_STATE_PREFIX = 'teacher:state:';
const TEACHER_PENDING_PREFIX = 'teacher:pending:';
const TEACHER_SOCKET_PREFIX = 'teacher:socket:';
const STATE_TTL = 60 * 60 * 4; // 4 hours - auto expire stale entries

export const TEACHER_PRESENCE = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  BUSY: 'BUSY',
  IN_SESSION: 'IN_SESSION',
  BREAK: 'BREAK',
  DO_NOT_DISTURB: 'DO_NOT_DISTURB',
};

/**
 * Set a teacher's full presence state.
 */
export const setTeacherState = async (teacherId, status, socketId = null) => {
  try {
    const redis = getRedisClient();
    const id = teacherId.toString();
    const key = `${TEACHER_STATE_PREFIX}${id}`;

    await redis.hSet(key, {
      status,
      socketId: socketId || '',
      updatedAt: Date.now().toString(),
    });
    await redis.expire(key, STATE_TTL);

    // Maintain the available set
    if (status === TEACHER_PRESENCE.ONLINE) {
      await redis.sAdd(AVAILABLE_SET, id);
    } else {
      await redis.sRem(AVAILABLE_SET, id);
    }
  } catch (err) {
    console.error('[PresenceService] setTeacherState error:', err.message);
  }
};

/**
 * Get teacher's current presence state.
 */
export const getTeacherState = async (teacherId) => {
  try {
    const redis = getRedisClient();
    const key = `${TEACHER_STATE_PREFIX}${teacherId.toString()}`;
    return await redis.hGetAll(key);
  } catch (err) {
    console.error('[PresenceService] getTeacherState error:', err.message);
    return null;
  }
};

/**
 * Get all teacherIds that are currently ONLINE.
 */
export const getAvailableTeacherIds = async () => {
  try {
    const redis = getRedisClient();
    return await redis.sMembers(AVAILABLE_SET);
  } catch (err) {
    console.error('[PresenceService] getAvailableTeacherIds error:', err.message);
    return [];
  }
};

/**
 * Count of teachers currently online.
 */
export const getOnlineTeacherCount = async () => {
  try {
    const redis = getRedisClient();
    return await redis.sCard(AVAILABLE_SET);
  } catch (err) {
    return 0;
  }
};

/**
 * Mark teacher as being dispatched a specific request (atomic, prevents double dispatch).
 * Returns true if lock was acquired, false if teacher is already occupied.
 */
export const acquireDispatchLock = async (teacherId, requestId) => {
  try {
    const redis = getRedisClient();
    const key = `${TEACHER_PENDING_PREFIX}${teacherId.toString()}`;
    // NX = only set if not exists (atomic)
    const result = await redis.set(key, requestId.toString(), { NX: true, EX: 20 });
    return result === 'OK';
  } catch (err) {
    console.error('[PresenceService] acquireDispatchLock error:', err.message);
    return false;
  }
};

/**
 * Release dispatch lock for a teacher.
 */
export const releaseDispatchLock = async (teacherId) => {
  try {
    const redis = getRedisClient();
    const key = `${TEACHER_PENDING_PREFIX}${teacherId.toString()}`;
    await redis.del(key);
  } catch (err) {
    console.error('[PresenceService] releaseDispatchLock error:', err.message);
  }
};

/**
 * Check if teacher currently has a dispatch lock.
 */
export const hasDispatchLock = async (teacherId) => {
  try {
    const redis = getRedisClient();
    const key = `${TEACHER_PENDING_PREFIX}${teacherId.toString()}`;
    const val = await redis.get(key);
    return !!val;
  } catch (err) {
    return false;
  }
};

/**
 * Store teacher socketId mapping.
 */
export const setTeacherSocketId = async (teacherId, socketId) => {
  try {
    const redis = getRedisClient();
    const key = `${TEACHER_SOCKET_PREFIX}${teacherId.toString()}`;
    await redis.set(key, socketId, { EX: STATE_TTL });
  } catch (err) {
    console.error('[PresenceService] setTeacherSocketId error:', err.message);
  }
};

/**
 * Remove all Redis state for a teacher on disconnect.
 */
export const clearTeacherPresence = async (teacherId) => {
  try {
    const redis = getRedisClient();
    const id = teacherId.toString();
    await redis.del(`${TEACHER_STATE_PREFIX}${id}`);
    await redis.del(`${TEACHER_SOCKET_PREFIX}${id}`);
    await redis.sRem(AVAILABLE_SET, id);
    // Do NOT clear pending lock — let it expire naturally to avoid race conditions
  } catch (err) {
    console.error('[PresenceService] clearTeacherPresence error:', err.message);
  }
};
