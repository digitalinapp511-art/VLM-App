import express from 'express';
import { protect, authorize, checkPermission } from '../middleware/auth.js';
import { upload, cloudinaryUploadMiddleware, compressImageToWebp } from '../middleware/upload.js';
import {
  getBanners, createBanner, updateBanner, deleteBanner, reorderBanners
} from '../controllers/admin/adminBannerController.js';
import {
  getOnboardingSlidesAdmin, createOnboardingSlide, updateOnboardingSlide, deleteOnboardingSlide
} from '../controllers/admin/adminOnboardingController.js';
import {
  getEmployees, createEmployee, updateEmployee, deleteEmployee
} from '../controllers/admin/adminEmployeeController.js';
import {
  getStudyLibrary, addSubject, addNote, uploadPdf, deleteSubject
} from '../controllers/admin/adminStudyLibraryController.js';
import {
  getIntegrations, updateIntegration, testIntegrationConnection
} from '../controllers/admin/adminIntegrationController.js';
import {
  adminGetPlans, adminCreatePlan, adminUpdatePlan, adminDeletePlan, adminGetPlanStats, adminGetTrials
} from '../controllers/admin/adminPlanController.js';
import {
  getCashbackOffers, getCashbackOffer, createCashbackOffer, updateCashbackOffer,
  deleteCashbackOffer, toggleCashbackOffer,
} from '../controllers/admin/adminCashbackController.js';
import {
  getPendingVerifications,
  adminVerifyTeacher,
  getInterviewSlotSettings,
  updateInterviewSlotSettings,
  adminRescheduleInterview,
  getPendingPayouts,
  processTeacherPayout,
  getPayoutHistory,
} from '../controllers/adminPayoutVerificationController.js';

// ── Auth Controller ──────────────────────────────────────────────────────────
import {
  adminLogin, adminLogout, adminRefreshToken,
  getAdminMe, updateAdminProfile, changeAdminPassword,
  adminForgotPassword, adminResetPassword,
  enableAdmin2FA, verifyAdmin2FA,
} from '../controllers/admin/adminAuthController.js';

// ── Dashboard Controller ─────────────────────────────────────────────────────
import {
  getAdminDashboard, getDashboardLiveStats, getDashboardAnalytics,
  getDashboardRevenue, getSystemHealth, getRecentActivities,
  getAdminNotifications,
  getFounderDashboard, getFounderRevenue, getFounderUserGrowth,
  getFounderRetention, getFounderChurn, getFounderMarketing,
  getFounderAiUsage, getFounderLiveSessionAnalytics, getFounderBusinessSummary,
} from '../controllers/admin/adminDashboardController.js';

// ── Student Controller ───────────────────────────────────────────────────────
import {
  getStudents, getStudent, createStudent, updateStudent, deleteStudent,
  searchStudents, filterStudents, bulkImportStudents, exportStudents,
  updateStudentStatus, updateStudentWallet, updateStudentSubscription,
  updateStudentKyc, getStudentActivity, getStudentDevices, getStudentSessions,
} from '../controllers/admin/adminStudentController.js';

// ── Teacher Controller ───────────────────────────────────────────────────────
import {
  getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher,
  approveTeacher, rejectTeacher, updateTeacherStatus,
  getTeacherPerformance, getTeacherEarnings, getTeacherWallets,
  getTeacherWithdrawals, updateTeacherAvailability,
  getWithdrawals, getWithdrawal, approveWithdrawal, rejectWithdrawal,
} from '../controllers/admin/adminTeacherController.js';

// ── Parent Controller ────────────────────────────────────────────────────────
import {
  getParents, getParent, createParent, updateParent, deleteParent,
  linkParentToStudent, unlinkParentFromStudent, getParentActivity, getParentReports,
} from '../controllers/admin/adminParentController.js';

