
export const PATHS = {
  // Public auth
  SPLASH: "/",
  ROLE_SELECT: "/role-select",
  LOGIN: "/login",
  OTP: "/otp",
  COMING_SOON: "/coming-soon",

  // Onboarding Student
  CREATE_PROFILE: "/create-profile",
  ONBOARDING_SLIDES: "/onboarding",
  SUBJECT_SELECTION: "/subject-selection",
  LEARNING_PLAN: "/learning-plan",
  COUPON: "/coupon",
  PLAN_SCREEN: "/plan-screen",
  PAYMENT_FAILED: "/payment-failed",

  // Student tabs (StudentLayout)
  STUDENT_DASHBOARD: "/student-dashboard",
  ASK_DOUBT: "/ask-doubt",
  MCQ: "/mcq",
  LIVE_CLASSES: "/live-classes",
  PROFILE: "/profile",
  STUDENT_PROFILE_SETUP: "/student/profile/setup",
  STUDENT_NOTIFICATIONS: "/student-notifications",

  //Teacher Flow
  TEACHER_REGISTRATION:"/teacher-registration",
  QUALIFICATION_DETAILS:"/qualification-details",
  BASICPROFILE_DETAILS:"/basicprofile-details",
  EXPERIENCE_DETAILS:"/experience-details",
  TEACHER_SUBJECT_SELECTION:"/teacher-subject-selection",
  TEACHERCLASS_SELECTION:"/class-selection",
  BOARD_SELECTION:"/board-selection",
  LANGUAGE_SELECTION:"/language-selection",
  DOCUMENT_UPLOAD:"/document-upload",
  INTERVIEW_SCHEDULE:"/interview-schedule",
  TEACHER_DEMO_VIDEO:"/teacher-demo-video",
  PROFILE_REVIEW:"/profile-review",
  INTERVIEW_CONFIRMATION:"/interview-confirmation",
  VERIFICATION_STATUS:"/verification-status",
  TEACHER_DASHBOARD:"/teacher-dashboard",
  TEACHER_PROFILE:"/teacher-profile",

    AVAILABILITY_STATUS: "/availability-status",
    DIRECT_REQUEST_NOTIFICATION: "/direct-request-notification",
    TEACHER_NOTIFICATIONS: "/teacher-notifications",
    TEACHER_WALLET: "/teacher-wallet",
    TEACHER_EARNINGS_HISTORY: "/teacher-earnings-history",
    TEACHER_SESSION_HISTORY: "/teacher-session-history",
    TEACHER_REQUESTS: "/teacher-requests",
    TEACHER_CLASSES: "/teacher-classes",
    TEACHER_LIBRARY: "/teacher-library",

  // Student flows
  VIDEO_UPLOAD: "/video-upload",
  DOUBT_SUBMITTED: "/doubt-submitted",
  AUDIO_CALL: "/audio-call",
  LIVE_SESSION: "/live-session",
  SHORT_LIVE_SESSION: "/short-live-session",
  SESSION_FEEDBACK: "/session-feedback",
  SESSION_HISTORY: "/session-history",
  SPINNER: "/spinner",
  REFER_EARN: "/refer-earn",
  REFERRAL_HISTORY: "/referral-history",
  REFERRAL_REWARD: "/referral-reward",
  PLAN_UPGRADE: "/plan-upgrade",


  //Parent Flow
  ADD_CHILD:"/add-child",
  PARENT_DASHBOARD:"/parent-dashboard",
  PARENT_LIVEACTIVITY:"/live-activity",
  PARENT_DOUBTHISTORY:"/doubt-history",
  // Legacy
  DASHBOARD: "/dashboard",
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];
