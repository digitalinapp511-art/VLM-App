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
  // Normalize inputs to prevent trailing-space phantom accounts
  const mobile = req.body.mobile?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const purpose = req.body.purpose || 'login';
  const role = req.body.role;
  if (!mobile && !email) {
    return res.status(400).json({ success: false, message: 'Mobile or email required' });
  }

  // ── PRE-CHECK: If user exists with roles, validate role early ──
  if (role && purpose === 'login') {
    const existingUser = await User.findOne({
      ...(mobile && { mobile }),
      ...(email && { email }),
    });
    if (existingUser && existingUser.roles.length > 0 && !existingUser.roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `No ${role} account found with this ${email ? 'email' : 'phone number'}. Please check your credentials or use the correct login portal.`,
        existingRoles: existingUser.roles,
      });
    }
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
  // Normalize inputs
  const mobile = req.body.mobile?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const otp = req.body.otp;
  const role = req.body.role;

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
  let isNewUser = false;

  if (!user) {
    // Brand new user – create with the claimed role
    isNewUser = true;
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
    // ── STRICT ROLE VALIDATION ──
    // If the user already exists AND already has at least one role,
    // only allow login if they are claiming a role they already possess.
    // Exception: if the user has NO roles yet (account created via OTP with no role),
    // allow them to claim any role.
    const userHasRoles = user.roles && user.roles.length > 0;
    if (role && userHasRoles && !user.roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `This account is not registered as a ${role}. Please use the correct login portal or contact support.`,
        existingRoles: user.roles,
      });
    }

    // Add role if not already present
    if (role && !user.roles.includes(role)) {
      user.roles.push(role);
    }
    // Only switch activeRole to the claimed role (so correct profile is returned)
    if (role) user.activeRole = role;
    if (mobile) user.isMobileVerified = true;
    if (email) user.isEmailVerified = true;
    user.lastLogin = new Date();
    await user.save();
  }

  const token = generateToken(user._id);
  const profile = await getProfileForRole(user);

  if (!profile) {
    isNewUser = true;
  }

  res.json({
    success: true,
    message: 'OTP verified',
    token,
    isNewUser,
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
  const email = req.body.email?.trim().toLowerCase();
  const { password, role } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (user.status === 'blocked') {
    return res.status(403).json({ success: false, message: 'Account blocked', reason: user.blockReason });
  }

  // ── STRICT ROLE VALIDATION ──
  // Prevent a student from logging in via teacher portal and vice-versa
  if (role && user.roles.length > 0 && !user.roles.includes(role)) {
    return res.status(403).json({
      success: false,
      message: `This account is not registered as a ${role}. Please use the correct login portal.`,
      existingRoles: user.roles,
    });
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
  const email = req.body.email?.trim().toLowerCase();
  const mobile = req.body.mobile?.trim();
  const { password, role } = req.body;

  // Check email uniqueness
  if (email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'An account already exists with this email address. Please login instead.',
        field: 'email',
      });
    }
  }

  // Check mobile uniqueness (except parents can share phone numbers with each other,
  // but no student/teacher should share a phone with another student/teacher)
  if (mobile && role !== 'parent') {
    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) {
      return res.status(400).json({
        success: false,
        message: 'An account already exists with this phone number. Please login instead.',
        field: 'mobile',
      });
    }
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
