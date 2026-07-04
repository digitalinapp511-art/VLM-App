import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import DoubtRequest from '../models/DoubtRequest.js';
import Teacher from '../models/Teacher.js';

let ioInstance = null;

export const initSocket = (server) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
  ].filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
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

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Auth required'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);

    socket.on('join_session', (sessionId) => {
      socket.join(`session:${sessionId}`);
    });

    socket.on('send_message', (data) => {
      io.to(`session:${data.sessionId}`).emit('new_message', {
        ...data,
        senderId: socket.user.id,
        timestamp: new Date(),
      });
    });

    socket.on('typing', (data) => {
      socket.to(`session:${data.sessionId}`).emit('user_typing', { userId: socket.user.id });
    });

    socket.on('teacher_online', async () => {
      const teacher = await Teacher.findOne({ userId: socket.user.id });
      if (teacher) {
        teacher.availabilityStatus = 'online';
        await teacher.save();
        io.emit('teacher_status', { teacherId: teacher._id, status: 'online' });
      }
    });

    socket.on('teacher_offline', async () => {
      const teacher = await Teacher.findOne({ userId: socket.user.id });
      if (teacher) {
        teacher.availabilityStatus = 'offline';
        await teacher.save();
        io.emit('teacher_status', { teacherId: teacher._id, status: 'offline' });
      }
    });

    socket.on('disconnect', async () => {
      const teacher = await Teacher.findOne({ userId: socket.user.id });
      if (teacher && teacher.availabilityStatus === 'online') {
        teacher.availabilityStatus = 'offline';
        await teacher.save();
      }
    });
  });

  // Expire doubt requests timer
  setInterval(async () => {
    const expired = await DoubtRequest.find({
      status: 'searching',
      timerExpiresAt: { $lt: new Date() },
    });
    for (const req of expired) {
      req.routedTeachers.forEach((t) => {
        if (t.status === 'pending') t.status = 'missed';
      });
      const allMissed = req.routedTeachers.every((t) => t.status === 'missed' || t.status === 'rejected');
      if (allMissed) req.status = 'missed';
      await req.save();
      io.emit('request_expired', { requestId: req._id });
    }
  }, 5000);

  return io;
};

export const getIo = () => ioInstance;
