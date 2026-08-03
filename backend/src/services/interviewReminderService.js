import Interview from '../models/Interview.js';
import Notification from '../models/Notification.js';

export const startInterviewReminderScheduler = () => {
  console.log('[InterviewScheduler] Initializing interview reminder checker (every 1 minute)...');
  
  setInterval(async () => {
    try {
      const now = new Date();
      // Find interviews in the next 30-35 minutes
      const thirtyFiveMinLater = new Date(now.getTime() + 35 * 60 * 1000);
      
      const upcomingInterviews = await Interview.find({
        status: { $in: ['scheduled', 'rescheduled'] },
        scheduledAt: { $gte: now, $lte: thirtyFiveMinLater },
      }).populate('teacherId');

      for (const interview of upcomingInterviews) {
        if (!interview.teacherId) continue;
        
        // Check if 30-min reminder was already sent
        const alreadySent = interview.reminders && interview.reminders.some(r => r.type === '30_min_before');
        if (!alreadySent) {
          const formattedTime = new Date(interview.scheduledAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });

          // Create Notification for the teacher
          await Notification.create({
            userId: interview.teacherId.userId,
            type: 'interview_reminder_30',
            title: 'Upcoming Interview Reminder',
            message: `Your verification interview is scheduled in 30 minutes (at ${formattedTime}). Please be ready to join.`,
            priority: 'high',
            data: {
              interviewId: interview._id,
              scheduledAt: interview.scheduledAt,
            }
          });

          // Log reminder flag
          if (!interview.reminders) {
            interview.reminders = [];
          }
          interview.reminders.push({
            type: '30_min_before',
            sentAt: new Date(),
          });
          await interview.save();

          console.log(`[InterviewScheduler] Sent 30-min reminder to teacher user: ${interview.teacherId.userId} for interview: ${interview._id}`);
        }
      }
    } catch (err) {
      console.error('[InterviewScheduler] Error in interview reminder checker:', err);
    }
  }, 60 * 1000); // Run check every 1 minute
};
