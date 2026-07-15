import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Otp from '../models/Otp.js';
import AdminSettings from '../models/AdminSettings.js';
import { generateAccessToken, generateRefreshToken, setRefreshCookie, clearRefreshCookie } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateOtp, generateReferralCode } from '../utils/helpers.js';
import { ROLES } from '../config/constants.js';
import { sendOtpViaWidget, verifyOtpViaWidget } from '../services/msg91Service.js';


/* ─────────────────────────────────────────────────────────────────────
 * HELPERS
 * ─────────────────────────────────────────────────────────────────────*/

/** Return the role-specific profile model for a given role string. */
function roleModel(role) {
  if (role === ROLES.STUDENT) return Student;
  if (role === ROLES.TEACHER) return Teacher;
  if (role === ROLES.PARENT)  return Parent;
  return null;
}

/** Check if a credential is already used BY ANOTHER user in the same role.
 *  Returns { conflict: true, userId } if a different user already owns it. */
async function checkRoleLevelDuplicate(mobile, email, role, excludeUserId = null) {
  const Model = roleModel(role);
  if (!Model) return { conflict: false };

  const orClauses = [];
  if (mobile) orClauses.push({ mobile });
  if (email)  orClauses.push({ email });
  if (!orClauses.length) return { conflict: false };

  const existing = await Model.findOne({ $or: orClauses });
  if (!existing) return { conflict: false };

  // If it's the same user requesting, no conflict
  if (excludeUserId && existing.userId.toString() === excludeUserId.toString()) {
    return { conflict: false };
  }
  return { conflict: true, userId: existing.userId };
}

/** Find a User who already has this credential AND this role. */
async function findUserByCredentialAndRole(mobile, email, role) {
  if (!role) return null;
  const orClauses = [];
  if (mobile) orClauses.push({ mobile });
  if (email)  orClauses.push({ email });
  if (!orClauses.length) return null;

  return User.findOne({
    role,
    $or: orClauses
  });
}

/** Build the public user payload sent to the client. */
function buildUserPayload(user) {
  return {
    id: user._id,
    mobile: user.mobile,
    email: user.email,
    roles: [user.role],
    activeRole: user.activeRole || user.role,
    isMobileVerified: user.isMobileVerified,
    isEmailVerified:  user.isEmailVerified,
    status: user.status,
    referralCode: user.referralCode,
  };
}

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

/* ─────────────────────────────────────────────────────────────────────
 * SEND OTP
 * ─────────────────────────────────────────────────────────────────────*/
export const sendOtp = asyncHandler(async (req, res) => {
  const mobile  = req.body.mobile?.trim();
  const email   = req.body.email?.trim().toLowerCase();
  const purpose = req.body.purpose || 'login';
  const role    = req.body.role;

  if (!mobile && !email) {
    return res.status(400).json({ success: false, message: 'Mobile or email required' });
  }

  // ── PRE-CHECK for login: ensure a user with this credential+role exists ──
  if (role && purpose === 'login') {
    await findUserByCredentialAndRole(mobile, email, role);
  }

  const identifier = mobile || email;
  let msg91Result = { success: false, message: 'Email login initiated' };

  if (mobile) {
    msg91Result = await sendOtpViaWidget(mobile);
  }

  let otp;
  let reqId;

  if (msg91Result.success) {
    reqId = msg91Result.reqId;
  } else {
    if (process.env.NODE_ENV === 'development') {
      otp = generateOtp();
      console.log(`\x1b[33m%s\x1b[0m`, `[DEV ONLY] Mock OTP for ${identifier}: ${otp}`);
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again later.',
      });
    }
  }

  const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10) * 60000));

  // Clear any old OTPs for this exact identifier
  const otpFilter = {};
  if (mobile) otpFilter.mobile = mobile;
  if (email)  otpFilter.email  = email;
  await Otp.deleteMany(otpFilter);
  await Otp.create({ mobile, email, otp, reqId, purpose, expiresAt });

  res.json({
    success: true,
    message: msg91Result.message || 'OTP sent successfully',
    ...(process.env.NODE_ENV === 'development' && !mobile && { otp }),
  });
});

/* ─────────────────────────────────────────────────────────────────────
 * VERIFY OTP
 * ─────────────────────────────────────────────────────────────────────*/
