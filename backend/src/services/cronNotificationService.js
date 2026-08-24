import cron from 'node-cron';
import Student from '../models/Student.js';
import McqTask from '../models/McqTask.js';
import User from '../models/User.js';
import { createNotification } from './notificationService.js';

/**
 * Start recurring cron jobs for automated notifications.
 */
export const startCronNotificationScheduler = () => {
  console.log('[CronScheduler] Starting automated notification schedules...');

  // 1. Trial Expiry Alert — Daily at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('[CronScheduler] Checking for trials expiring tomorrow...');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Start of tomorrow & end of tomorrow to capture all expiring in next 24-48 hours
      const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
      const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

      const expiringStudents = await Student.find({
        'subscription.status': 'trial',
        'subscription.trialEndsAt': { $gte: startOfTomorrow, $lte: endOfTomorrow },
      }).lean();

      console.log(`[CronScheduler] Found ${expiringStudents.length} trial expirations expiring tomorrow.`);

      for (const student of expiringStudents) {
        await createNotification(
          student.userId,
          'trial_expiry_alert',
          'Trial Expiry Alert ⏰',
          `Your free trial expires tomorrow! Upgrade now to keep learning without interruption.`,
          { deepLink: '/plans', trialEndsAt: student.subscription.trialEndsAt },
          '/plans',
          { priority: 'high' }
        );
      }
    } catch (err) {
      console.error('[CronScheduler] Error checking trial expirations:', err.message);
    }
  });

  // 2. Daily Practice / MCQ Reminder — Daily at 7:00 PM
  cron.schedule('0 19 * * *', async () => {
    console.log('[CronScheduler] Checking for incomplete daily MCQ tasks...');
    try {
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));

      // Find MCQ tasks for today that are not completed
      const pendingTasks = await McqTask.find({
        createdAt: { $gte: startOfToday, $lte: endOfToday },
        status: { $ne: 'completed' },
      }).populate('studentId').lean();

      console.log(`[CronScheduler] Found ${pendingTasks.length} pending MCQ tasks for today.`);

      for (const task of pendingTasks) {
        const student = task.studentId;
        if (student && student.userId) {
          const name = student.firstName || 'Student';
          await createNotification(
            student.userId,
            'mcq_reminder',
            'Daily Practice Reminder 📚',
            `Don't break your streak, ${name}! Spend 5 minutes practicing today's questions.`,
            { deepLink: '/test-series', taskId: task._id.toString() },
            '/test-series',
            { priority: 'medium' }
          );
        }
      }
    } catch (err) {
      console.error('[CronScheduler] Error checking pending MCQ tasks:', err.message);
    }
  });

  // 3. Weekly Leaderboard Rank Update — Sundays at 9:00 PM
  cron.schedule('0 21 * * *', async () => {
    // Only fire on Sundays
    const today = new Date();
    if (today.getDay() !== 0) return;

    console.log('[CronScheduler] Dispatching weekly leaderboard rank update notifications...');
    try {
      // Find top 100 students with a rank
      const activeStudents = await Student.find({ leaderboardRank: { $gt: 0 } })
        .sort({ leaderboardRank: 1 })
        .limit(100)
        .lean();

      console.log(`[CronScheduler] Sending leaderboard updates to top ${activeStudents.length} students.`);

      for (const student of activeStudents) {
        await createNotification(
          student.userId,
          'leaderboard_rank_update',
          'Leaderboard Updated 📊',
          `Rank updated! You are currently ranked #${student.leaderboardRank} on the leaderboard. Keep it up!`,
          { deepLink: '/leaderboard', rank: student.leaderboardRank },
          '/leaderboard',
          { priority: 'medium' }
        );
      }
    } catch (err) {
      console.error('[CronScheduler] Error dispatching leaderboard updates:', err.message);
    }
  });

  console.log('[CronScheduler] Automated notification schedules active ✓');
};
