import { v4 as uuidv4 } from 'uuid';

export const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const generateReferralCode = () => `VLM${uuidv4().slice(0, 8).toUpperCase()}`;

export const pointsToInr = (points) => {
  const ratio = parseInt(process.env.POINTS_TO_INR_RATIO || '10', 10);
  return points / ratio;
};

export const inrToPoints = (inr) => {
  const ratio = parseInt(process.env.POINTS_TO_INR_RATIO || '10', 10);
  return inr * ratio;
};

const RESTRICTED_PATTERNS = [
  /\b\d{10}\b/,
  /\b[\w.-]+@[\w.-]+\.\w+\b/,
  /whatsapp|telegram|instagram|facebook/i,
  /paytm|gpay|phonepe|upi/i,
  /tuition\s+outside|private\s+class/i,
];

export const detectRestrictedContent = (text) => {
  if (!text) return { flagged: false };
  for (const pattern of RESTRICTED_PATTERNS) {
    if (pattern.test(text)) {
      return { flagged: true, reason: 'Restricted content detected' };
    }
  }
  return { flagged: false };
};