// ── Feature Controller ───────────────────────────────────────────────────────
import {
  // Doubts
  getDoubts, getDoubt, updateDoubt, assignDoubt, resolveDoubt, getDoubtsAnalytics,
  // AI
  getAiPrompts, createAiPrompt, updateAiPrompt, deleteAiPrompt,
  getAiAnalytics, getAiCredits, getAiReports,
  // Live Sessions
  getLiveSessions, getLiveSession, endLiveSession, getLiveSessionAnalytics,
  // Live Classes
  getLiveClasses, createLiveClass, updateLiveClass, deleteLiveClass,
  approveLiveClass, getLiveClassAttendance, getLiveClassAnalytics,
  // Short Videos
  getVideos, createVideo, updateVideo, deleteVideo, approveVideo, rejectVideo,
  // MCQ
  getMcqs, createMcq, updateMcq, deleteMcq, getMcqResults, getMcqLeaderboard,
  // Notifications
  getNotifications, createNotification, updateNotification, deleteNotification, broadcastNotification,
  // Support
  getTickets, createTicket, updateTicket, deleteTicket, getFeedback,
  // Resources
  getResources, createResource, updateResource, deleteResource, getSubjectsByClass,
  // Spin Wheel
  getSpinSettings, createSpinSetting, updateSpinSetting, deleteSpinSetting,
  // Settings
  getSettings, updateSettings, getSystemConfig, updateSystemConfig,
  // Financial & Wallet
  getFinancials, getPayments, getInvoices, getRefunds, getCommissions,
  getAdminWallet, getWalletTransactions, rechargeWallet, rewardWallet, redeemWallet,
  // Content Management
  boardsCrud, classesCrud, subjectsCrud, chaptersCrud, topicsCrud,
  // Subscriptions
  getSubscriptions,
  // Admin User Management
  getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser,
  getRoles, getPermissions, updateRole,
  getActivityLogs, getLoginHistory, getAuditLogs,
  // Media
  getMedia, uploadMedia, deleteMedia,
} from '../controllers/admin/adminFeatureController.js';

const router = express.Router();

// ════════════════════════════════════════════════════════════════════════════
//  PUBLIC ROUTES  (no auth required)
// ════════════════════════════════════════════════════════════════════════════
router.post('/login', adminLogin);
router.post('/refresh-token', adminRefreshToken);
router.post('/forgot-password', adminForgotPassword);
router.post('/reset-password', adminResetPassword);

// ════════════════════════════════════════════════════════════════════════════
//  ALL ROUTES BELOW REQUIRE AUTHENTICATION AS ADMIN
// ════════════════════════════════════════════════════════════════════════════
router.use(protect, authorize('admin'));

// ── AUTHENTICATION ───────────────────────────────────────────────────────────
router.post('/logout', adminLogout);
router.get('/me', getAdminMe);
router.put('/profile', updateAdminProfile);
router.put('/change-password', changeAdminPassword);
router.post('/enable-2fa', enableAdmin2FA);
router.post('/verify-2fa', verifyAdmin2FA);

// ── TEACHER VERIFICATION & AGORA INTERVIEWS ────────────────────────────────
router.get('/teachers/pending-verification', getPendingVerifications);
router.post('/teachers/verify-decision', adminVerifyTeacher);
router.get('/interview-slots/settings', getInterviewSlotSettings);
router.put('/interview-slots/settings', updateInterviewSlotSettings);
router.post('/teachers/reschedule-interview', adminRescheduleInterview);

// ── MANUAL WEEKLY PAYOUTS ──────────────────────────────────────────────────
router.get('/payouts/pending', getPendingPayouts);
router.post('/payouts/process', processTeacherPayout);
router.get('/payouts/history', getPayoutHistory);

// ── DASHBOARD ────────────────────────────────────────────────────────────────
router.get('/dashboard', getAdminDashboard);
router.get('/dashboard/live-stats', getDashboardLiveStats);
router.get('/dashboard/analytics', getDashboardAnalytics);
router.get('/dashboard/revenue', getDashboardRevenue);
router.get('/dashboard/system-health', getSystemHealth);
router.get('/dashboard/recent-activities', getRecentActivities);
router.get('/dashboard/notifications', getAdminNotifications);

