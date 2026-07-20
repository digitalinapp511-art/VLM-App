import { asyncHandler } from '../middleware/errorHandler.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';

// Helper to resolve user name & profile photo based on role
export const resolveUserProfile = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) return { name: 'Unknown', nickname: 'Unknown', photo: '', role: 'N/A' };

  const usernameDisplay = user.username ? `@${user.username}` : '';

  if (user.role === 'student') {
    const student = await Student.findOne({ userId }).lean();
    const fullName = student ? `${student.firstName} ${student.lastName || ''}`.trim() : user.mobile;
    return {
      userId,
      name: usernameDisplay || student?.nickname || student?.firstName || fullName || 'Student',
      nickname: usernameDisplay || student?.nickname || student?.firstName || 'Student',
      photo: student?.publicProfilePhoto || student?.profilePhoto || '',
      role: 'student',
      username: user.username || ''
    };
  } else if (user.role === 'teacher') {
    const teacher = await Teacher.findOne({ userId }).lean();
    const fullName = teacher ? `${teacher.firstName} ${teacher.lastName || ''}`.trim() : 'Teacher';
    return {
      userId,
      name: usernameDisplay || fullName,
      nickname: usernameDisplay || teacher?.firstName || fullName,
      photo: teacher?.publicProfilePhoto || teacher?.profilePhoto || '',
      role: 'teacher',
      username: user.username || ''
    };
  }
  
  return { name: 'Admin', nickname: 'Admin', photo: '', role: 'admin' };
};

// @desc    Toggle like on short video
// @route   POST /api/student/videos/:id/like
// @access  Private
export const toggleLikeShortVideo = asyncHandler(async (req, res) => {
  const ShortVideo = (await import('../models/ShortVideo.js')).default;
  const video = await ShortVideo.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  const userId = req.user._id;
  const likedIndex = video.likedBy.indexOf(userId);

  if (likedIndex > -1) {
    video.likedBy.splice(likedIndex, 1);
    video.likes = Math.max(0, video.likes - 1);
  } else {
    video.likedBy.push(userId);
    video.likes += 1;
  }

  await video.save();
  res.json({ success: true, likes: video.likes, liked: likedIndex === -1 });
});

// @desc    Increment views on short video
// @route   POST /api/student/videos/:id/view
// @access  Private
export const incrementShortVideoView = asyncHandler(async (req, res) => {
  const ShortVideo = (await import('../models/ShortVideo.js')).default;
  const video = await ShortVideo.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  const userId = req.user._id;
  if (!video.viewedBy.includes(userId)) {
    video.viewedBy.push(userId);
    video.views += 1;
    await video.save();
  }

  res.json({ success: true, views: video.views });
});

// @desc    Increment shares on short video
// @route   POST /api/student/videos/:id/share
// @access  Private
export const incrementShortVideoShare = asyncHandler(async (req, res) => {
  const ShortVideo = (await import('../models/ShortVideo.js')).default;
  const video = await ShortVideo.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  const userId = req.user._id;
  if (!video.sharedBy.includes(userId)) {
    video.sharedBy.push(userId);
    video.shares += 1;
    await video.save();
  }

  res.json({ success: true, shares: video.shares });
});

// @desc    Add comment to short video
// @route   POST /api/student/videos/:id/comment
// @access  Private
export const addShortVideoComment = asyncHandler(async (req, res) => {
  const ShortVideo = (await import('../models/ShortVideo.js')).default;
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ success: false, message: 'Comment text is required' });
  }

  const video = await ShortVideo.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  const comment = {
    userId: req.user._id,
    text: text.trim(),
    createdAt: new Date()
  };

  video.comments.push(comment);
  await video.save();

  const userDetails = await resolveUserProfile(req.user._id);

  res.status(201).json({
    success: true,
    data: {
      _id: video.comments[video.comments.length - 1]._id,
      text: comment.text,
      createdAt: comment.createdAt,
      user: userDetails
    }
  });
});

