import http from 'http';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/index.js';

const app = createApp();
const server = http.createServer(app);

const start = async () => {
  await connectDB();
  initSocket(server);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`VLM Academy Server running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