// ── STUDENTS ─────────────────────────────────────────────────────────────────
router.get('/students/search', checkPermission('students'), searchStudents);
router.get('/students/filter', checkPermission('students'), filterStudents);
router.get('/students/export', checkPermission('students'), exportStudents);
router.post('/students/bulk-import', checkPermission('students'), bulkImportStudents);
router.get('/students', checkPermission('students'), getStudents);
router.post('/students', checkPermission('students'), createStudent);
router.get('/students/:id', checkPermission('students'), getStudent);
router.put('/students/:id', checkPermission('students'), updateStudent);
router.delete('/students/:id', checkPermission('students'), deleteStudent);
router.put('/students/:id/status', checkPermission('students'), updateStudentStatus);
router.put('/students/:id/wallet', checkPermission('students'), updateStudentWallet);
router.put('/students/:id/subscription', checkPermission('students'), updateStudentSubscription);
router.put('/students/:id/kyc', checkPermission('students'), updateStudentKyc);
router.get('/students/:id/activity', checkPermission('students'), getStudentActivity);
router.get('/students/:id/devices', checkPermission('students'), getStudentDevices);
router.get('/students/:id/sessions', checkPermission('students'), getStudentSessions);

// ── PARENTS ──────────────────────────────────────────────────────────────────
router.get('/parents/activity', checkPermission('parents'), getParentActivity);
router.get('/parents/reports', checkPermission('parents'), getParentReports);
router.post('/parents/link', checkPermission('parents'), linkParentToStudent);
router.post('/parents/unlink', checkPermission('parents'), unlinkParentFromStudent);
router.get('/parents', checkPermission('parents'), getParents);
router.post('/parents', checkPermission('parents'), createParent);
router.get('/parents/:id', checkPermission('parents'), getParent);
router.put('/parents/:id', checkPermission('parents'), updateParent);
router.delete('/parents/:id', checkPermission('parents'), deleteParent);

// ── TEACHERS ─────────────────────────────────────────────────────────────────
router.get('/teachers/performance', checkPermission('teachers'), getTeacherPerformance);
router.get('/teachers/earnings', checkPermission('teachers'), getTeacherEarnings);
router.get('/teachers/wallet', checkPermission('teachers'), getTeacherWallets);
router.get('/teachers/withdrawals', checkPermission('teachers'), getTeacherWithdrawals);
router.get('/teachers', checkPermission('teachers'), getTeachers);
router.post('/teachers', checkPermission('teachers'), createTeacher);
router.get('/teachers/:id', checkPermission('teachers'), getTeacher);
router.put('/teachers/:id', checkPermission('teachers'), updateTeacher);
router.delete('/teachers/:id', checkPermission('teachers'), deleteTeacher);
router.post('/teachers/:id/approve', checkPermission('teachers'), approveTeacher);
router.post('/teachers/:id/reject', checkPermission('teachers'), rejectTeacher);
router.put('/teachers/:id/status', checkPermission('teachers'), updateTeacherStatus);
router.put('/teachers/:id/availability', checkPermission('teachers'), updateTeacherAvailability);

// ── WITHDRAWALS ───────────────────────────────────────────────────────────────
router.get('/withdrawals', checkPermission('financials'), getWithdrawals);
router.get('/withdrawals/:id', checkPermission('financials'), getWithdrawal);
router.post('/withdrawals/:id/approve', checkPermission('financials'), approveWithdrawal);
router.post('/withdrawals/:id/reject', checkPermission('financials'), rejectWithdrawal);

// ── FINANCIAL ────────────────────────────────────────────────────────────────
router.get('/financials', checkPermission('financials'), getFinancials);
router.get('/payments', checkPermission('financials'), getPayments);
router.get('/invoices', checkPermission('financials'), getInvoices);
router.get('/refunds', checkPermission('financials'), getRefunds);
router.get('/commissions', checkPermission('financials'), getCommissions);

// ── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
router.get('/subscriptions', checkPermission('financials'), getSubscriptions);

// ── WALLET ───────────────────────────────────────────────────────────────────
router.get('/wallet', checkPermission('financials'), getAdminWallet);
router.get('/wallet/transactions', checkPermission('financials'), getWalletTransactions);
router.post('/wallet/recharge', checkPermission('financials'), rechargeWallet);
router.post('/wallet/reward', checkPermission('financials'), rewardWallet);
router.post('/wallet/redeem', checkPermission('financials'), redeemWallet);

// ── DOUBTS ───────────────────────────────────────────────────────────────────
router.get('/doubts/analytics', checkPermission('sessions'), getDoubtsAnalytics);
router.get('/doubts', checkPermission('sessions'), getDoubts);
router.get('/doubts/:id', checkPermission('sessions'), getDoubt);
router.put('/doubts/:id', checkPermission('sessions'), updateDoubt);
router.post('/doubts/:id/assign', checkPermission('sessions'), assignDoubt);
router.post('/doubts/:id/resolve', checkPermission('sessions'), resolveDoubt);

// ── AI ───────────────────────────────────────────────────────────────────────
router.get('/ai/prompts', checkPermission('sessions'), getAiPrompts);
router.post('/ai/prompts', checkPermission('sessions'), createAiPrompt);
router.put('/ai/prompts/:id', checkPermission('sessions'), updateAiPrompt);
router.delete('/ai/prompts/:id', checkPermission('sessions'), deleteAiPrompt);
router.get('/ai/analytics', checkPermission('sessions'), getAiAnalytics);
router.get('/ai/credits', checkPermission('sessions'), getAiCredits);
router.get('/ai/reports', checkPermission('sessions'), getAiReports);

// ── LIVE SESSIONS ─────────────────────────────────────────────────────────────
router.get('/live-sessions/analytics', checkPermission('sessions'), getLiveSessionAnalytics);
router.get('/live-sessions', checkPermission('sessions'), getLiveSessions);
router.get('/live-sessions/:id', checkPermission('sessions'), getLiveSession);
router.post('/live-sessions/:id/end', checkPermission('sessions'), endLiveSession);

// ── LIVE CLASSES ──────────────────────────────────────────────────────────────
router.get('/live-classes/attendance', checkPermission('sessions'), getLiveClassAttendance);
router.get('/live-classes/analytics', checkPermission('sessions'), getLiveClassAnalytics);
router.get('/live-classes', checkPermission('sessions'), getLiveClasses);
router.post('/live-classes', checkPermission('sessions'), createLiveClass);
router.put('/live-classes/:id', checkPermission('sessions'), updateLiveClass);
router.delete('/live-classes/:id', checkPermission('sessions'), deleteLiveClass);
router.post('/live-classes/:id/approve', checkPermission('sessions'), approveLiveClass);

// ── CONTENT MANAGEMENT ────────────────────────────────────────────────────────
router.get('/boards', boardsCrud.getAll);
router.post('/boards', boardsCrud.create);
router.put('/boards/:id', boardsCrud.update);
router.delete('/boards/:id', boardsCrud.delete);

router.get('/classes', classesCrud.getAll);
router.post('/classes', classesCrud.create);
router.put('/classes/:id', classesCrud.update);
router.delete('/classes/:id', classesCrud.delete);

router.get('/subjects', subjectsCrud.getAll);
router.post('/subjects', subjectsCrud.create);
router.put('/subjects/:id', subjectsCrud.update);
router.delete('/subjects/:id', subjectsCrud.delete);

router.get('/chapters', chaptersCrud.getAll);
router.post('/chapters', chaptersCrud.create);
router.put('/chapters/:id', chaptersCrud.update);
router.delete('/chapters/:id', chaptersCrud.delete);