// @desc    Delete comment from short video
// @route   DELETE /api/student/videos/:id/comment/:commentId
// @access  Private
export const deleteShortVideoComment = asyncHandler(async (req, res) => {
  const ShortVideo = (await import('../models/ShortVideo.js')).default;
  const { id, commentId } = req.params;

  const video = await ShortVideo.findById(id);
  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  const comment = video.comments.id(commentId);
  if (!comment) {
    return res.status(404).json({ success: false, message: 'Comment not found' });
  }

  if (comment.userId.toString() !== req.user._id.toString() && video.uploaderId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
  }

  video.comments.pull(commentId);
  await video.save();

  res.json({ success: true, message: 'Comment deleted successfully' });
});

// @desc    Get comments list for short video
// @route   GET /api/student/videos/:id/comments
// @access  Private
export const getShortVideoComments = asyncHandler(async (req, res) => {
  const ShortVideo = (await import('../models/ShortVideo.js')).default;
  const video = await ShortVideo.findById(req.params.id).lean();
  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  const commentsWithUser = await Promise.all(
    (video.comments || []).map(async (c) => {
      const user = await resolveUserProfile(c.userId);
      return {
        _id: c._id,
        text: c.text,
        createdAt: c.createdAt,
        user
      };
    })
  );

  res.json({ success: true, data: commentsWithUser });
});

// @desc    Get public profile of a user
// @route   GET /api/student/social/profile/:id
// @access  Private
export const getPublicProfile = asyncHandler(async (req, res) => {
  const Student = (await import('../models/Student.js')).default;
  const Teacher = (await import('../models/Teacher.js')).default;
  const Follow = (await import('../models/Follow.js')).default;
  const ShortVideo = (await import('../models/ShortVideo.js')).default;
  const User = (await import('../models/User.js')).default;

  const targetUserId = req.params.id;
  const targetUser = await User.findById(targetUserId).lean();
  if (!targetUser) {
    return res.json({
      success: true,
      data: {
        userId: targetUserId,
        fullName: 'Deleted User',
        nickname: '@deleted_user',
        profilePhoto: '',
        bio: 'This account is no longer active.',
        role: 'student',
        followersCount: 0,
        followingCount: 0,
        isFollowing: false,
        totalViews: 0,
        videos: []
      }
    });
  }

  const [followersCount, followingCount, isFollowing] = await Promise.all([
    Follow.countDocuments({ followingId: targetUserId }),
    Follow.countDocuments({ followerId: targetUserId }),
    Follow.exists({ followerId: req.user._id, followingId: targetUserId })
  ]);

  let profileDetails = {};
  if (targetUser.role === 'student') {
    const student = await Student.findOne({ userId: targetUserId }).lean();
    const fullName = student ? `${student.firstName} ${student.lastName || ''}`.trim() : 'Student';
    profileDetails = {
      fullName,
      nickname: targetUser.username ? `@${targetUser.username}` : (student?.nickname || student?.firstName || 'Student'),
      username: targetUser.username || '',
      profilePhoto: student?.publicProfilePhoto || student?.profilePhoto || '',
      bio: student?.bio || student?.learningGoals || '',
      class: student?.class || '',
      board: student?.board || '',
      role: 'student'
    };
  } else if (targetUser.role === 'teacher') {
    const teacher = await Teacher.findOne({ userId: targetUserId }).lean();
    const fullName = teacher ? `${teacher.firstName} ${teacher.lastName || ''}`.trim() : 'Teacher';
    profileDetails = {
      fullName,
      nickname: targetUser.username ? `@${targetUser.username}` : (teacher?.firstName || fullName),
      username: targetUser.username || '',
      profilePhoto: teacher?.publicProfilePhoto || teacher?.profilePhoto || '',
      bio: teacher?.bio || teacher?.teachingStyle || '',
      subjects: teacher?.subjects || [],
      role: 'teacher'
    };
  }

  const videos = await ShortVideo.find({ uploaderId: targetUserId, status: 'approved' })
    .sort({ createdAt: -1 })
    .lean();

  const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);

  res.json({
    success: true,
    data: {
      userId: targetUserId,
      ...profileDetails,
      followersCount,
      followingCount,
      isFollowing: !!isFollowing,
      totalViews,
      videos: videos.map(v => ({
        videoId: v._id,
        title: v.title,
        description: v.description,
        videoUrl: v.videoUrl,
        thumbnailUrl: v.thumbnailUrl,
        views: v.views,
        likes: v.likes,
        createdAt: v.createdAt
      }))
    }
  });
});

