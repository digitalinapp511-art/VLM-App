import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/index.js';
import User from './models/User.js';
import { connectRedis } from './services/redisService.js';
import { startDispatchWorker } from './workers/dispatchWorker.js';
import { startInterviewReminderScheduler } from './services/interviewReminderService.js';
import { startSubscriptionAutopayScheduler } from './services/subscriptionAutopayService.js';
import { initFirebase } from './services/fcmService.js';


const app = createApp();
const server = http.createServer(app);

const seedAdmin = async () => {
  try {
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@vlm.com';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'AdminPassword123';

    const adminExists = await User.findOne({ email });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email,
        password,
        role: 'admin',
        activeRole: 'admin',
        isEmailVerified: true,
        isSuperAdmin: true,
        permissions: ['*']
      });
      console.log(`Seeded default admin user: ${email}`);
    } else {
      if (!adminExists.isSuperAdmin || !adminExists.permissions?.includes('*')) {
        adminExists.isSuperAdmin = true;
        adminExists.permissions = ['*'];
        await adminExists.save();
        console.log(`Updated existing admin to Super Admin: ${email}`);
      }
    }
  } catch (err) {
    console.error('Failed to seed admin user:', err.message);
  }
};

const start = async () => {
  await connectDB();
  await connectRedis();

  // Initialize Firebase Admin SDK for push notifications
  initFirebase();

  // Start the production dispatch worker (replaces legacy doubtQueue worker)
  startDispatchWorker();


  // Start the onboarding interview 30-min reminder checker
  startInterviewReminderScheduler();

  // Start the recurring Razorpay autopay subscription checks
  startSubscriptionAutopayScheduler();

  await seedAdmin();
  initSocket(server);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`VLM Academy Server running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