router.get('/topics', topicsCrud.getAll);
router.post('/topics', topicsCrud.create);
router.put('/topics/:id', topicsCrud.update);
router.delete('/topics/:id', topicsCrud.delete);

// ── RESOURCES ────────────────────────────────────────────────────────────────
router.get('/resources', checkPermission('study-materials'), getResources);
router.get('/resources/subjects', checkPermission('study-materials'), getSubjectsByClass);
router.post('/resources', checkPermission('study-materials'), upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'video', maxCount: 1 }, { name: 'file', maxCount: 1 }]), cloudinaryUploadMiddleware, createResource);
router.put('/resources/:id', checkPermission('study-materials'), upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'video', maxCount: 1 }, { name: 'file', maxCount: 1 }]), cloudinaryUploadMiddleware, updateResource);
router.delete('/resources/:id', checkPermission('study-materials'), deleteResource);

// ── STUDY LIBRARY & FILE UPLOADS (Admin Panel compatibility) ──────────────────
router.get('/study-library', checkPermission('study-materials'), getStudyLibrary);
router.post('/study-library/subjects', checkPermission('study-materials'), addSubject);
router.post('/study-library/:className/subjects/:subjectId/notes', checkPermission('study-materials'), addNote);
router.delete('/study-library/:className/subjects/:subjectId', checkPermission('study-materials'), deleteSubject);
router.post('/upload/pdf', checkPermission('study-materials'), upload.single('file'), cloudinaryUploadMiddleware, uploadPdf);

// ── MCQ ──────────────────────────────────────────────────────────────────────
router.get('/mcq', checkPermission('mcqs'), getMcqs);
router.post('/mcq', checkPermission('mcqs'), createMcq);
router.put('/mcq/:id', checkPermission('mcqs'), updateMcq);
router.delete('/mcq/:id', checkPermission('mcqs'), deleteMcq);
router.get('/results', checkPermission('mcqs'), getMcqResults);
router.get('/leaderboard', checkPermission('mcqs'), getMcqLeaderboard);

// ── SHORT VIDEOS ──────────────────────────────────────────────────────────────
router.get('/videos', getVideos);
router.post('/videos', createVideo);
router.put('/videos/:id', updateVideo);
router.delete('/videos/:id', deleteVideo);
router.post('/videos/:id/approve', approveVideo);
router.post('/videos/:id/reject', rejectVideo);

// ── SPIN WHEEL ───────────────────────────────────────────────────────────────
router.get('/spin-settings', getSpinSettings);
router.post('/spin-settings', createSpinSetting);
router.put('/spin-settings', updateSpinSetting);
router.delete('/spin-settings/:id', deleteSpinSetting);

// ── SUBSCRIPTION PLANS ───────────────────────────────────────────────────────
router.get('/plans', adminGetPlans);
router.get('/plans/stats', adminGetPlanStats);
router.get('/plans/trials', adminGetTrials);
router.post('/plans', adminCreatePlan);
router.put('/plans/:id', adminUpdatePlan);
router.delete('/plans/:id', adminDeletePlan);

// ── PROMO BANNERS ─────────────────────────────────────────────────────────────
router.get('/banners', checkPermission('banners'), getBanners);
router.post('/banners', checkPermission('banners'), upload.single('image'), compressImageToWebp, cloudinaryUploadMiddleware, createBanner);
router.put('/banners/reorder', checkPermission('banners'), reorderBanners);
router.put('/banners/:id', checkPermission('banners'), upload.single('image'), compressImageToWebp, cloudinaryUploadMiddleware, updateBanner);
router.delete('/banners/:id', checkPermission('banners'), deleteBanner);