// @desc    Edit own public profile
// @route   PUT /api/student/social/profile
// @access  Private
export const editPublicProfile = asyncHandler(async (req, res) => {
  const Student = (await import('../models/Student.js')).default;
  const Teacher = (await import('../models/Teacher.js')).default;

  const { nickname, bio, profilePhoto, publicProfilePhoto } = req.body;
  if (bio && bio.length > 160) {
    return res.status(400).json({ success: false, message: 'Bio exceeds maximum limit of 160 characters' });
  }
  const userId = req.user._id;

  let updatedProfile = null;
  if (req.user.role === 'student') {
    const updateFields = {};
    if (nickname !== undefined) updateFields.nickname = nickname;
    if (bio !== undefined) updateFields.bio = bio;
    if (profilePhoto !== undefined) updateFields.profilePhoto = profilePhoto;
    if (publicProfilePhoto !== undefined) updateFields.publicProfilePhoto = publicProfilePhoto;

    updatedProfile = await Student.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true }
    );
  } else if (req.user.role === 'teacher') {
    const updateFields = {};
    if (nickname !== undefined) updateFields.nickname = nickname;
    if (bio !== undefined) updateFields.bio = bio;
    if (profilePhoto !== undefined) updateFields.profilePhoto = profilePhoto;
    if (publicProfilePhoto !== undefined) updateFields.publicProfilePhoto = publicProfilePhoto;

    updatedProfile = await Teacher.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true }
    );
  }

  if (!updatedProfile) {
    return res.status(404).json({ success: false, message: 'Profile not found' });
  }

  res.json({ success: true, message: 'Profile updated successfully', data: updatedProfile });
});

// @desc    Toggle follow on user
// @route   POST /api/student/social/profile/:id/follow
// @access  Private
export const toggleFollowUser = asyncHandler(async (req, res) => {
  const Follow = (await import('../models/Follow.js')).default;
  const followerId = req.user._id;
  const followingId = req.params.id;

  if (followerId.toString() === followingId.toString()) {
    return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
  }

  const existingFollow = await Follow.findOne({ followerId, followingId });

  if (existingFollow) {
    await Follow.findByIdAndDelete(existingFollow._id);
    res.json({ success: true, followed: false, message: 'Unfollowed successfully' });
  } else {
    await Follow.create({ followerId, followingId });
    res.json({ success: true, followed: true, message: 'Followed successfully' });
  }
});

// @desc    Check username availability
// @route   GET /api/student/social/username/check
// @access  Private
export const checkUsernameAvailability = asyncHandler(async (req, res) => {
  let { username } = req.query;
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username parameter is required' });
  }

  username = username.replace(/^@/, '').toLowerCase().trim();

  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (!alphanumericRegex.test(username)) {
    return res.json({ 
      success: true, 
      available: false, 
      message: 'Username must contain only alphanumeric characters (no spaces, no symbols)' 
    });
  }

  const exists = await User.exists({ username });

  res.json({
    success: true,
    available: !exists,
    username: `@${username}`,
    message: exists ? 'Username is already taken' : 'Username is available'
  });
});

// @desc    Create public profile username
// @route   POST /api/student/social/username
// @access  Private
export const createPublicProfileUsername = asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;
  let { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required' });
  }

  username = username.replace(/^@/, '').toLowerCase().trim();

  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (!alphanumericRegex.test(username)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username must contain only alphanumeric characters (no spaces, no symbols)' 
    });
  }

  const exists = await User.exists({ username });
  if (exists) {
    return res.status(400).json({ success: false, message: 'Username is already taken' });
  }

  const user = await User.findById(req.user._id);
  user.username = username;
  await user.save();

  res.json({
    success: true,
    message: 'Public profile username created successfully',
    username: `@${username}`
  });
});
