import mongoose from 'mongoose';

/**
 * VlmCounter — atomic auto-increment per entity prefix.
 * Each prefix (STU, TCH, PAR) has its own counter document.
 */
const vlmCounterSchema = new mongoose.Schema({
  prefix: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model('VlmCounter', vlmCounterSchema);
