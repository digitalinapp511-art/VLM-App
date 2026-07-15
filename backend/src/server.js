import http from 'http';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/index.js';
import User from './models/User.js';
import { connectRedis } from './services/redisService.js';
import { startDispatchWorker } from './workers/dispatchWorker.js';

const app = createApp();
const server = http.createServer(app);

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@vlm.com' });
    if (!adminExists) {
      await User.create({
        email: 'admin@vlm.com',
        password: 'AdminPassword123',
        role: 'admin',
        activeRole: 'admin',
        isEmailVerified: true
      });
      console.log('Seeded default admin user: admin@vlm.com / AdminPassword123');
    }
  } catch (err) {
    console.error('Failed to seed admin user:', err.message);
  }
};

const start = async () => {
  await connectDB();
  await connectRedis();

  // Start the production dispatch worker (replaces legacy doubtQueue worker)
  startDispatchWorker();

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

