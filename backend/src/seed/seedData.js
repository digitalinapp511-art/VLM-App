import dotenv from 'dotenv';
import mongoose from 'mongoose';
import AdminSettings from '../models/AdminSettings.js';
import Plan from '../models/Plan.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  const settings = [
    { key: 'maintenance_mode', value: false, category: 'system', description: 'Maintenance mode flag' },
    { key: 'force_update', value: false, category: 'system', description: 'Force update flag' },
    { key: 'min_app_version', value: '1.0.0', category: 'system' },
    { key: 'matching_weights', value: { subject: 25, class: 20, language: 15, board: 10, online: 20, rating: 15, preferred: 30 }, category: 'matching' },
    { key: 'audio_rate', value: 5, category: 'payout' },
    { key: 'video_rate', value: 10, category: 'payout' },
    { key: 'doubt_rate', value: 20, category: 'payout' },
    { key: 'chat_rate', value: 15, category: 'payout' },
    { key: 'live_class_rate', value: 50, category: 'payout' },
    { key: 'short_video_rate', value: 100, category: 'payout' },
    { key: 'rating_bonus', value: 10, category: 'payout' },
    { key: 'missed_penalty', value: -10, category: 'payout' },
    { key: 'withdrawal_mode', value: 'manual', category: 'wallet' },
    { key: 'min_withdrawal', value: 500, category: 'wallet' },
    { key: 'point_to_inr', value: 10, category: 'wallet' },
  ];

  for (const s of settings) {
    await AdminSettings.findOneAndUpdate({ key: s.key }, s, { upsert: true });
  }

  // Drop legacy slug index if present (from older schema)
  try {
    await Plan.collection.dropIndex('slug_1');
  } catch {
    /* index may not exist */
  }

  const rangePlans = [
    { name: 'Plan 1 (Class 1 - 8)', class: '1-8', duration: 'monthly', mrp: 999, price: 599, sortOrder: 1, benefits: { aiCredits: 1000, humanChatCredits: 50, audioMinutes: 300, videoMinutes: 150, liveClassesPerMonth: 12, doubtsPerDay: 10, subjects: ['Maths', 'Science'] } },
    { name: 'Plan 2 (Class 9 - 10)', class: '9-10', duration: 'monthly', mrp: 1499, price: 899, sortOrder: 2, benefits: { aiCredits: 2000, humanChatCredits: 100, audioMinutes: 600, videoMinutes: 300, liveClassesPerMonth: 24, doubtsPerDay: 20, subjects: ['Maths', 'Science', 'English'] } },
    { name: 'Plan 3 (Class 11 - 12)', class: '11-12', duration: 'monthly', mrp: 1999, price: 1199, sortOrder: 3, benefits: { aiCredits: 3000, humanChatCredits: 150, audioMinutes: 900, videoMinutes: 450, liveClassesPerMonth: 36, doubtsPerDay: 30, subjects: ['Physics', 'Chemistry', 'Maths'] } }
  ];
  for (const p of rangePlans) {
    await Plan.findOneAndUpdate(
      { name: p.name, class: p.class, duration: p.duration },
      { $set: p },
      { upsert: true, new: true }
    );
  }

  const { default: PromoBanner } = await import('../models/PromoBanner.js');
  const banners = [
    { tag: 'NEW', title: 'Master Your Concepts', highlightWord: 'Concepts', description: 'Explore new courses, practice daily and achieve your goals!', buttonText: 'Explore Now', buttonLink: '/library', imageUrl: '/onboarding1.png', order: 1, isCoupon: false },
    { tag: '24/7 AI', title: 'Meet Your AI Tutor', highlightWord: 'Tutor', description: 'Ask doubts anytime, get step-by-step math solver help!', buttonText: 'Chat Now', buttonLink: '/ai-chat', imageUrl: '/onboarding2.png', order: 2, isCoupon: false },
    { tag: 'XP BONUS', title: 'Daily MCQ Streak', highlightWord: 'Streak', description: 'Complete 20 daily questions and earn double XP multiplier!', buttonText: 'Start Now', buttonLink: '/mcq', imageUrl: '/onboarding3.png', order: 3, isCoupon: false },
    { tag: 'CASHBACK', title: 'Get 50% Cashback on Recharge', highlightWord: '50%', description: 'Recharge your VLM Wallet today and get an instant 50% bonus points cashback!', buttonText: 'Recharge Now', buttonLink: '/wallet', imageUrl: '/onboarding4.png', order: 4, isCoupon: false }
  ];

  for (const b of banners) {
    await PromoBanner.findOneAndUpdate({ title: b.title }, b, { upsert: true, new: true });
  }

  console.log('Seed data created successfully');
  await mongoose.disconnect();
};

seed().catch(console.error);
