import DoubtRequest from '../../models/DoubtRequest.js';
import Session from '../../models/Session.js';
import ShortVideo from '../../models/ShortVideo.js';
import LiveClass from '../../models/LiveClass.js';
import McqTask from '../../models/McqTask.js';
import Student from '../../models/Student.js';
import Teacher from '../../models/Teacher.js';
import Notification from '../../models/Notification.js';
import SupportTicket from '../../models/SupportTicket.js';
import AdminSettings from '../../models/AdminSettings.js';
import StudyResource from '../../models/StudyResource.js';
import WalletTransaction from '../../models/WalletTransaction.js';
import User from '../../models/User.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

// ════════════════════════════════════════════════════════════════
//  DOUBTS
// ════════════════════════════════════════════════════════════════

export const getDoubts = asyncHandler(async (req, res) => {
  const { status, sessionType, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (sessionType) filter.sessionType = sessionType;
  const skip = (page - 1) * limit;

  const [doubts, total] = await Promise.all([
    DoubtRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
      .populate('studentId', 'fullName class')
      .populate('assignedTeacherId', 'fullName vlmTeacherId'),
    DoubtRequest.countDocuments(filter),
  ]);

  res.json({ success: true, data: doubts, pagination: { total, page: Number(page), limit: Number(limit) } });
});

export const getDoubt = asyncHandler(async (req, res) => {
  const doubt = await DoubtRequest.findById(req.params.id)
    .populate('studentId', 'fullName class board')
    .populate('assignedTeacherId', 'fullName vlmTeacherId');
  if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });
  res.json({ success: true, data: doubt });
});

export const updateDoubt = asyncHandler(async (req, res) => {
  const doubt = await DoubtRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });
  res.json({ success: true, message: 'Doubt updated', data: doubt });
});

export const assignDoubt = asyncHandler(async (req, res) => {
  const { teacherId } = req.body;
  const doubt = await DoubtRequest.findByIdAndUpdate(
    req.params.id,
    { assignedTeacherId: teacherId, status: 'assigned' },
    { new: true }
  );
  if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });
  res.json({ success: true, message: 'Doubt assigned', data: doubt });
});

export const resolveDoubt = asyncHandler(async (req, res) => {
  const doubt = await DoubtRequest.findByIdAndUpdate(
    req.params.id,
    { status: 'completed' },
    { new: true }
  );
  if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });
  res.json({ success: true, message: 'Doubt resolved', data: doubt });
});

export const getDoubtsAnalytics = asyncHandler(async (req, res) => {
  const [total, searching, completed, chat, audio, video] = await Promise.all([
    DoubtRequest.countDocuments(),
    DoubtRequest.countDocuments({ status: 'searching' }),
    DoubtRequest.countDocuments({ status: 'completed' }),
    DoubtRequest.countDocuments({ sessionType: 'chat' }),
    DoubtRequest.countDocuments({ sessionType: 'audio' }),
    DoubtRequest.countDocuments({ sessionType: 'video' }),
  ]);
  res.json({ success: true, data: { total, searching, completed, byType: { chat, audio, video } } });
});

// ════════════════════════════════════════════════════════════════
//  AI
// ════════════════════════════════════════════════════════════════

export const getAiPrompts = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.find({ category: 'ai' });
  res.json({ success: true, data: settings });
});

export const createAiPrompt = asyncHandler(async (req, res) => {
  const { key, description, value } = req.body;
  const prompt = await AdminSettings.create({ key, category: 'ai', description, value });
  res.status(201).json({ success: true, data: prompt });
});

export const updateAiPrompt = asyncHandler(async (req, res) => {
  const setting = await AdminSettings.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!setting) return res.status(404).json({ success: false, message: 'AI prompt not found' });
  res.json({ success: true, data: setting });
});

export const deleteAiPrompt = asyncHandler(async (req, res) => {
  await AdminSettings.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'AI prompt deleted' });
});

export const getAiAnalytics = asyncHandler(async (req, res) => {
  const totalAiSessions = await Session.countDocuments({ sessionType: 'ai' });
  const recentSessions = await Session.find({ sessionType: 'ai' }).sort({ createdAt: -1 }).limit(10);
  res.json({ success: true, data: { totalAiSessions, recentSessions } });
});

export const getAiCredits = asyncHandler(async (req, res) => {
  const students = await Student.find().select('fullName vlmStudentId wallet.aiCredits');
  res.json({ success: true, data: students });
});

