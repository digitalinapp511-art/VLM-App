import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Teacher from './src/models/Teacher.js';
import User from './src/models/User.js';

dotenv.config();
const uri = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to DB");

  const users = await User.find({ email: 'vlmacademy2025@gmail.com' });
  console.log("Users found for vlmacademy2025@gmail.com:", users);
  
  if (users.length > 0) {
    const teacher = await Teacher.findOne({ userId: users[0]._id });
    console.log("Teacher Profile for vlmacademy2025:", teacher);
    
    if (teacher) {
      const classes = await mongoose.connection.db.collection('liveclasses').find({ teacherId: teacher._id }).toArray();
      console.log("Classes for vlmacademy2025:", classes);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
