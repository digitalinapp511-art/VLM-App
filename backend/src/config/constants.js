export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  PARENT: 'parent',
};

export const TEACHER_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  INTERVIEW_PENDING: 'interview_pending',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REAPPLY_AFTER_7_DAYS: 'reapply_after_7_days',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
};

export const SESSION_TYPES = {
  CHAT: 'chat',
  AUDIO: 'audio',
  VIDEO: 'video',
  LIVE_CLASS: 'live_class',
  SHORT_LIVE: 'short_live',
  AI: 'ai',
};

export const SESSION_STATUS = {
  PENDING: 'pending',
  SEARCHING: 'searching',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  MISSED: 'missed',
  FAILED: 'failed',
  AUTO_CLOSED: 'auto_closed',
};

export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  REJECTED: 'rejected',
  FAILED: 'failed',
};

export const NOTIFICATION_TYPES = {
  NEW_REQUEST: 'new_request',
  SESSION_ASSIGNED: 'session_assigned',
  WALLET_CREDIT: 'wallet_credit',
  WITHDRAWAL: 'withdrawal',
  PROFILE_UPDATE: 'profile_update',
  INTERVIEW: 'interview',
  LIVE_CLASS: 'live_class',
  FEEDBACK: 'feedback',
  REFERRAL: 'referral',
  ANNOUNCEMENT: 'announcement',
};

export const EARNING_TYPES = {
  CHAT: 'chat',
  AUDIO: 'audio',
  VIDEO: 'video',
  DOUBT: 'doubt',
  LIVE_CLASS: 'live_class',
  SHORT_VIDEO: 'short_video',
  REFERRAL: 'referral',
  BONUS: 'bonus',
  PENALTY: 'penalty',
  ADMIN_ADJUSTMENT: 'admin_adjustment',
};
