import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import DoubtRequest from '../models/DoubtRequest.js';
import Teacher from '../models/Teacher.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { publishSocketEvent, getRedisSubClient } from '../services/redisService.js';

let ioInstance = null;

export const initSocket = (server) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.ADMIN_FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ].filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // In development, allow any origin (e.g., local IP addresses for mobile testing)
        if (process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        if (!origin || allowedOrigins.some((o) => origin === o || origin.endsWith('.vercel.app'))) {
          callback(null, true);
        } else {
          callback(null, allowedOrigins[0] || true);
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  ioInstance = io;

  // Set up Redis Pub/Sub subscription for multi-instance socket events
  try {
    const subClient = getRedisSubClient();
    
    // In node-redis v4, subscribe takes (channel, listener)
    subClient.subscribe('socket_events', (message) => {
      try {
        const { room, event, data } = JSON.parse(message);
        io.to(room).emit(event, data);
      } catch (err) {
        console.error('[Redis Sub] Failed to handle message:', err.message);
      }
    }).then(() => {
      console.log('[Redis Sub] Successfully subscribed to socket_events channel');
    }).catch(err => {
      console.error('[Redis Sub] Failed to subscribe:', err.message);
    });
  } catch (err) {
    console.error('[Redis Sub] Subscription failed:', err.message);
  }

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    console.log('Socket connection attempt, token:', token ? 'exists' : 'missing');
    if (!token) {
      console.log('Socket auth failed: No token provided');
      return next(new Error('Auth required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      
      // Fetch user role from database
      const userDoc = await User.findById(decoded.id).select('activeRole').lean();
      if (userDoc) {
        socket.user.role = userDoc.activeRole;
      }
      
      console.log('Socket auth success for user:', socket.user.id, 'Role:', socket.user.role);
      next();
    } catch (err) {
      console.log('Socket auth failed: Invalid token', err.message);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Each user joins their personal room for direct events
    socket.join(`user:${socket.user.id}`);
    console.log(`[Socket] Client connected, joined room user:${socket.user.id}`);

    // ── Auto-restore teacher online presence ───────────────────────
    // If this socket belongs to a teacher whose saved status is 'online',
    // re-add them to the Redis dispatch pool. This way navigating between
    // pages doesn't knock them offline.
    if (socket.user.role === 'teacher') {
      (async () => {
        try {
          const teacher = await Teacher.findOne({ userId: socket.user.id });
          if (teacher) {
            const { setTeacherState, TEACHER_PRESENCE } = await import('../services/presenceService.js');
            // Auto-restore presence based on DB status, but respect explicit offline choice
            if (teacher.availabilityStatus === 'online' && !teacher.manuallySetOffline) {
              await setTeacherState(teacher._id, TEACHER_PRESENCE.ONLINE, socket.id);
              console.log(`[Socket] Auto-restored ONLINE presence for teacher ${teacher._id} (${teacher.firstName})`);
            } else if (teacher.availabilityStatus === 'busy') {
              await setTeacherState(teacher._id, TEACHER_PRESENCE.BUSY, socket.id);
              console.log(`[Socket] Auto-restored BUSY presence for teacher ${teacher._id} (${teacher.firstName})`);
            } else if (teacher.manuallySetOffline) {
              console.log(`[Socket] Teacher ${teacher._id} manually set offline — skipping auto-restore`);
            }
          }
        } catch (e) {
          console.error('[Socket] Auto-restore presence error:', e.message);
        }
      })();
    }

    // ── Session room join ──────────────────────────────────────────
    socket.on('join_session', (sessionId) => {
      socket.join(`session:${sessionId}`);
    });

    socket.on('leave_session', (sessionId) => {
      socket.leave(`session:${sessionId}`);
    });

    // ── Real-time Chat Messages ────────────────────────────────────
    socket.on('send_message', async (data) => {
      try {
        const Message = (await import('../models/Message.js')).default;
        const msg = await Message.create({
          sessionId: data.sessionId,
          senderId: socket.user.id,
          senderRole: socket.user.role,
          type: data.type || 'text',
          content: data.content,
          mediaUrl: data.mediaUrl,
        });

        io.to(`session:${data.sessionId}`).emit('new_message', {
          ...data,
          id: msg._id,
          senderId: socket.user.id,
          senderRole: socket.user.role,
          timestamp: msg.createdAt,
        });
      } catch (err) {
        console.error('[Socket] Error saving/sending message:', err.message);
      }
    });

    socket.on('typing', (data) => {
      socket.to(`session:${data.sessionId}`).emit('user_typing', { userId: socket.user.id });
    });

    socket.on('stop_typing', (data) => {
      socket.to(`session:${data.sessionId}`).emit('user_stop_typing', { userId: socket.user.id });
    });

    // ── Whiteboard Sync Events ─────────────────────────────────────
    // Relay draw actions to the other participant in the session
    socket.on('whiteboard_draw', (data) => {
      // data: { sessionId, action: 'path'|'clear'|'undo', payload: {...} }
      socket.to(`session:${data.sessionId}`).emit('whiteboard_draw', {
        ...data,
        senderId: socket.user.id,
      });
    });

    socket.on('whiteboard_clear', (data) => {
      socket.to(`session:${data.sessionId}`).emit('whiteboard_clear', {
        sessionId: data.sessionId,
        senderId: socket.user.id,
      });
    });

    socket.on('whiteboard_toggle', (data) => {
      // data: { sessionId, show: boolean }
      socket.to(`session:${data.sessionId}`).emit('whiteboard_toggle', {
        sessionId: data.sessionId,
        show: data.show,
        senderId: socket.user.id,
      });
    });

    // ── Agora Call Signal Events ───────────────────────────────────
    // These carry call control signals between teacher and student
    socket.on('call_end', (data) => {
      io.to(`session:${data.sessionId}`).emit('call_ended', {
        sessionId: data.sessionId,
        endedBy: socket.user.id,
      });
    });

    // ── Teacher Availability ───────────────────────────────────────
    socket.on('teacher_online', async () => {
      try {
        const teacher = await Teacher.findOne({ userId: socket.user.id });
        if (teacher) {
          if (teacher.manuallySetOffline) {
            console.log(`[Socket] teacher_online received but teacher ${teacher._id} manually set OFFLINE. Ignoring.`);
            return;
          }
          teacher.availabilityStatus = 'online';
          teacher.manuallySetOffline = false;
          await teacher.save();
          const { setTeacherState, TEACHER_PRESENCE } = await import('../services/presenceService.js');
          await setTeacherState(teacher._id, TEACHER_PRESENCE.ONLINE, socket.id);
          socket.emit('presence_confirmed', { status: 'ONLINE' });
          console.log(`[Socket] Teacher ${teacher._id} (${teacher.firstName}) → ONLINE in Redis. applicationStatus=${teacher.applicationStatus}`);
        } else {
          console.warn(`[Socket] teacher_online: No teacher found for userId ${socket.user.id}`);
        }
      } catch (e) { console.error('teacher_online error:', e.message); }
    });

    socket.on('teacher_offline', async () => {
      try {
        const teacher = await Teacher.findOne({ userId: socket.user.id });
        if (teacher) {
          teacher.availabilityStatus = 'offline';
          teacher.manuallySetOffline = true; // Mark as explicitly offline
          await teacher.save();
          const { setTeacherState, TEACHER_PRESENCE } = await import('../services/presenceService.js');
          await setTeacherState(teacher._id, TEACHER_PRESENCE.OFFLINE);
          socket.emit('presence_confirmed', { status: 'OFFLINE' });
        }
      } catch (e) { console.error('teacher_offline error:', e.message); }
    });

    // ── Disconnect ────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      // Use a grace period before marking offline so that page navigation
      // (which causes a brief disconnect + reconnect) doesn't knock teacher offline.
      // If the teacher reconnects within 5s the new socket will auto-restore their status.
      const GRACE_MS = 5000;
      setTimeout(async () => {
        try {
          // Check if teacher has another active socket (i.e. reconnected after navigation)
          const roomName = `user:${socket.user.id}`;
          const socketsInRoom = await io.in(roomName).fetchSockets();
          if (socketsInRoom.length > 0) {
            // Teacher reconnected — don't go offline
            console.log(`[Socket] Disconnect grace: teacher ${socket.user.id} still has ${socketsInRoom.length} socket(s), staying online.`);
            return;
          }

          const teacher = await Teacher.findOne({ userId: socket.user.id });
          if (teacher) {
            const { setTeacherState, TEACHER_PRESENCE, releaseDispatchLock } = await import('../services/presenceService.js');
            // Don't change DB availability status — only remove from Redis dispatch pool.
            // This preserves the teacher's chosen status across app restarts.
            // If they were online/busy, they'll be restored on next connect via auto-restore.
            if (teacher.availabilityStatus !== 'busy') {
              await setTeacherState(teacher._id, TEACHER_PRESENCE.OFFLINE);
              console.log(`[Socket] Teacher ${teacher._id} truly disconnected → removed from Redis pool.`);
            }
            await releaseDispatchLock(teacher._id);
          }
        } catch (e) { /* silent disconnect */ }
      }, GRACE_MS);
    });
  });

  // ── Expire doubt requests every 5s ────────────────────────────────────
  setInterval(async () => {
    try {
      const expired = await DoubtRequest.find({
        status: 'searching',
        timerExpiresAt: { $lt: new Date() },
      });

      for (const req of expired) {
        req.routedTeachers.forEach((t) => {
          if (t.status === 'pending') t.status = 'missed';
        });
        const allMissed = req.routedTeachers.every(
          (t) => t.status === 'missed' || t.status === 'rejected'
        );
        if (allMissed) {
          req.status = 'missed';
          await req.save();

          // Notify student that no teacher was found
          const session = await Session.findById(req.sessionId);
          if (session) {
            session.status = 'missed';
            await session.save();
          }

          // Emit to student's personal room
          publishSocketEvent(`user:${req.studentId}`, 'request_missed', {
            requestId: req._id,
            sessionId: req.sessionId,
            message: 'No teacher available at this time. Please try again.',
          });
        } else {
          await req.save();
        }

        io.emit('request_expired', { requestId: req._id });
      }
    } catch (e) { console.error('expire interval error:', e.message); }
  }, 5000);

  return io;
};

export const getIo = () => ioInstance;

/**
 * Emit a new doubt request to matched teachers.
 * Called from the studentController after finding eligible teachers.
 */
export const emitNewRequest = (teacherUserIds, requestData) => {
  teacherUserIds.forEach((userId) => {
    const roomName = `user:${userId}`;
    publishSocketEvent(roomName, 'new_request', requestData);
  });
};

/**
 * Emit session_accepted to student when a teacher accepts.
 * Called from sharedController.respondToRequest.
 */
export const emitSessionAccepted = (studentUserId, sessionData) => {
  const roomName = `user:${studentUserId}`;
  console.log('[Socket/PubSub] Publishing session_accepted to student:', studentUserId);
  publishSocketEvent(roomName, 'session_accepted', sessionData);
};

/**
 * Emit session_declined to student if all teachers reject.
 */
export const emitSessionDeclined = (studentUserId, data) => {
  const roomName = `user:${studentUserId}`;
  console.log('[Socket/PubSub] Publishing session_declined to student:', studentUserId);
  publishSocketEvent(roomName, 'session_declined', data);
};