export const verifyOtp = asyncHandler(async (req, res) => {
  const mobile = req.body.mobile?.trim();
  const email  = req.body.email?.trim().toLowerCase();
  const otp    = req.body.otp;
  const role   = req.body.role;

  if (!mobile && !email) {
    return res.status(400).json({ success: false, message: 'Mobile or email required' });
  }

  // ── Find OTP record using $or (phone stored in mobile, email in email) ──
  const otpOrClauses = [];
  if (mobile) otpOrClauses.push({ mobile });
  if (email)  otpOrClauses.push({ email });

  const otpRecord = await Otp.findOne({ $or: otpOrClauses, verified: false })
    .sort({ createdAt: -1 });

  if (!otpRecord) {
    return res.status(400).json({ success: false, message: 'OTP not found. Please request again.' });
  }
  if (otpRecord.expiresAt < new Date()) {
    return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
  }
  if (otpRecord.attempts >= parseInt(process.env.OTP_MAX_RETRIES || '5', 10)) {
    return res.status(429).json({ success: false, message: 'Max retries reached. Please request a new OTP.' });
  }
  if (otpRecord.reqId) {
    const verifyResult = await verifyOtpViaWidget(otpRecord.reqId, otp);
    if (!verifyResult.success) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: verifyResult.message || 'Invalid OTP. Please try again.' });
    }
  } else {
    if (otpRecord.otp !== String(otp)) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }
  }

  otpRecord.verified = true;
  await otpRecord.save();

  // ── Find the correct User: credential + role scoped ──
  let user = await findUserByCredentialAndRole(mobile, email, role);
  let isNewUser = false;

  if (!user) {
    // Truly new user — create
    isNewUser = true;
    user = await User.create({
      mobile,
      email,
      role,
      activeRole: role || null,
      isMobileVerified: !!mobile,
      isEmailVerified:  !!email,
      referralCode: generateReferralCode(),
    });
  } else {
    // ── Existing user found ──
    if (mobile) user.isMobileVerified = true;
    if (email)  user.isEmailVerified  = true;
    user.lastLogin = new Date();
    await user.save();
  }

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  setRefreshCookie(res, refreshToken);
  const profile = await getProfileForRole(user);
  if (!profile) isNewUser = true;

  res.json({
    success: true,
    message: 'OTP verified',
    accessToken,
    isNewUser,
    user: buildUserPayload(user),
    profile,
  });
});

/* ─────────────────────────────────────────────────────────────────────
 * EMAIL/PASSWORD LOGIN & REGISTER
 * ─────────────────────────────────────────────────────────────────────*/
