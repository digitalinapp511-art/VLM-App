/**
 * dispatchWorker.js
 * ─────────────────────────────────────────────────────────────────────────────
 * BullMQ Worker for sequential teacher dispatch.
 *
 * Job types:
 *   DISPATCH_START   – kick off a new dispatch round for a request
 *   DISPATCH_NEXT    – move to the next teacher after a 15s timeout OR after
 *                      teacher declines early
 *
 * Flow:
 *   1. Load DoubtRequest from MongoDB
 *   2. Verify it is still in SEARCHING status
 *   3. Acquire a short processing lock (prevent duplicate concurrent cycles)
 *   4. Release previous teacher's dispatch lock if provided
 *   5. Call MatchingService to get next eligible teacher (excluding tried ones)
 *   6. Acquire Redis dispatch lock on that teacher (atomic, skips if locked)
 *   7. Emit Socket.io new_request to that teacher's room
 *   8. Update DoubtRequest.routedTeachers with the target
 *   9. Schedule DISPATCH_NEXT job with 15 second delay
 *
 * If no teacher is found: emit request_missed to student.
 */

import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import DoubtRequest from '../models/DoubtRequest.js';
import Session from '../models/Session.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import { getIo } from '../socket/index.js';
import { findEligibleTeachers } from '../services/matchingService.js';
import { acquireDispatchLock, releaseDispatchLock } from '../services/presenceService.js';
import { createNotification } from '../services/notificationService.js';
import { dispatchQueue } from '../queues/dispatchQueue.js';
import { publishSocketEvent, getRedisClient as getMainRedisClient } from '../services/redisService.js';

// BullMQ requires a dedicated IORedis connection with maxRetriesPerRequest: null
const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});

const DISPATCH_TIMEOUT_MS = 15000; // 15 seconds per teacher
const PROCESSING_LOCK_TTL = 5;     // 5s — prevents duplicate concurrent cycles

const emitToTeacher = async (teacherUserId, requestPayload) => {
  const room = `user:${teacherUserId.toString()}`;

  // PRIMARY: Emit directly via Socket.io (works in single-process, guaranteed)
  const io = getIo();
  if (io) {
    io.to(room).emit('new_request', requestPayload);
    console.log(`[DispatchWorker] Direct socket.io emit → room "${room}" event "new_request"`);
  } else {
    console.warn('[DispatchWorker] getIo() returned null — falling back to Redis Pub/Sub only');
  }

  // SECONDARY: Also publish via Redis Pub/Sub (for future multi-server setups)
  try {
    await publishSocketEvent(room, 'new_request', requestPayload);
  } catch (err) {
    console.error('[DispatchWorker] Redis Pub/Sub publish failed:', err.message);
  }
};

/**
 * Build the payload sent to teacher.
 */
const buildRequestPayload = (request, student, timerExpiresAt) => {
  // Calculate rate based on class (Classes 1-8: 3, 9-10: 4, 11-12: 5)
  const classStr = request.class || student?.class || '10';
  const classNum = parseInt(String(classStr).replace(/\D/g, ''), 10) || 10;
  let ratePerMinute = 4;
  if (classNum >= 1 && classNum <= 8) ratePerMinute = 3;
  else if (classNum >= 11 && classNum <= 12) ratePerMinute = 5;

  return {
    requestId: request._id.toString(),
    sessionId: request.sessionId?.toString() || '',
    sessionType: request.sessionType || 'chat',
    subject: request.subject,
    class: request.class,
    board: request.board,
    language: request.language,
    doubtText: request.doubtText,
    doubtImage: request.doubtImage || null,
    topic: request.topic || null,
    timerExpiresAt: timerExpiresAt.toISOString(),
    ratePerMinute,
    student: {
      name: student?.fullName || student?.firstName || 'Student',
      nickname: student?.nickname || '',
      class: student?.class || '',
      photo: student?.profilePhoto || null,
      planStatus: student?.subscription?.status || 'free',
    },
  };
};

