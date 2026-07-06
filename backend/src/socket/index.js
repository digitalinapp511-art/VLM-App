import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import DoubtRequest from '../models/DoubtRequest.js';
import Teacher from '../models/Teacher.js';
import Session from '../models/Session.js';
import User from '../models/User.js';

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

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    console.log('Socket connection attempt, token:', token ? 'exists' : 'missing');
    if (!token) {
      console.log('Socket auth failed: No token provided');
      return next(new Error('Auth required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

    // ── Session room join ──────────────────────────────────────────
    socket.on('join_session', (sessionId) => {
      socket.join(`session:${sessionId}`);
    });

    socket.on('leave_session', (sessionId) => {
      socket.leave(`session:${sessionId}`);
    });

    // ── Real-time Chat Messages ────────────────────────────────────
    socket.on('send_message', (data) => {
      io.to(`session:${data.sessionId}`).emit('new_message', {
        ...data,
        id: crypto.randomUUID(),
        senderId: socket.user.id,
        senderRole: socket.user.role,
        timestamp: new Date(),
      });
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
          teacher.availabilityStatus = 'online';
          await teacher.save();
          io.emit('teacher_status', { teacherId: teacher._id, status: 'online' });
        }
      } catch (e) { console.error('teacher_online error:', e.message); }
    });

    socket.on('teacher_offline', async () => {
      try {
        const teacher = await Teacher.findOne({ userId: socket.user.id });
        if (teacher) {
          teacher.availabilityStatus = 'offline';
          await teacher.save();
          io.emit('teacher_status', { teacherId: teacher._id, status: 'offline' });
        }
      } catch (e) { console.error('teacher_offline error:', e.message); }
    });

    // ── Disconnect ────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      try {
        const teacher = await Teacher.findOne({ userId: socket.user.id });
        if (teacher && teacher.availabilityStatus === 'online') {
          teacher.availabilityStatus = 'offline';
          await teacher.save();
        }
      } catch (e) { /* silent */ }
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
          io.to(`user:${req.studentId}`).emit('request_missed', {
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
  const io = getIo();
  if (!io) {
    console.error('[Socket] emitNewRequest failed: ioInstance is null');
    return;
  }
  teacherUserIds.forEach((userId) => {
    const roomName = `user:${userId}`;
    const room = io.sockets.adapter.rooms.get(roomName);
    console.log(`[Socket] Emitting new_request to ${roomName}. Sockets in room:`, room ? room.size : 0);
    io.to(roomName).emit('new_request', requestData);
  });
};

/**
 * Emit session_accepted to student when a teacher accepts.
 * Called from sharedController.respondToRequest.
 */
export const emitSessionAccepted = (studentUserId, sessionData) => {
  const io = getIo();
  if (!io) {
    console.error('[Socket] emitSessionAccepted failed: ioInstance is null');
    return;
  }
  const roomName = `user:${studentUserId}`;
  const room = io.sockets.adapter.rooms.get(roomName);
  console.log(`[Socket] Emitting session_accepted to ${roomName}. Sockets in room:`, room ? room.size : 0);
  console.log('[Socket] Payload:', JSON.stringify(sessionData));
  io.to(roomName).emit('session_accepted', sessionData);
};

/**
 * Emit session_declined to student if all teachers reject.
 */
export const emitSessionDeclined = (studentUserId, data) => {
  const io = getIo();
  if (!io) {
    console.error('[Socket] emitSessionDeclined failed: ioInstance is null');
    return;
  }
  const roomName = `user:${studentUserId}`;
  const room = io.sockets.adapter.rooms.get(roomName);
  console.log(`[Socket] Emitting session_declined to ${roomName}. Sockets in room:`, room ? room.size : 0);
  io.to(roomName).emit('session_declined', data);
};