export const getAiReports = asyncHandler(async (req, res) => {
  const [total, completed, cancelled] = await Promise.all([
    Session.countDocuments({ sessionType: 'ai' }),
    Session.countDocuments({ sessionType: 'ai', status: 'completed' }),
    Session.countDocuments({ sessionType: 'ai', status: 'cancelled' }),
  ]);
  res.json({ success: true, data: { total, completed, cancelled } });
});

// ════════════════════════════════════════════════════════════════
//  LIVE SESSIONS
// ════════════════════════════════════════════════════════════════

export const getLiveSessions = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    Session.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
      .populate('studentId', 'fullName')
      .populate('teacherId', 'fullName vlmTeacherId'),
    Session.countDocuments(filter),
  ]);

  res.json({ success: true, data: sessions, pagination: { total, page: Number(page), limit: Number(limit) } });
});

export const getLiveSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id)
    .populate('studentId', 'fullName class')
    .populate('teacherId', 'fullName vlmTeacherId');
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  res.json({ success: true, data: session });
});

export const endLiveSession = asyncHandler(async (req, res) => {
  const session = await Session.findByIdAndUpdate(req.params.id, { status: 'ended', endedAt: new Date() }, { new: true });
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
  res.json({ success: true, message: 'Session ended', data: session });
});

export const getLiveSessionAnalytics = asyncHandler(async (req, res) => {
  const [total, active, completed, chat, audio, video] = await Promise.all([
    Session.countDocuments(),
    Session.countDocuments({ status: { $in: ['active', 'ongoing'] } }),
    Session.countDocuments({ status: 'completed' }),
    Session.countDocuments({ sessionType: 'chat' }),
    Session.countDocuments({ sessionType: 'audio' }),
    Session.countDocuments({ sessionType: 'video' }),
  ]);
  res.json({ success: true, data: { total, active, completed, byType: { chat, audio, video } } });
});

// ════════════════════════════════════════════════════════════════
//  LIVE CLASSES
// ════════════════════════════════════════════════════════════════

export const getLiveClasses = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const skip = (page - 1) * limit;

  const [classes, total] = await Promise.all([
    LiveClass.find(filter).sort({ scheduledAt: -1 }).skip(skip).limit(Number(limit))
      .populate('teacherId', 'fullName vlmTeacherId'),
    LiveClass.countDocuments(filter),
  ]);

  res.json({ success: true, data: classes, pagination: { total, page: Number(page), limit: Number(limit) } });
});

export const createLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.create({ ...req.body, status: 'approved' });
  res.status(201).json({ success: true, data: liveClass });
});

export const updateLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!liveClass) return res.status(404).json({ success: false, message: 'Live class not found' });
  res.json({ success: true, data: liveClass });
});

export const deleteLiveClass = asyncHandler(async (req, res) => {
  await LiveClass.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Live class deleted' });
});

export const approveLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  if (!liveClass) return res.status(404).json({ success: false, message: 'Live class not found' });
  res.json({ success: true, message: 'Live class approved', data: liveClass });
});

export const getLiveClassAttendance = asyncHandler(async (req, res) => {
  const classes = await LiveClass.find({ 'attendees.0': { $exists: true } })
    .select('topic subject class scheduledAt attendees metrics');
  res.json({ success: true, data: classes });
});

export const getLiveClassAnalytics = asyncHandler(async (req, res) => {
  const [total, live, ended, pending] = await Promise.all([
    LiveClass.countDocuments(),
    LiveClass.countDocuments({ status: 'live' }),
    LiveClass.countDocuments({ status: 'ended' }),
    LiveClass.countDocuments({ status: 'pending' }),
  ]);
  res.json({ success: true, data: { total, live, ended, pending } });
});

// ════════════════════════════════════════════════════════════════
//  SHORT VIDEOS
// ════════════════════════════════════════════════════════════════

