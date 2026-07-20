import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Notification from './src/models/Notification.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  const allNotifs = await Notification.find({ userId: '6a58e2f401423491e3eac3e2' }).sort({ createdAt: -1 });
  console.log(`Found ${allNotifs.length} notifications for user 6a58e2f401423491e3eac3e2:`);
  for (const n of allNotifs) {
    console.log(`- Notif: "${n.title}" | Message: "${n.message}" | Type: ${n.type} | Created: ${n.createdAt}`);
  }
  await mongoose.disconnect();
};
run();