/**
 * Core dispatch logic: find next eligible teacher and notify them.
 * Returns { dispatched: true, teacherId } if dispatched, false if no teacher found.
 */
const dispatchToNextTeacher = async (request, student, triedTeacherIds) => {
  const eligible = await findEligibleTeachers({
    subject: request.subject,
    class: request.class,
    board: request.board,
    language: request.language,
    studentId: request.studentId,
    excludeIds: triedTeacherIds,
  });

  console.log(`[DispatchWorker] findEligibleTeachers returned ${eligible.length} teacher(s) for request ${request._id}`);

  if (!eligible.length) return false;

  // Try each candidate in order until we acquire a lock (prevent double-dispatch)
  for (const teacher of eligible) {
    const locked = await acquireDispatchLock(teacher._id, request._id);
    if (!locked) {
      console.log(`[DispatchWorker] Teacher ${teacher._id} already locked — skipping`);
      continue;
    }

    const timerExpiresAt = new Date(Date.now() + DISPATCH_TIMEOUT_MS);

    // Add teacher to routedTeachers array
    await DoubtRequest.updateOne(
      { _id: request._id },
      {
        $push: {
          routedTeachers: {
            teacherId: teacher._id,
            status: 'pending',
            timerExpiresAt,
          },
        },
        $set: { status: 'searching' },
      }
    );

    // Emit to teacher via Redis Pub/Sub → Socket.io
    const payload = buildRequestPayload(request, student, timerExpiresAt);
    const teacherUserIdStr = (teacher.userId?._id || teacher.userId || '').toString();
    await emitToTeacher(teacherUserIdStr, payload);

    // Push DB notification
    const teacherUserId = teacher.userId._id?.toString() || teacher.userId?.toString();
    await createNotification(
      teacherUserId,
      'new_request',
      'New Doubt Request',
      `${request.subject} – Class ${request.class}`,
      { sessionId: request.sessionId, doubtRequestId: request._id }
    );

    console.log(`[DispatchWorker] ✅ Dispatched request ${request._id} → Teacher ${teacher._id} (${teacher.firstName}) via room user:${teacherUserIdStr}`);
    return { dispatched: true, teacherId: teacher._id };
  }

  return false;
};

/**
 * Start the BullMQ dispatch worker.
 */