export const getVideos = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const skip = (page - 1) * limit;

  const [videos, total] = await Promise.all([
    ShortVideo.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('uploaderId', 'firstName lastName email mobile role username')
      .lean(),
    ShortVideo.countDocuments(filter),
  ]);

  const Student = (await import('../../models/Student.js')).default;
  const Teacher = (await import('../../models/Teacher.js')).default;
  const Follow = (await import('../../models/Follow.js')).default;

  const detailedVideos = await Promise.all(
    videos.map(async (video) => {
      const uploader = video.uploaderId || {};
      let uploaderProfile = {
        name: uploader.firstName ? `${uploader.firstName} ${uploader.lastName || ''}`.trim() : 'Unknown',
        username: uploader.username || '',
        email: uploader.email || 'N/A',
        mobile: uploader.mobile || 'N/A',
        role: video.uploaderRole || uploader.role || 'student'
      };

      const [followersCount, followingCount] = await Promise.all([
        uploader._id ? Follow.countDocuments({ followingId: uploader._id }) : 0,
        uploader._id ? Follow.countDocuments({ followerId: uploader._id }) : 0
      ]);
      uploaderProfile.followersCount = followersCount;
      uploaderProfile.followingCount = followingCount;

      if (uploaderProfile.role === 'student') {
        const student = await Student.findOne({ userId: uploader._id }).lean();
        if (student) {
          uploaderProfile.name = student.firstName ? `${student.firstName} ${student.lastName || ''}`.trim() : uploaderProfile.name;
          uploaderProfile.nickname = student.nickname || '';
          uploaderProfile.email = student.email || uploaderProfile.email;
          uploaderProfile.mobile = student.mobile || uploaderProfile.mobile;
          uploaderProfile.class = student.class;
          uploaderProfile.board = student.board;
        }
      } else if (uploaderProfile.role === 'teacher') {
        const teacher = await Teacher.findOne({ userId: uploader._id }).lean();
        if (teacher) {
          uploaderProfile.name = teacher.firstName ? `${teacher.firstName} ${teacher.lastName || ''}`.trim() : uploaderProfile.name;
          uploaderProfile.email = teacher.email || uploaderProfile.email;
          uploaderProfile.mobile = teacher.mobile || uploaderProfile.mobile;
          uploaderProfile.subjects = teacher.subjects || [];
        }
      }

      return {
        ...video,
        uploader: uploaderProfile
      };
    })
  );

  res.json({
    success: true,
    data: detailedVideos,
    pagination: { total, page: Number(page), limit: Number(limit) }
  });
});

const sanitizeArrayInput = (input) => {
  if (Array.isArray(input)) {
    return input.map(item => String(item).trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input.split(',').map(item => item.trim()).filter(Boolean);
  }
  return input;
};

export const createVideo = asyncHandler(async (req, res) => {
  const insertData = { ...req.body };
  if (insertData.targetClasses !== undefined) {
    insertData.targetClasses = sanitizeArrayInput(insertData.targetClasses);
  }
  const video = await ShortVideo.create({ ...insertData, uploaderId: req.user._id, uploaderRole: 'teacher', status: 'approved' });
  res.status(201).json({ success: true, data: video });
});

export const updateVideo = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (updateData.targetClasses !== undefined) {
    updateData.targetClasses = sanitizeArrayInput(updateData.targetClasses);
  }

  const oldVideo = await ShortVideo.findById(req.params.id);
  if (!oldVideo) return res.status(404).json({ success: false, message: 'Video not found' });

  const isApproving = updateData.status === 'approved' && oldVideo.status !== 'approved';

  const video = await ShortVideo.findByIdAndUpdate(req.params.id, updateData, { new: true });

  if (isApproving) {
    try {
      const { createNotification } = await import('../../services/notificationService.js');
      await createNotification(
        video.uploaderId,
        'short_video_approved',
        'Your Short Video is Live! 🎥',
        `Your video "${video.title}" has been approved and is now live for targeted students.`,
        { videoId: video._id.toString() }
      );
    } catch (err) {
      console.error('[Admin updateVideo approve notification error]', err.message);
    }
  }

  res.json({ success: true, data: video });
});

export const deleteVideo = asyncHandler(async (req, res) => {
  await ShortVideo.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Video deleted' });
});

export const approveVideo = asyncHandler(async (req, res) => {
  const video = await ShortVideo.findById(req.params.id);
  if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
  
  video.status = 'approved';
  await video.save();

  // Send notification to the uploader
  try {
    const { createNotification } = await import('../../services/notificationService.js');
    await createNotification(
      video.uploaderId,
      'short_video_approved',
      'Your Short Video is Live! 🎥',
      `Your video "${video.title}" has been approved and is now live for targeted students.`,
      { videoId: video._id.toString() }
    );
  } catch (err) {
    console.error('[ApproveVideo notification error]', err.message);
  }

  res.json({ success: true, message: 'Video approved', data: video });
});

export const rejectVideo = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const video = await ShortVideo.findByIdAndUpdate(req.params.id, { status: 'rejected', rejectionReason: reason }, { new: true });
  if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
  res.json({ success: true, message: 'Video rejected', data: video });
});

// ════════════════════════════════════════════════════════════════
//  MCQ
// ════════════════════════════════════════════════════════════════