// ── ONBOARDING SLIDES ──────────────────────────────────────────────────────────
router.get('/onboarding-slides', checkPermission('onboarding'), getOnboardingSlidesAdmin);
router.post('/onboarding-slides', checkPermission('onboarding'), upload.single('image'), compressImageToWebp, cloudinaryUploadMiddleware, createOnboardingSlide);
router.put('/onboarding-slides/:id', checkPermission('onboarding'), upload.single('image'), compressImageToWebp, cloudinaryUploadMiddleware, updateOnboardingSlide);
router.delete('/onboarding-slides/:id', checkPermission('onboarding'), deleteOnboardingSlide);

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
router.get('/notifications', getNotifications);
router.post('/notifications', createNotification);
router.put('/notifications/:id', updateNotification);
router.delete('/notifications/:id', deleteNotification);
router.post('/broadcast', broadcastNotification);

// ── SUPPORT ───────────────────────────────────────────────────────────────────
router.get('/tickets', checkPermission('support'), getTickets);
router.post('/tickets', checkPermission('support'), createTicket);
router.put('/tickets/:id', checkPermission('support'), updateTicket);
router.delete('/tickets/:id', checkPermission('support'), deleteTicket);
router.get('/feedback', checkPermission('support'), getFeedback);

// ── MEDIA ────────────────────────────────────────────────────────────────────
router.get('/media', getMedia);
router.post('/media', uploadMedia);
router.delete('/media/:id', deleteMedia);

// ── SYSTEM SETTINGS ──────────────────────────────────────────────────────────
router.get('/settings', checkPermission('settings'), getSettings);
router.put('/settings', checkPermission('settings'), updateSettings);
router.get('/system-config', checkPermission('settings'), getSystemConfig);
router.put('/system-config', checkPermission('settings'), updateSystemConfig);

// ── CONNECTED API INTEGRATIONS ────────────────────────────────────────────────
router.get('/integrations', checkPermission('settings'), getIntegrations);
router.put('/integrations/:key', checkPermission('settings'), updateIntegration);
router.post('/integrations/:key/test', checkPermission('settings'), testIntegrationConnection);

// ── ADMIN USER MANAGEMENT ─────────────────────────────────────────────────────
router.get('/users', getAdminUsers);
router.post('/users', createAdminUser);
router.put('/users/:id', updateAdminUser);
router.delete('/users/:id', deleteAdminUser);
router.get('/roles', getRoles);
router.get('/permissions', getPermissions);
router.put('/roles/:id', updateRole);
router.get('/activity-logs', getActivityLogs);
router.get('/login-history', getLoginHistory);
router.get('/audit-logs', getAuditLogs);

// ── EMPLOYEE MANAGEMENT (Super Admin only) ────────────────────────────────────
router.get('/employees', checkPermission('employees'), getEmployees);
router.post('/employees', checkPermission('employees'), createEmployee);
router.put('/employees/:id', checkPermission('employees'), updateEmployee);
router.delete('/employees/:id', checkPermission('employees'), deleteEmployee);

// ── FOUNDER DASHBOARD ─────────────────────────────────────────────────────────
router.get('/founder/dashboard', getFounderDashboard);
router.get('/founder/revenue', getFounderRevenue);
router.get('/founder/user-growth', getFounderUserGrowth);
router.get('/founder/retention', getFounderRetention);
router.get('/founder/churn', getFounderChurn);
router.get('/founder/marketing', getFounderMarketing);
router.get('/founder/ai-usage', getFounderAiUsage);
router.get('/founder/live-session-analytics', getFounderLiveSessionAnalytics);
router.get('/founder/business-summary', getFounderBusinessSummary);

// ── CASHBACK OFFERS ───────────────────────────────────────────────────────────
router.get('/cashback-offers', getCashbackOffers);
router.post('/cashback-offers', createCashbackOffer);
router.get('/cashback-offers/:id', getCashbackOffer);
router.put('/cashback-offers/:id', updateCashbackOffer);
router.delete('/cashback-offers/:id', deleteCashbackOffer);
router.patch('/cashback-offers/:id/toggle', toggleCashbackOffer);

export default router;