export const loginWithEmail = asyncHandler(async (req, res) => {
  const email    = req.body.email?.trim().toLowerCase();
  const { password, role } = req.body;
  
  // Find user with this email who also has the requested role
  const user = await User.findOne({ email, role }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (user.status === 'blocked') {
    return res.status(403).json({ success: false, message: 'Account blocked', reason: user.blockReason });
  }

  if (role) {
    user.activeRole = role;
  }
  user.lastLogin = new Date();
  await user.save();

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  setRefreshCookie(res, refreshToken);
  const profile = await getProfileForRole(user);

  res.json({
    success: true, accessToken,
    user: buildUserPayload(user),
    profile,
  });
});

export const registerWithEmail = asyncHandler(async (req, res) => {
  const email  = req.body.email?.trim().toLowerCase();
  const mobile = req.body.mobile?.trim();
  const { password, role } = req.body;

  // Role-level uniqueness: check if email/mobile already used for this role
  if (role) {
    const dup = await checkRoleLevelDuplicate(mobile, email, role);
    if (dup.conflict) {
      return res.status(400).json({
        success: false,
        message: `A ${role} account already exists with this ${email ? 'email' : 'phone number'}. Please login instead.`,
      });
    }
  }

  const user = await User.create({
    email, password, mobile,
    role,
    activeRole: role,
    isEmailVerified: true,
    referralCode: generateReferralCode(),
  });

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({
    success: true, accessToken,
    user: { id: user._id, email, roles: [user.role], activeRole: role },
    needsMobileVerification: !mobile,
  });
});

/* ─────────────────────────────────────────────────────────────────────
 * PROFILE CONTACT VERIFICATION  (post-login, from Profile page)
 * ─────────────────────────────────────────────────────────────────────*/
export const verifyProfileContact = asyncHandler(async (req, res) => {
  const mobile = req.body.mobile?.trim();
  const email  = req.body.email?.trim().toLowerCase();
  const otp    = req.body.otp;

  if (!mobile && !email) {
    return res.status(400).json({ success: false, message: 'Mobile or email required' });
  }

  const identifier = mobile || email;
  const otpRecord = await Otp.findOne({
    $or: [{ mobile: identifier }, { email: identifier }],
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return res.status(400).json({ success: false, message: 'OTP not found. Please request again.' });
  }
  if (otpRecord.expiresAt < new Date()) {
    return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
  }
  if (otpRecord.reqId) {
    const verifyResult = await verifyOtpViaWidget(otpRecord.reqId, otp);
    if (!verifyResult.success) {
      return res.status(400).json({ success: false, message: verifyResult.message || 'Invalid OTP. Please try again.' });
    }
  } else {
    if (otpRecord.otp !== String(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }
  }

  otpRecord.verified = true;
  await otpRecord.save();

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // Role-level duplicate check: ensure no OTHER user in same role has this credential
  const dup = await checkRoleLevelDuplicate(mobile, email, user.activeRole, user._id);
  if (dup.conflict) {
    return res.status(409).json({
      success: false,
      message: `This ${mobile ? 'phone number' : 'email'} is already verified by another ${user.activeRole} account.`,
    });
  }

  if (mobile) {
    user.mobile = mobile;
    user.isMobileVerified = true;
    await Student.updateMany({ userId: user._id }, { mobile });
    await Teacher.updateMany({ userId: user._id }, { mobile });
    await Parent.updateMany ({ userId: user._id }, { mobile });
  }
  if (email) {
    user.email = email;
    user.isEmailVerified = true;
    await Student.updateMany({ userId: user._id }, { email });
    await Teacher.updateMany({ userId: user._id }, { email });
    await Parent.updateMany ({ userId: user._id }, { email });
  }

  await user.save();
  res.json({ success: true, message: 'Contact details verified successfully' });
});

/* ─────────────────────────────────────────────────────────────────────
 * OTHER AUTH ENDPOINTS
 * ─────────────────────────────────────────────────────────────────────*/
export const getMe = asyncHandler(async (req, res) => {
  const profile = await getProfileForRole(req.user);
  res.json({
    success: true,
    user: buildUserPayload(req.user),
    profile,
  });
});

export const switchRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  // Find another User document with the same phone or email, and the target role
  const orClauses = [];
  if (req.user.mobile) orClauses.push({ mobile: req.user.mobile });
  if (req.user.email) orClauses.push({ email: req.user.email });
  if (!orClauses.length) {
    return res.status(400).json({ success: false, message: 'No phone or email to match other roles' });
  }

  const targetUser = await User.findOne({
    role,
    $or: orClauses
  });

  if (!targetUser) {
    return res.status(404).json({ success: false, message: `No ${role} profile linked to this account` });
  }

  targetUser.activeRole = role;
  targetUser.lastLogin = new Date();
  await targetUser.save();

  const accessToken = generateAccessToken(targetUser._id);
  const refreshToken = generateRefreshToken(targetUser._id);
  setRefreshCookie(res, refreshToken);

  const profile = await getProfileForRole(targetUser);
  res.json({
    success: true,
    accessToken,
    activeRole: role,
    user: buildUserPayload(targetUser),
    profile
  });
});

export const logout = asyncHandler(async (req, res) => {
  clearRefreshCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

/* ─────────────────────────────────────────────────────────────────────
 * REFRESH TOKEN — issue new access token from httpOnly cookie
 * ─────────────────────────────────────────────────────────────────────*/
export const refreshTokens = asyncHandler(async (req, res) => {
  const token = req.cookies?.vlm_refresh;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    clearRefreshCookie(res);
    return res.status(401).json({ success: false, message: 'Refresh token expired or invalid' });
  }
  const user = await User.findById(decoded.id);
  if (!user || user.status === 'blocked' || user.status === 'suspended') {
    clearRefreshCookie(res);
    return res.status(401).json({ success: false, message: 'User not found or account disabled' });
  }
  const accessToken = generateAccessToken(user._id);
  res.json({ success: true, accessToken });
});

export const checkAppStatus = asyncHandler(async (req, res) => {
  const maintenance = await AdminSettings.findOne({ key: 'maintenance_mode' });
  const forceUpdate  = await AdminSettings.findOne({ key: 'force_update' });
  const minVersion   = await AdminSettings.findOne({ key: 'min_app_version' });
  const { version }  = req.query;

  res.json({
    success: true,
    maintenance:  maintenance?.value  || false,
    forceUpdate:  forceUpdate?.value  || false,
    minVersion:   minVersion?.value   || '1.0.0',
    needsUpdate: version && minVersion?.value && version < minVersion.value,
  });
});

export const protectedRoutes = { getMe, switchRole, logout, verifyProfileContact };