export const getMcqs = asyncHandler(async (req, res) => {
  const { status, class: cls, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (cls) filter.class = cls;

  const [tasks, total] = await Promise.all([
    McqTask.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(Number(limit))
      .populate('studentId', 'fullName class'),
    McqTask.countDocuments(filter),
  ]);

  res.json({ success: true, data: tasks, pagination: { total, page: Number(page), limit: Number(limit) } });
});

export const createMcq = asyncHandler(async (req, res) => {
  const mcq = await McqTask.create(req.body);
  res.status(201).json({ success: true, data: mcq });
});

export const updateMcq = asyncHandler(async (req, res) => {
  const mcq = await McqTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!mcq) return res.status(404).json({ success: false, message: 'MCQ not found' });
  res.json({ success: true, data: mcq });
});

export const deleteMcq = asyncHandler(async (req, res) => {
  await McqTask.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'MCQ deleted' });
});

// MCQ Results / Leaderboard

export const getMcqResults = asyncHandler(async (req, res) => {
  const results = await McqTask.find({ status: 'completed' })
    .sort({ score: -1 })
    .limit(100)
    .populate('studentId', 'fullName class vlmStudentId');
  res.json({ success: true, data: results });
});

export const getMcqLeaderboard = asyncHandler(async (req, res) => {
  const students = await Student.find()
    .sort({ mcqPoints: -1, totalPoints: -1 })
    .limit(50)
    .select('fullName class vlmStudentId mcqPoints totalPoints streak avatarUrl');
  res.json({ success: true, data: students });
});

// ════════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ════════════════════════════════════════════════════════════════

export const getNotifications = asyncHandler(async (req, res) => {
  const { userId, page = 1, limit = 30 } = req.query;
  const filter = userId ? { userId } : {};
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, data: notifications });
});

export const createNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, message, data, priority } = req.body;
  if (!userId || !type || !title)
    return res.status(400).json({ success: false, message: 'userId, type, and title are required' });

  const notification = await Notification.create({ userId, type, title, message, data, priority });
  res.status(201).json({ success: true, data: notification });
});

export const updateNotification = asyncHandler(async (req, res) => {
  const notif = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, data: notif });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Notification deleted' });
});

export const broadcastNotification = asyncHandler(async (req, res) => {
  const { roles = ['student', 'teacher', 'parent'], type, title, message, data, priority = 'medium' } = req.body;
  if (!type || !title) return res.status(400).json({ success: false, message: 'type and title are required' });

  const users = await User.find({ role: { $in: roles } }).select('_id');
  const notifications = users.map(u => ({
    userId: u._id, type, title, message, data, priority,
  }));

  const result = await Notification.insertMany(notifications, { ordered: false });
  res.json({ success: true, message: `Broadcast sent to ${result.length} users`, count: result.length });
});

// ════════════════════════════════════════════════════════════════
//  SUPPORT TICKETS
// ════════════════════════════════════════════════════════════════

export const getTickets = asyncHandler(async (req, res) => {
  const { status, category, priority, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter).sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit))
      .populate('userId', 'name email'),
    SupportTicket.countDocuments(filter),
  ]);

  res.json({ success: true, data: tickets, pagination: { total, page: Number(page), limit: Number(limit) } });
});

export const createTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data: ticket });
});

export const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  res.json({ success: true, data: ticket });
});

export const deleteTicket = asyncHandler(async (req, res) => {
  await SupportTicket.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Ticket deleted' });
});

export const getFeedback = asyncHandler(async (req, res) => {
  // Feedback sourced from ticket replies and resolved tickets
  const feedback = await SupportTicket.find({ status: 'resolved' })
    .select('userId subject category createdAt')
    .populate('userId', 'name email')
    .sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: feedback });
});

// ════════════════════════════════════════════════════════════════
//  RESOURCES  (notes/pyqs/study materials)
// ════════════════════════════════════════════════════════════════

export const getResources = asyncHandler(async (req, res) => {
  const { type, className, subject } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (className) filter.className = className;
  if (subject) filter.subject = subject;
  const resources = await StudyResource.find(filter).sort({ createdAt: -1 });
  const mapped = resources.map(r => ({
    _id: r._id,
    title: r.title,
    type: r.type,
    board: r.board,
    className: r.className,
    subject: r.subject,
    chapterName: r.chapterName,
    topic: r.topic,
    description: r.description,
    resourceType: r.resourceType,
    visibility: r.visibility,
    status: r.status,
    pdfUrl: r.pdfUrl || r.fileUrl,
    thumbnailUrl: r.thumbnailUrl,
    createdAt: r.createdAt
  }));
  res.json({ success: true, data: mapped });
});

