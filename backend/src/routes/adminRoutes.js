import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

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
  getResources, createResource, updateResource, deleteResource,
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

// ── DASHBOARD ────────────────────────────────────────────────────────────────
router.get('/dashboard', getAdminDashboard);
router.get('/dashboard/live-stats', getDashboardLiveStats);
router.get('/dashboard/analytics', getDashboardAnalytics);
router.get('/dashboard/revenue', getDashboardRevenue);
router.get('/dashboard/system-health', getSystemHealth);
router.get('/dashboard/recent-activities', getRecentActivities);
router.get('/dashboard/notifications', getAdminNotifications);

// ── STUDENTS ─────────────────────────────────────────────────────────────────
router.get('/students/search', searchStudents);
router.get('/students/filter', filterStudents);
router.get('/students/export', exportStudents);
router.post('/students/bulk-import', bulkImportStudents);
router.get('/students', getStudents);
router.post('/students', createStudent);
router.get('/students/:id', getStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.put('/students/:id/status', updateStudentStatus);
router.put('/students/:id/wallet', updateStudentWallet);
router.put('/students/:id/subscription', updateStudentSubscription);
router.put('/students/:id/kyc', updateStudentKyc);
router.get('/students/:id/activity', getStudentActivity);
router.get('/students/:id/devices', getStudentDevices);
router.get('/students/:id/sessions', getStudentSessions);

// ── PARENTS ──────────────────────────────────────────────────────────────────
router.get('/parents/activity', getParentActivity);
router.get('/parents/reports', getParentReports);
router.post('/parents/link', linkParentToStudent);
router.post('/parents/unlink', unlinkParentFromStudent);
router.get('/parents', getParents);
router.post('/parents', createParent);
router.get('/parents/:id', getParent);
router.put('/parents/:id', updateParent);
router.delete('/parents/:id', deleteParent);

// ── TEACHERS ─────────────────────────────────────────────────────────────────
router.get('/teachers/performance', getTeacherPerformance);
router.get('/teachers/earnings', getTeacherEarnings);
router.get('/teachers/wallet', getTeacherWallets);
router.get('/teachers/withdrawals', getTeacherWithdrawals);
router.get('/teachers', getTeachers);
router.post('/teachers', createTeacher);
router.get('/teachers/:id', getTeacher);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);
router.post('/teachers/:id/approve', approveTeacher);
router.post('/teachers/:id/reject', rejectTeacher);
router.put('/teachers/:id/status', updateTeacherStatus);
router.put('/teachers/:id/availability', updateTeacherAvailability);

// ── WITHDRAWALS ───────────────────────────────────────────────────────────────
router.get('/withdrawals', getWithdrawals);
router.get('/withdrawals/:id', getWithdrawal);
router.post('/withdrawals/:id/approve', approveWithdrawal);
router.post('/withdrawals/:id/reject', rejectWithdrawal);

// ── FINANCIAL ────────────────────────────────────────────────────────────────
router.get('/financials', getFinancials);
router.get('/payments', getPayments);
router.get('/invoices', getInvoices);
router.get('/refunds', getRefunds);
router.get('/commissions', getCommissions);

// ── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
router.get('/subscriptions', getSubscriptions);

// ── WALLET ───────────────────────────────────────────────────────────────────
router.get('/wallet', getAdminWallet);
router.get('/wallet/transactions', getWalletTransactions);
router.post('/wallet/recharge', rechargeWallet);
router.post('/wallet/reward', rewardWallet);
router.post('/wallet/redeem', redeemWallet);

// ── DOUBTS ───────────────────────────────────────────────────────────────────
router.get('/doubts/analytics', getDoubtsAnalytics);
router.get('/doubts', getDoubts);
router.get('/doubts/:id', getDoubt);
router.put('/doubts/:id', updateDoubt);
router.post('/doubts/:id/assign', assignDoubt);
router.post('/doubts/:id/resolve', resolveDoubt);

// ── AI ───────────────────────────────────────────────────────────────────────
router.get('/ai/prompts', getAiPrompts);
router.post('/ai/prompts', createAiPrompt);
router.put('/ai/prompts/:id', updateAiPrompt);
router.delete('/ai/prompts/:id', deleteAiPrompt);
router.get('/ai/analytics', getAiAnalytics);
router.get('/ai/credits', getAiCredits);
router.get('/ai/reports', getAiReports);

// ── LIVE SESSIONS ─────────────────────────────────────────────────────────────
router.get('/live-sessions/analytics', getLiveSessionAnalytics);
router.get('/live-sessions', getLiveSessions);
router.get('/live-sessions/:id', getLiveSession);
router.post('/live-sessions/:id/end', endLiveSession);

// ── LIVE CLASSES ──────────────────────────────────────────────────────────────
router.get('/live-classes/attendance', getLiveClassAttendance);
router.get('/live-classes/analytics', getLiveClassAnalytics);
router.get('/live-classes', getLiveClasses);
router.post('/live-classes', createLiveClass);
router.put('/live-classes/:id', updateLiveClass);
router.delete('/live-classes/:id', deleteLiveClass);
router.post('/live-classes/:id/approve', approveLiveClass);

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
router.get('/resources', getResources);
router.post('/resources', createResource);
router.put('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

// ── MCQ ──────────────────────────────────────────────────────────────────────
router.get('/mcq', getMcqs);
router.post('/mcq', createMcq);
router.put('/mcq/:id', updateMcq);
router.delete('/mcq/:id', deleteMcq);
router.get('/results', getMcqResults);
router.get('/leaderboard', getMcqLeaderboard);

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

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
router.get('/notifications', getNotifications);
router.post('/notifications', createNotification);
router.put('/notifications/:id', updateNotification);
router.delete('/notifications/:id', deleteNotification);
router.post('/broadcast', broadcastNotification);

// ── SUPPORT ───────────────────────────────────────────────────────────────────
router.get('/tickets', getTickets);
router.post('/tickets', createTicket);
router.put('/tickets/:id', updateTicket);
router.delete('/tickets/:id', deleteTicket);
router.get('/feedback', getFeedback);

// ── MEDIA ────────────────────────────────────────────────────────────────────
router.get('/media', getMedia);
router.post('/media', uploadMedia);
router.delete('/media/:id', deleteMedia);

// ── SYSTEM SETTINGS ──────────────────────────────────────────────────────────
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/system-config', getSystemConfig);
router.put('/system-config', updateSystemConfig);

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

export default router;
