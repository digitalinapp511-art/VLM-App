import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Otp from '../models/Otp.js';
import AdminSettings from '../models/AdminSettings.js';
import { generateToken, protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateOtp, generateReferralCode } from '../utils/helpers.js';
import { ROLES } from '../config/constants.js';

export const sendOtp = asyncHandler(async (req, res) => {
  const { mobile, email, purpose = 'login' } = req.body;
  if (!mobile && !email) {
    return res.status(400).json({ success: false, message: 'Mobile or email required' });
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10) * 60000));

  await Otp.deleteMany({ ...(mobile && { mobile }), ...(email && { email }) });
  await Otp.create({ mobile, email, otp, purpose, expiresAt });

  // In production: send via SMS/email. Dev mode returns OTP.
  res.json({
    success: true,
    message: 'OTP sent successfully',
    ...(process.env.NODE_ENV === 'development' && { otp }),
  });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { mobile, email, otp, role } = req.body;

  const otpRecord = await Otp.findOne({
    ...(mobile && { mobile }),
    ...(email && { email }),
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return res.status(400).json({ success: false, message: 'OTP not found. Please request again.' });
  }
  if (otpRecord.expiresAt < new Date()) {
    return res.status(400).json({ success: false, message: 'OTP expired' });
  }
  if (otpRecord.attempts >= parseInt(process.env.OTP_MAX_RETRIES || '5', 10)) {
    return res.status(429).json({ success: false, message: 'Max retries reached. Try again later.' });
  }
  if (otpRecord.otp !== otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  otpRecord.verified = true;
  await otpRecord.save();

  let user = await User.findOne({ ...(mobile && { mobile }), ...(email && { email }) });

  if (!user) {
    user = await User.create({
      mobile,
      email,
      roles: role ? [role] : [],
      activeRole: role,
      isMobileVerified: !!mobile,
      isEmailVerified: !!email,
      referralCode: generateReferralCode(),
    });
  } else {
    if (role && !user.roles.includes(role)) {
      user.roles.push(role);
    }
    if (role) user.activeRole = role;
    if (mobile) user.isMobileVerified = true;
    if (email) user.isEmailVerified = true;
    user.lastLogin = new Date();
    await user.save();
  }

  const token = generateToken(user._id);
  const profile = await getProfileForRole(user);

  res.json({
    success: true,
    message: 'OTP verified',
    token,
    user: {
      id: user._id,
      mobile: user.mobile,
      email: user.email,
      roles: user.roles,
      activeRole: user.activeRole,
      isMobileVerified: user.isMobileVerified,
      status: user.status,
      referralCode: user.referralCode,
    },
    profile,
  });
});

export const loginWithEmail = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (user.status === 'blocked') {
    return res.status(403).json({ success: false, message: 'Account blocked', reason: user.blockReason });
  }
  if (role) {
    if (!user.roles.includes(role)) user.roles.push(role);
    user.activeRole = role;
  }
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);
  const profile = await getProfileForRole(user);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      roles: user.roles,
      activeRole: user.activeRole,
      isMobileVerified: user.isMobileVerified,
    },
    profile,
  });
});

export const registerWithEmail = asyncHandler(async (req, res) => {
  const { email, password, role, mobile } = req.body;
  const exists = await User.findOne({ $or: [{ email }, ...(mobile ? [{ mobile }] : [])] });
  if (exists) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const user = await User.create({
    email,
    password,
    mobile,
    roles: [role],
    activeRole: role,
    isEmailVerified: true,
    referralCode: generateReferralCode(),
  });

  const token = generateToken(user._id);
  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, email, roles: user.roles, activeRole: role },
    needsMobileVerification: !mobile,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const profile = await getProfileForRole(req.user);
  res.json({
    success: true,
    user: {
      id: req.user._id,
      mobile: req.user.mobile,
      email: req.user.email,
      roles: req.user.roles,
      activeRole: req.user.activeRole,
      isMobileVerified: req.user.isMobileVerified,
      status: req.user.status,
      referralCode: req.user.referralCode,
    },
    profile,
  });
});

export const switchRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!req.user.roles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Role not assigned to user' });
  }
  req.user.activeRole = role;
  await req.user.save();
  const profile = await getProfileForRole(req.user);
  res.json({ success: true, activeRole: role, profile });
});

export const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export const checkAppStatus = asyncHandler(async (req, res) => {
  const maintenance = await AdminSettings.findOne({ key: 'maintenance_mode' });
  const forceUpdate = await AdminSettings.findOne({ key: 'force_update' });
  const minVersion = await AdminSettings.findOne({ key: 'min_app_version' });
  const { version } = req.query;

  res.json({
    success: true,
    maintenance: maintenance?.value || false,
    forceUpdate: forceUpdate?.value || false,
    minVersion: minVersion?.value || '1.0.0',
    needsUpdate: version && minVersion?.value && version < minVersion.value,
  });
});

async function getProfileForRole(user) {
  switch (user.activeRole) {
    case ROLES.TEACHER:
      return Teacher.findOne({ userId: user._id });
    case ROLES.STUDENT:
      return Student.findOne({ userId: user._id });
    case ROLES.PARENT:
      return Parent.findOne({ userId: user._id }).populate('linkedChildren.studentId');
    default:
      return null;
  }
}

export const protectedRoutes = { getMe, switchRole, logout };