export const getSubjectsByClass = asyncHandler(async (req, res) => {
  const { className } = req.query;
  if (!className) return res.status(400).json({ success: false, message: 'className is required' });
  // Normalize: accept '10', '10th', 'class-10' all map to the same
  const classNum = String(className).replace(/\D/g, '');
  const classVariants = [classNum, `${classNum}th`, `class-${classNum}`];
  const subjects = await StudyResource.distinct('subject', {
    className: { $in: classVariants },
    visibility: 'public',
    status: 'active'
  });
  res.json({ success: true, data: subjects });
});

export const createResource = asyncHandler(async (req, res) => {
  const resourceData = { ...req.body };
  if (req.file) {
    const fileUrl = req.file.filename || req.file.cloudinaryUrl || req.file.path;
    if (resourceData.type === 'video') {
      resourceData.videoUrl = fileUrl;
      resourceData.fileUrl = fileUrl;
    } else {
      resourceData.pdfUrl = fileUrl;
      resourceData.fileUrl = fileUrl;
    }
  }
  const resource = await StudyResource.create({ ...resourceData, uploadedBy: req.user._id });
  res.status(201).json({ success: true, data: resource });
});

export const updateResource = asyncHandler(async (req, res) => {
  const { title, content, description, link, fileUrl, pdfUrl, resourceType, board, visibility, status } = req.body;
  
  const resourceData = {};
  if (title !== undefined) resourceData.title = title;
  
  const finalDescription = content || description;
  if (finalDescription !== undefined) resourceData.description = finalDescription;
  
  if (board !== undefined) resourceData.board = board;
  if (visibility !== undefined) resourceData.visibility = visibility;
  if (status !== undefined) resourceData.status = status;
  
  let finalType;
  if (resourceType !== undefined) {
    let type = 'note';
    if (resourceType === 'videos' || resourceType === 'video') type = 'video';
    else if (resourceType === 'previous_year_papers' || resourceType === 'pyq') type = 'pyq';
    resourceData.type = type;
    finalType = type;
  }

  const finalLink = link || pdfUrl || fileUrl;
  if (finalLink !== undefined) {
    const typeToUse = finalType || (await StudyResource.findById(req.params.id))?.type || 'note';
    if (typeToUse === 'video') {
      resourceData.videoUrl = finalLink;
      resourceData.pdfUrl = '';
    } else {
      resourceData.pdfUrl = finalLink;
      resourceData.videoUrl = '';
    }
    resourceData.fileUrl = finalLink;
  }

  // Also support file uploads if any
  if (req.file) {
    const fileUrlUploaded = req.file.path || req.file.filename;
    const typeToUse = finalType || (await StudyResource.findById(req.params.id))?.type || 'note';
    if (typeToUse === 'video') {
      resourceData.videoUrl = fileUrlUploaded;
    } else {
      resourceData.pdfUrl = fileUrlUploaded;
    }
    resourceData.fileUrl = fileUrlUploaded;
  }

  const resource = await StudyResource.findByIdAndUpdate(req.params.id, resourceData, { new: true });
  if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
  res.json({ success: true, data: resource });
});

export const deleteResource = asyncHandler(async (req, res) => {
  await StudyResource.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Resource deleted' });
});

// ════════════════════════════════════════════════════════════════
//  SPIN WHEEL SETTINGS
// ════════════════════════════════════════════════════════════════


export const getSpinSettings = asyncHandler(async (req, res) => {
  let settings = await AdminSettings.findOne({ key: 'spin_rewards' });
  let cooldownSetting = await AdminSettings.findOne({ key: 'spin_cooldown_hours' });
  let cooldownHours = cooldownSetting ? cooldownSetting.value : 2; // Default to 2 hours
  
  if (!settings) {
    settings = await AdminSettings.create({
      key: 'spin_rewards', category: 'spin',
      description: 'Spin wheel rewards configuration',
      value: [
        { id: 1, name: '10 Coins', probability: 30, color: '#f59e0b', type: 'coins', amount: 10 },
        { id: 2, name: 'Free Chat Session', probability: 20, color: '#3b82f6', type: 'chat_credit', amount: 1 },
        { id: 3, name: 'Better luck next time', probability: 40, color: '#0f172a', type: 'none', amount: 0 },
        { id: 4, name: '50 Coins', probability: 10, color: '#ef4444', type: 'coins', amount: 50 },
      ],
    });
  }
  res.json({ 
    success: true, 
    data: settings.value,
    cooldownHours: Number(cooldownHours) || 2
  });
});

