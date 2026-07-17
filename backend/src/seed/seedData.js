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

  const classes = ['6', '7', '8', '9', '10'];
  for (const cls of classes) {
    const plans = [
      { name: 'Basic', class: cls, duration: 'monthly', mrp: 999, price: 499, sortOrder: 1, benefits: { aiCredits: 50, humanChatCredits: 10, audioMinutes: 60, videoMinutes: 30, liveClassesPerMonth: 2, doubtsPerDay: 5 } },
      { name: 'Standard', class: cls, duration: 'quarterly', mrp: 2499, price: 1299, sortOrder: 2, benefits: { aiCredits: 200, humanChatCredits: 30, audioMinutes: 180, videoMinutes: 90, liveClassesPerMonth: 8, doubtsPerDay: 15 } },
      { name: 'Premium', class: cls, duration: 'yearly', mrp: 7999, price: 3999, sortOrder: 3, benefits: { aiCredits: 1000, humanChatCredits: 100, audioMinutes: 600, videoMinutes: 300, liveClassesPerMonth: 24, doubtsPerDay: 50 } },
    ];
    for (const p of plans) {
      await Plan.findOneAndUpdate(
        { name: p.name, class: p.class, duration: p.duration },
        { $set: p },
        { upsert: true, new: true }
      );
    }
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
