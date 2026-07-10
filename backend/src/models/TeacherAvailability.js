import mongoose from 'mongoose';

/**
 * TeacherAvailability
 * Separated from Teacher to avoid unbounded array growth in the Teacher document.
 * One-to-many with Teacher — each doc is one time slot.
 */
const teacherAvailabilitySchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
    day: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], required: true },
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true },   // e.g. "11:00"
    subjects: [String],
    repeatWeekly: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('TeacherAvailability', teacherAvailabilitySchema);