export const createSpinSetting = asyncHandler(async (req, res) => {
  const { rewards, cooldownHours } = req.body;
  console.log("createSpinSetting rewards payload:", JSON.stringify(rewards, null, 2));
  if (rewards && !Array.isArray(rewards))
    return res.status(400).json({ success: false, message: 'rewards array is required' });

  let settings;
  if (rewards) {
    settings = await AdminSettings.findOneAndUpdate(
      { key: 'spin_rewards' },
      { $set: { value: rewards, category: 'spin', description: 'Spin wheel rewards configuration' } },
      { upsert: true, new: true }
    );
  } else {
    settings = await AdminSettings.findOne({ key: 'spin_rewards' });
  }

  let cooldownSetting;
  if (cooldownHours !== undefined) {
    cooldownSetting = await AdminSettings.findOneAndUpdate(
      { key: 'spin_cooldown_hours' },
      { $set: { value: Number(cooldownHours) || 2, category: 'spin', description: 'Cooldown period (in hours) for student spin wheel' } },
      { upsert: true, new: true }
    );
  } else {
    cooldownSetting = await AdminSettings.findOne({ key: 'spin_cooldown_hours' });
  }

  res.json({ 
    success: true, 
    data: settings ? settings.value : [],
    cooldownHours: cooldownSetting ? cooldownSetting.value : 2
  });
});

export const updateSpinSetting = asyncHandler(async (req, res) => {
  const { rewards, cooldownHours } = req.body;
  console.log("updateSpinSetting rewards payload:", JSON.stringify(rewards, null, 2));
  
  let settings;
  if (rewards) {
    settings = await AdminSettings.findOneAndUpdate(
      { key: 'spin_rewards' },
      { $set: { value: rewards } },
      { upsert: true, new: true }
    );
  } else {
    settings = await AdminSettings.findOne({ key: 'spin_rewards' });
  }

  let cooldownSetting;
  if (cooldownHours !== undefined) {
    cooldownSetting = await AdminSettings.findOneAndUpdate(
      { key: 'spin_cooldown_hours' },
      { $set: { value: Number(cooldownHours) || 2 } },
      { upsert: true, new: true }
    );
  } else {
    cooldownSetting = await AdminSettings.findOne({ key: 'spin_cooldown_hours' });
  }

  res.json({ 
    success: true, 
    data: settings ? settings.value : [],
    cooldownHours: cooldownSetting ? cooldownSetting.value : 2
  });
});

export const deleteSpinSetting = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.findOne({ key: 'spin_rewards' });
  if (!settings) return res.status(404).json({ success: false, message: 'Spin settings not found' });

  // Remove item by id from value array
  settings.value = (settings.value || []).filter(item => String(item.id) !== String(req.params.id));
  await settings.save();
  res.json({ success: true, message: 'Spin item removed', data: settings.value });
});

// ════════════════════════════════════════════════════════════════
//  SYSTEM SETTINGS
// ════════════════════════════════════════════════════════════════

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await AdminSettings.find();
  res.json({ success: true, data: settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ success: false, message: 'key is required' });
  const setting = await AdminSettings.findOneAndUpdate({ key }, { value }, { new: true, upsert: true });
  res.json({ success: true, data: setting });
});

export const getSystemConfig = asyncHandler(async (req, res) => {
  const config = await AdminSettings.find({ category: 'system' });
  res.json({ success: true, data: config });
});

export const updateSystemConfig = asyncHandler(async (req, res) => {
  const updates = req.body; // key-value pairs
  const results = [];

  for (const [key, value] of Object.entries(updates)) {
    const setting = await AdminSettings.findOneAndUpdate(
      { key, category: 'system' },
      { value },
      { new: true, upsert: true }
    );
    results.push(setting);
  }

  res.json({ success: true, message: 'System config updated', data: results });
});

// ════════════════════════════════════════════════════════════════
//  FINANCIAL
// ════════════════════════════════════════════════════════════════

export const getFinancials = asyncHandler(async (req, res) => {
  const txs = await WalletTransaction.find({ type: 'credit', role: 'student', inrAmount: { $gt: 0 } });
  const totalRevenue = txs.reduce((s, t) => s + (t.inrAmount || 0), 0);
  res.json({
    success: true,
    data: {
      totalRevenue,
      appCommission: totalRevenue * 0.25,
      teacherShare: totalRevenue * 0.75,
      commissionRate: '25%',
    },
  });
});

export const getPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const payments = await WalletTransaction.find({ inrAmount: { $gt: 0 } })
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit))
    .populate('userId', 'name email');
  res.json({ success: true, data: payments });
});

