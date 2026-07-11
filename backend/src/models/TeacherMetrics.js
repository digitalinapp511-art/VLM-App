import mongoose from 'mongoose';

const teacherMetricsSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, unique: true },
    totalSessions: { type: Number, default: 0 },
    missedRequests: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    responseSpeed: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 100 },
    completionRate: { type: Number, default: 100 },
    performanceScore: { type: Number, default: 0 },
    todayEarnings: { type: Number, default: 0 },
    todayEarningsDate: { type: String, default: '' },
    weeklyLiveTarget: { type: Number, default: 0 },
    weeklyLiveCompleted: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('TeacherMetrics', teacherMetricsSchema);
