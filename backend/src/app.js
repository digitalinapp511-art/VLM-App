import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

export const createApp = () => {
  const app = express();

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some((o) => origin === o || origin.endsWith('.vercel.app'))) {
        callback(null, true);
      } else {
        callback(null, allowedOrigins[0] || true);
      }
    },
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  const uploadsPath = process.env.VERCEL
    ? path.join('/tmp', 'vlm-uploads')
    : path.join(__dirname, '../uploads');
  app.use('/uploads', express.static(uploadsPath));

  const rootMessage = (req, res) => {
    res.json({
      success: true,
      message: 'VLM Academy Backend is running',
      status: 'online',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        student: '/api/student',
        teacher: '/api/teacher',
        parent: '/api/parent',
      },
      database: process.env.MONGODB_URI ? 'configured' : 'MONGODB_URI missing — add in Vercel env',
    });
  };

  // Root URLs — no database needed
  app.get('/', rootMessage);
  app.get('/api', rootMessage);

  // Health check — no DB required (for Vercel monitoring)
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'VLM Academy API is running',
      timestamp: new Date(),
      env: {
        node: process.version,
        hasMongoUri: !!process.env.MONGODB_URI,
        vercel: !!process.env.VERCEL,
      },
    });
  });

  // DB connection for all other routes
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      console.error('DB middleware error:', err.message);
      res.status(503).json({
        success: false,
        message: 'Database connection failed',
        hint: 'Check MONGODB_URI in Vercel Environment Variables',
      });
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/teacher', teacherRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/parent', parentRoutes);
  app.use('/api/sessions', sessionRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