export const startDispatchWorker = () => {
  const worker = new Worker('doubt-dispatch', async (job) => {
    const { requestId, previousTeacherId } = job.data;

    console.log(`[DispatchWorker] Processing job "${job.name}" for request ${requestId}`);

    // ── Load request ─────────────────────────────────────────────────────────
    const request = await DoubtRequest.findById(requestId);
    if (!request) {
      console.log(`[DispatchWorker] Request ${requestId} not found — skipping.`);
      return;
    }

    // ── Guard: only process if still in searchable state ─────────────────────
    if (!['searching', 'queued', 'dispatching'].includes(request.status)) {
      console.log(`[DispatchWorker] Request ${requestId} has status "${request.status}" — stopping dispatch.`);
      return;
    }

    // ── Deduplication lock — prevent two concurrent cycles for the same request ──
    // (can happen when teacher declines AND the 15s timer fires simultaneously)
    const redis = getMainRedisClient();
    const processingKey = `dispatch:processing:${requestId}`;
    const lockAcquired = await redis.set(processingKey, '1', { NX: true, EX: PROCESSING_LOCK_TTL });
    if (!lockAcquired) {
      console.log(`[DispatchWorker] Request ${requestId} already being processed — skipping duplicate job.`);
      return;
    }

    try {
      // ── Guard: only process timeout if it matches the current active pending teacher ──
      if (job.name.startsWith('dispatch-timeout') && previousTeacherId) {
        const activeRoute = request.routedTeachers[request.routedTeachers.length - 1];
        if (activeRoute && activeRoute.status === 'pending') {
          if (activeRoute.teacherId.toString() !== previousTeacherId.toString()) {
            console.log(`[DispatchWorker] Timeout job is stale (currently routed to ${activeRoute.teacherId}, not ${previousTeacherId}) — skipping.`);
            return;
          }
        }
      }

      // ── Load student ────────────────────────────────────────────────────────
      const student = await Student.findById(request.studentId).lean();

      // ── Build list of already-tried teacher IDs ─────────────────────────────
      const triedIds = (request.routedTeachers || [])
        .filter(rt => ['pending', 'rejected', 'missed', 'accepted'].includes(rt.status))
        .map(rt => rt.teacherId.toString());

      console.log(`[DispatchWorker] Request ${requestId} — tried teachers: [${triedIds.join(', ') || 'none'}]`);

      // ── Release any existing lock on the previous teacher ───────────────────
      // (handles DISPATCH_NEXT after 15s timeout or after teacher declines)
      if (previousTeacherId) {
        await releaseDispatchLock(previousTeacherId);
        console.log(`[DispatchWorker] Released dispatch lock for prev teacher ${previousTeacherId}`);
        
        try {
          const prevTeacherDoc = await Teacher.findById(previousTeacherId).select('userId');
          if (prevTeacherDoc && prevTeacherDoc.userId) {
            const prevTeacherUserId = prevTeacherDoc.userId.toString();
            const room = `user:${prevTeacherUserId}`;
            const expirePayload = { requestId: requestId.toString() };
            
            // Direct emit via socket.io
            const io = getIo();
            if (io) {
              io.to(room).emit('request_expired', expirePayload);
            }
            // Emit via Redis pub/sub
            await publishSocketEvent(room, 'request_expired', expirePayload);
            console.log(`[DispatchWorker] Emitted request_expired to room user:${prevTeacherUserId} for request ${requestId}`);
          }
        } catch (e) {
          console.error('[DispatchWorker] Failed to emit request_expired to previous teacher:', e.message);
        }
      }

      // ── Attempt dispatch ────────────────────────────────────────────────────
      const result = await dispatchToNextTeacher(request, student, triedIds);

      if (!result) {
        // No eligible teacher found — mark request as missed
        console.log(`[DispatchWorker] ❌ No eligible teacher for request ${requestId}. Marking missed.`);

        await DoubtRequest.updateOne(
          { _id: requestId, status: { $in: ['searching', 'dispatching', 'queued'] } },
          {
            $set: { status: 'missed' },
            $currentDate: { updatedAt: true },
          }
        );

        await Session.updateOne(
          { _id: request.sessionId },
          { $set: { status: 'missed' } }
        );

        if (student) {
          const studentRoom = `user:${student.userId?.toString()}`;
          const missedPayload = {
            requestId: requestId,
            sessionId: request.sessionId?.toString(),
            message: 'No teacher available right now. Please try again.',
          };
          // Direct emit (primary)
          const io = getIo();
          if (io) io.to(studentRoom).emit('request_missed', missedPayload);
          // Redis Pub/Sub (secondary)
          await publishSocketEvent(studentRoom, 'request_missed', missedPayload);
        }
        return;
      }

      // ── Schedule DISPATCH_NEXT after 15 seconds ─────────────────────────────
      // This is the fallback timer — if the teacher doesn't respond within 15s,
      // the system moves on. If they decline early, declineDoubtRequest triggers
      // an immediate dispatch via enqueueDispatchNext.
      await dispatchQueue.add(
        `dispatch-timeout-${requestId}-${Date.now()}`,
        {
          requestId,
          previousTeacherId: result.teacherId?.toString(),
        },
        { delay: DISPATCH_TIMEOUT_MS }
      );

      console.log(`[DispatchWorker] ⏱ 15s timeout job scheduled for request ${requestId}`);

    } finally {
      // Always release the processing lock so the next job can run
      await redis.del(processingKey);
    }
  }, {
    connection,
    concurrency: 10,
  });

  worker.on('failed', (job, err) => {
    console.error(`[DispatchWorker] Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('[DispatchWorker] Worker error:', err.message);
  });

  console.log('[DispatchWorker] Started (doubt-dispatch queue)');
  return worker;
};

