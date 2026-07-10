import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import DoubtRequest from '../models/DoubtRequest.js';
import Session from '../models/Session.js';
import Student from '../models/Student.js';
import { getIo } from '../socket/index.js';
import { createNotification } from '../services/notificationService.js';

const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});

export const doubtQueue = new Queue('doubt-routing', {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
});

// Create worker to process sequential requests
export const startDoubtWorker = () => {
  const worker = new Worker('doubt-routing', async (job) => {
    const { doubtRequestId, currentIndex } = job.data;
    
    const request = await DoubtRequest.findById(doubtRequestId)
      .populate('studentId')
      .populate('sessionId');

    if (!request || request.status !== 'searching') {
      console.log(`[Doubt Worker] Request ${doubtRequestId} is no longer searching (${request?.status || 'deleted'}). Stop routing.`);
      return;
    }

    const routedTeachers = request.routedTeachers || [];
    if (currentIndex >= routedTeachers.length) {
      console.log(`[Doubt Worker] Reached end of candidate list for request ${doubtRequestId}. Marking as missed.`);
      
      // Update DB Statuses
      request.status = 'missed';
      request.routedTeachers.forEach((t) => {
        if (t.status === 'pending') t.status = 'missed';
      });
      await request.save();

      const session = await Session.findById(request.sessionId);
      if (session) {
        session.status = 'missed';
        await session.save();
      }

      // Notify student via socket
      const io = getIo();
      if (io) {
        io.to(`user:${request.studentId._id || request.studentId}`).emit('request_missed', {
          requestId: request._id,
          sessionId: request.sessionId?._id || request.sessionId,
          message: 'No teacher accepted your request. Please try again.',
        });
      }
      return;
    }

    // Identify current target teacher
    const currentTarget = routedTeachers[currentIndex];
    console.log(`[Doubt Worker] Routing request ${doubtRequestId} to teacher ${currentTarget.teacherId} (Candidate ${currentIndex + 1}/${routedTeachers.length})`);
    
    // Set active status in routedTeachers list
    // We update status to 'pending' (or leave it) and save
    await DoubtRequest.updateOne(
      { _id: doubtRequestId, 'routedTeachers.teacherId': currentTarget.teacherId },
      { $set: { 'routedTeachers.$.timerExpiresAt': new Date(Date.now() + 15000) } }
    );

    // Emit Socket request to specific teacher room
    const io = getIo();
    const student = request.studentId;
    
    if (io && student) {
      const requestPayload = {
        requestId: request._id.toString(),
        sessionId: (request.sessionId?._id || request.sessionId).toString(),
        sessionType: request.sessionType || 'chat',
        subject: request.subject,
        class: request.class,
        board: request.board,
        language: request.language,
        doubtText: request.doubtText,
        doubtImage: request.doubtImage,
        topic: request.topic,
        timerExpiresAt: new Date(Date.now() + 15000),
        student: {
          name: student.fullName || student.firstName || '',
          nickname: student.nickname || '',
          class: student.class || '',
          photo: student.profilePhoto || '',
        },
      };

      const targetUserId = currentTarget.teacherId.userId || currentTarget.teacherId;
      // Fetch user ID of teacher to get room name
      const populatedRequest = await DoubtRequest.findById(doubtRequestId).populate({
        path: 'routedTeachers.teacherId',
        select: 'userId'
      });
      const tDoc = populatedRequest.routedTeachers[currentIndex].teacherId;
      const userIdStr = tDoc?.userId ? tDoc.userId.toString() : targetUserId.toString();

      const roomName = `user:${userIdStr}`;
      console.log(`[Doubt Worker] Emitting new_request to ${roomName} for 15s`);
      io.to(roomName).emit('new_request', requestPayload);

      // Create persistence DB Notification
      await createNotification(
        userIdStr,
        'new_request',
        'New Doubt Request (Instant)',
        `${request.subject} - Class ${request.class}`,
        { sessionId: request.sessionId?._id || request.sessionId, doubtRequestId: request._id },
        `/teacher/requests/${request._id}`
      );
    }

    // Schedule next index check job delayed by 15 seconds
    await doubtQueue.add(
      `route-step-${doubtRequestId}-${currentIndex + 1}`,
      { doubtRequestId, currentIndex: currentIndex + 1 },
      { delay: 15000 }
    );
  }, { connection, concurrency: 5 });

  worker.on('failed', (job, err) => {
    console.error(`[Doubt Worker] Job ${job?.id} failed:`, err.message);
  });
};