export const getInvoices = asyncHandler(async (req, res) => {
  const invoices = await WalletTransaction.find({ type: 'credit', role: 'student', inrAmount: { $gt: 0 } })
    .sort({ createdAt: -1 }).limit(100)
    .populate('userId', 'name email');
  res.json({ success: true, data: invoices });
});

export const getRefunds = asyncHandler(async (req, res) => {
  const refunds = await WalletTransaction.find({ type: 'debit', isAdminAdjustment: true })
    .sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: refunds });
});

export const getCommissions = asyncHandler(async (req, res) => {
  const txs = await WalletTransaction.find({ type: 'credit', role: 'student', inrAmount: { $gt: 0 } });
  const total = txs.reduce((s, t) => s + (t.inrAmount || 0), 0);
  res.json({
    success: true,
    data: { totalRevenue: total, appCommission: total * 0.25, teacherEarnings: total * 0.75 },
  });
});

// ════════════════════════════════════════════════════════════════
//  WALLET  (admin-level)
// ════════════════════════════════════════════════════════════════

export const getAdminWallet = asyncHandler(async (req, res) => {
  const txs = await WalletTransaction.find({ isAdminAdjustment: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: txs });
});

export const getWalletTransactions = asyncHandler(async (req, res) => {
  const { role, type, page = 1, limit = 30 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (type) filter.type = type;

  const [txs, total] = await Promise.all([
    WalletTransaction.find(filter).sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit))
      .populate('userId', 'name email'),
    WalletTransaction.countDocuments(filter),
  ]);

  res.json({ success: true, data: txs, pagination: { total, page: Number(page), limit: Number(limit) } });
});

export const rechargeWallet = asyncHandler(async (req, res) => {
  const { userId, role = 'student', points, inrAmount, description } = req.body;
  if (!userId || !points)
    return res.status(400).json({ success: false, message: 'userId and points are required' });

  const tx = await WalletTransaction.create({
    userId, role, type: 'credit', points, inrAmount: inrAmount || 0,
    description: description || 'Admin recharge', isAdminAdjustment: true,
  });

  // Update student wallet
  if (role === 'student') {
    const student = await Student.findOne({ userId });
    if (student) {
      student.totalPoints += points;
      student.wallet.totalPoints += points;
      student.wallet.balance += (inrAmount || 0);
      student.markModified('wallet');
      await student.save();
    }
  }

  res.json({ success: true, message: 'Wallet recharged', data: tx });
});

export const rewardWallet = asyncHandler(async (req, res) => {
  const { userId, points, description } = req.body;
  if (!userId || !points) return res.status(400).json({ success: false, message: 'userId and points are required' });

  const tx = await WalletTransaction.create({
    userId, role: 'student', type: 'credit', points,
    description: description || 'Admin bonus reward', isAdminAdjustment: true,
    earningType: 'bonus',
  });

  await Student.findOneAndUpdate({ userId }, { $inc: { totalPoints: points, 'wallet.totalPoints': points } });
  res.json({ success: true, message: 'Reward granted', data: tx });
});

export const redeemWallet = asyncHandler(async (req, res) => {
  const { userId, points, description } = req.body;
  if (!userId || !points) return res.status(400).json({ success: false, message: 'userId and points are required' });

  const tx = await WalletTransaction.create({
    userId, role: 'student', type: 'debit', points,
    description: description || 'Admin redemption', isAdminAdjustment: true,
  });

  await Student.findOneAndUpdate({ userId }, { $inc: { totalPoints: -points, 'wallet.totalPoints': -points } });
  res.json({ success: true, message: 'Points redeemed', data: tx });
});

// ════════════════════════════════════════════════════════════════
//  CONTENT MANAGEMENT (Boards, Classes, Subjects, Chapters, Topics)
//  These are config-driven via AdminSettings for now
// ════════════════════════════════════════════════════════════════

