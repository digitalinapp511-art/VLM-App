import VlmCounter from '../models/VlmCounter.js';

/**
 * Generates a human-readable VLM ID.
 * e.g. generateVlmId('STU') => 'VLM-STU-000001'
 *      generateVlmId('TCH') => 'VLM-TCH-000001'
 *      generateVlmId('PAR') => 'VLM-PAR-000001'
 */
export async function generateVlmId(prefix) {
  const counter = await VlmCounter.findOneAndUpdate(
    { prefix },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(counter.seq).padStart(6, '0');
  return `VLM-${prefix}-${padded}`;
}
