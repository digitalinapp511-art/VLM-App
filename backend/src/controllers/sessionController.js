/**
 * sessionController.js
 * Handles Agora token generation and session lifecycle management.
 */
import pkg from 'agora-token';
const { RtcTokenBuilder } = pkg;
import Session from '../models/Session.js';
import DoubtRequest from '../models/DoubtRequest.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { emitSessionAccepted, emitSessionDeclined } from '../socket/index.js';
import { createNotification } from '../services/notificationService.js';

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

/**
 * Generate an Agora RTC token for a session.
 * GET /api/student/sessions/:sessionId/agora-token  (student)
 * GET /api/teacher/sessions/:sessionId/agora-token  (teacher)
 */
export const generateAgoraToken = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await Session.findById(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  if (!APP_ID || !APP_CERTIFICATE) {
    return res.status(500).json({ success: false, message: 'Agora not configured' });
  }

  // Channel name = session ID so it's globally unique
  const channelName = session.agoraChannel || `vlm-${sessionId}`;
  const uid = 0; // 0 = Agora assigns a uid
  const role = 1; // 1 = Publisher role
  const expirationSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    expirationSeconds,
    privilegeExpiredTs
  );

  // Save channel name on session if not set
  if (!session.agoraChannel) {
    session.agoraChannel = channelName;
    await session.save();
  }

  res.json({
    success: true,
    data: {
      token,
      channelName,
      appId: APP_ID,
      uid,
      sessionId,
    },
  });
});

/**
 * Accept a doubt request (teacher side).
 * POST /api/teacher/sessions/:requestId/accept
 */
export const acceptDoubtRequest = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

  const request = await DoubtRequest.findById(req.params.requestId);
  if (!request || request.status !== 'searching') {
    return res.status(400).json({ success: false, message: 'Request not available or already taken' });
  }

  const rtIndex = request.routedTeachers.findIndex(
    (t) => t.teacherId.toString() === teacher._id.toString() && t.status === 'pending'
  );
  if (rtIndex === -1) {
    return res.status(400).json({ success: false, message: 'Not routed to you or already responded' });
  }

  // Mark this teacher as accepted, cancel others
  request.routedTeachers[rtIndex].status = 'accepted';
  request.routedTeachers[rtIndex].respondedAt = new Date();
  request.assignedTeacherId = teacher._id;
  request.status = 'active';

  request.routedTeachers.forEach((t, i) => {
    if (i !== rtIndex && t.status === 'pending') t.status = 'cancelled';
  });

  // Activate the session
  const session = await Session.findById(request.sessionId);
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

  session.teacherId = teacher._id;
  session.status = 'active';
  session.acceptedAt = new Date();
  session.startedAt = new Date();
  const channelName = `vlm-${session._id.toString()}`;
  session.agoraChannel = channelName;
  await session.save();

  await request.save();

  // Update teacher status to busy
  teacher.availabilityStatus = 'busy';
  await teacher.save();

  // Fetch student's userId for notification
  const student = await Student.findById(request.studentId);

  // Notify student via socket (real-time)
  emitSessionAccepted(student.userId.toString(), {
    sessionId: session._id.toString(),
    sessionType: session.type,
    teacherName: teacher.fullName,
    teacherPhoto: teacher.profilePhoto,
    teacherRating: teacher.metrics?.rating || 0,
    agoraChannel: channelName,
    requestId: request._id.toString(),
  });

  // Also push DB notification
  await createNotification(
    student.userId,
    'session_assigned',
    'Teacher Found! 🎉',
    `${teacher.fullName} accepted your request. Starting ${session.type} session...`,
    { sessionId: session._id }
  );

  res.json({
    success: true,
    message: 'Request accepted',
    data: {
      sessionId: session._id,
      sessionType: session.type,
      agoraChannel: channelName,
      student: {
        name: student?.fullName,
        class: student?.class,
        photo: student?.profilePhoto,
      },
    },
  });
});

/**
 * Decline a doubt request (teacher side).
 * POST /api/teacher/sessions/:requestId/decline
 */
export const declineDoubtRequest = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

  const request = await DoubtRequest.findById(req.params.requestId);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

  const rtIndex = request.routedTeachers.findIndex(
    (t) => t.teacherId.toString() === teacher._id.toString() && t.status === 'pending'
  );
  if (rtIndex === -1) {
    return res.status(400).json({ success: false, message: 'Not routed to you or already responded' });
  }

  request.routedTeachers[rtIndex].status = 'rejected';
  request.routedTeachers[rtIndex].respondedAt = new Date();
  teacher.metrics.missedRequests = (teacher.metrics.missedRequests || 0) + 1;

  // Check if all teachers have rejected/missed
  const allDone = request.routedTeachers.every(
    (t) => ['rejected', 'missed', 'cancelled'].includes(t.status)
  );

  if (allDone) {
    request.status = 'missed';
    const student = await Student.findById(request.studentId);
    if (student) {
      emitSessionDeclined(student.userId.toString(), {
        requestId: request._id.toString(),
        message: 'All teachers declined. Please try again.',
      });
    }
  }

  await request.save();
  await teacher.save();

  res.json({ success: true, message: 'Request declined' });
});

/**
 * Get all incoming (pending) doubt requests for a teacher.
 * GET /api/teacher/incoming-requests
 */
export const getIncomingRequests = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

  const requests = await DoubtRequest.find({
    'routedTeachers.teacherId': teacher._id,
    'routedTeachers.status': 'pending',
    status: 'searching',
  })
    .populate('studentId', 'fullName class nickname profilePhoto board')
    .sort({ createdAt: -1 });

  // Filter out expired and not-yet-responded ones
  const now = new Date();
  const filtered = requests.filter((r) => {
    const rt = r.routedTeachers.find((t) => t.teacherId.toString() === teacher._id.toString());
    return rt && (!rt.timerExpiresAt || rt.timerExpiresAt > now) && rt.status === 'pending';
  });

  res.json({ success: true, data: filtered });
});

/**
 * End a live session (teacher initiates).
 * POST /api/teacher/sessions/:sessionId/end
 */
export const endSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { summary, keyNotes } = req.body;

  const session = await Session.findById(sessionId);
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

  session.status = 'completed';
  session.endedAt = new Date();
  session.duration = session.startedAt
    ? Math.max(1, Math.floor((session.endedAt - session.startedAt) / 60000))
    : 1;
  if (summary) session.teacherSummary = summary;
  if (keyNotes) session.keyNotes = keyNotes;
  await session.save();

  // Teacher goes back to online
  const teacher = await Teacher.findById(session.teacherId);
  if (teacher) {
    teacher.availabilityStatus = 'online';
    teacher.metrics.totalSessions = (teacher.metrics.totalSessions || 0) + 1;
    await teacher.save();
  }

  res.json({
    success: true,
    data: {
      sessionId: session._id,
      duration: session.duration,
      status: session.status,
    },
  });
});
