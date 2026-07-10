/**
 * dispatchQueue.js
 * ─────────────────────────────────────────────────────────────────────────────
 * BullMQ Queue definition for the teacher dispatch pipeline.
 *
 * Separate from doubtQueue.js (legacy) to avoid conflicts.
 * This is the single queue the dispatchWorker reads from.
 */

import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});

export const dispatchQueue = new Queue('doubt-dispatch', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 200,
    attempts: 1, // Each dispatch job is one attempt; retries are done via DISPATCH_NEXT jobs
  },
});

/**
 * Enqueue the FIRST dispatch job for a new DoubtRequest.
 * Called from studentController immediately after creating the DoubtRequest.
 */
export const enqueueDispatch = async (requestId) => {
  const idStr = requestId.toString();
  await dispatchQueue.add(
    `dispatch-start-${idStr}`,
    { requestId: idStr },
    {
      // Use a timestamp-based jobId so re-submissions are not silently deduplicated
      jobId: `start-${idStr}-${Date.now()}`,
    }
  );
  console.log(`[DispatchQueue] Enqueued dispatch START for request ${idStr}`);
};

/**
 * Immediately enqueue the NEXT dispatch cycle for a request.
 * Called when a teacher declines early — no need to wait for the 15s timer.
 * @param {string} requestId  - The DoubtRequest._id
 * @param {string} previousTeacherId - Teacher who just declined (lock to release)
 */
export const enqueueDispatchNext = async (requestId, previousTeacherId) => {
  const idStr = requestId.toString();
  await dispatchQueue.add(
    `dispatch-next-immediate-${idStr}-${Date.now()}`,
    { requestId: idStr, previousTeacherId: previousTeacherId?.toString() },
    { delay: 0 }
  );
  console.log(`[DispatchQueue] Enqueued immediate DISPATCH_NEXT for request ${idStr} (prev teacher: ${previousTeacherId})`);
};