const contentCrud = (category, label) => ({
  getAll: asyncHandler(async (req, res) => {
    const setting = await AdminSettings.findOne({ key: category });
    res.json({ success: true, data: setting?.value || [] });
  }),
  create: asyncHandler(async (req, res) => {
    let setting = await AdminSettings.findOne({ key: category });
    if (!setting) setting = new AdminSettings({ key: category, category: 'content', description: `${label} list` });
    const newItem = { id: Date.now().toString(), ...req.body, createdAt: new Date() };
    setting.value = [...(setting.value || []), newItem];
    await setting.save();
    res.status(201).json({ success: true, data: newItem });
  }),
  update: asyncHandler(async (req, res) => {
    const setting = await AdminSettings.findOne({ key: category });
    if (!setting) return res.status(404).json({ success: false, message: `${label} settings not found` });
    setting.value = (setting.value || []).map(item =>
      String(item.id) === req.params.id ? { ...item, ...req.body } : item
    );
    await setting.save();
    res.json({ success: true, data: setting.value.find(i => String(i.id) === req.params.id) });
  }),
  delete: asyncHandler(async (req, res) => {
    const setting = await AdminSettings.findOne({ key: category });
    if (!setting) return res.status(404).json({ success: false, message: `${label} settings not found` });
    setting.value = (setting.value || []).filter(item => String(item.id) !== req.params.id);
    await setting.save();
    res.json({ success: true, message: `${label} deleted` });
  }),
});

export const boardsCrud = contentCrud('boards', 'Board');
export const classesCrud = contentCrud('classes', 'Class');
export const subjectsCrud = contentCrud('subjects', 'Subject');
export const chaptersCrud = contentCrud('chapters', 'Chapter');
export const topicsCrud = contentCrud('topics', 'Topic');

// ════════════════════════════════════════════════════════════════
//  SUBSCRIPTIONS
// ════════════════════════════════════════════════════════════════

export const getSubscriptions = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { 'subscription.status': status } : {};
  const students = await Student.find(filter)
    .select('fullName vlmStudentId subscription class')
    .populate('userId', 'email');
  res.json({ success: true, data: students });
});

// ════════════════════════════════════════════════════════════════
//  ADMIN MANAGEMENT (Users / Roles / Audit Logs)
// ════════════════════════════════════════════════════════════════

export const getAdminUsers = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: 'admin' }).select('-password');
  res.json({ success: true, data: admins });
});

export const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password = 'Admin@1234' } = req.body;
  const user = await User.create({ name, email, password, role: 'admin' });
  res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email } });
});

export const updateAdminUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'Admin user not found' });
  res.json({ success: true, data: user });
});

export const deleteAdminUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Admin user deleted' });
});

export const getRoles = asyncHandler(async (req, res) => {
  const roles = ['admin', 'student', 'teacher', 'parent'];
  res.json({ success: true, data: roles });
});

export const getPermissions = asyncHandler(async (req, res) => {
  const permissions = {
    admin: ['read', 'write', 'delete', 'manage_users', 'financial'],
    teacher: ['read', 'upload_content', 'manage_sessions'],
    student: ['read', 'attend_sessions', 'submit_doubts'],
    parent: ['read', 'view_child_data'],
  };
  res.json({ success: true, data: permissions });
});

export const updateRole = asyncHandler(async (req, res) => {
  // In a real system, this would update role-permission mappings in a RBAC store
  res.json({ success: true, message: 'Role permissions updated (mock)' });
});

export const getActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  // Activity logs from WalletTransactions and session events
  const txs = await WalletTransaction.find()
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit))
    .populate('userId', 'name email role');
  res.json({ success: true, data: txs });
});

export const getLoginHistory = asyncHandler(async (req, res) => {
  const users = await User.find({ lastLogin: { $exists: true } })
    .select('name email role lastLogin status')
    .sort({ lastLogin: -1 }).limit(100);
  res.json({ success: true, data: users });
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  // Audit logs sourced from admin adjustments in WalletTransaction
  const logs = await WalletTransaction.find({ isAdminAdjustment: true })
    .sort({ createdAt: -1 }).limit(100)
    .populate('userId', 'name email role');
  res.json({ success: true, data: logs });
});

// ════════════════════════════════════════════════════════════════
//  MEDIA
// ════════════════════════════════════════════════════════════════

export const getMedia = asyncHandler(async (req, res) => {
  const videos = await ShortVideo.find().select('title videoUrl thumbnailUrl status uploaderRole createdAt').sort({ createdAt: -1 });
  const resources = await StudyResource.find().select('title type fileUrl subject className createdAt').sort({ createdAt: -1 });
  res.json({ success: true, data: { videos, resources } });
});

export const uploadMedia = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Use /api/student/doubts/upload or video endpoints for media upload', data: req.body });
});

export const deleteMedia = asyncHandler(async (req, res) => {
  const video = await ShortVideo.findByIdAndDelete(req.params.id);
  const resource = await StudyResource.findByIdAndDelete(req.params.id);
  if (!video && !resource) return res.status(404).json({ success: false, message: 'Media not found' });
  res.json({ success: true, message: 'Media deleted' });
});
