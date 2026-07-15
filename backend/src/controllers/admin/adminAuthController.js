import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../../models/User.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} from '../../middleware/auth.js';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/login
// ─────────────────────────────────────────────────────────────────────────────
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.roles.includes('admin'))
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

  if (!(await user.comparePassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  setRefreshCookie(res, refreshToken);

  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    accessToken,
    user: { id: user._id, email: user.email, name: user.name, roles: user.roles },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/logout
// ─────────────────────────────────────────────────────────────────────────────
export const adminLogout = asyncHandler(async (req, res) => {
  clearRefreshCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/refresh-token
// ─────────────────────────────────────────────────────────────────────────────
export const adminRefreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.vlm_refresh;
  if (!token) return res.status(401).json({ success: false, message: 'No refresh token provided' });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.roles.includes('admin'))
    return res.status(401).json({ success: false, message: 'Unauthorized' });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  setRefreshCookie(res, refreshToken);

  res.json({ success: true, accessToken });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/me
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, data: user });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/profile
// ─────────────────────────────────────────────────────────────────────────────
export const updateAdminProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'email', 'mobile', 'avatarUrl'];
  const updates = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
  res.json({ success: true, message: 'Profile updated', data: user });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/change-password
// ─────────────────────────────────────────────────────────────────────────────
export const changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' });

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword)))
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
export const adminForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email, role: 'admin' });
  if (!user) {
    // Return success regardless to avoid email enumeration
    return res.json({ success: true, message: 'If an admin account exists, a reset email has been sent' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  // TODO: send email with reset link containing raw resetToken
  res.json({ success: true, message: 'Password reset email sent', resetToken /* Remove in production */ });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/reset-password
// ─────────────────────────────────────────────────────────────────────────────
export const adminResetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res.status(400).json({ success: false, message: 'Token and newPassword are required' });

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
    role: 'admin',
  });

  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ success: true, message: 'Password reset successfully' });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/enable-2fa  (TOTP mock — swap in speakeasy if desired)
// ─────────────────────────────────────────────────────────────────────────────
export const enableAdmin2FA = asyncHandler(async (req, res) => {
  const secret = crypto.randomBytes(20).toString('hex');
  // Store encrypted secret in user record (simplified)
  await User.findByIdAndUpdate(req.user._id, { twoFaSecret: secret, twoFaEnabled: false });
  res.json({
    success: true,
    message: '2FA setup initiated. Use the secret to configure your authenticator app.',
    secret,
    qrCodeUrl: `otpauth://totp/VLMAdmin:${req.user.email}?secret=${secret}&issuer=VLMApp`,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/verify-2fa
// ─────────────────────────────────────────────────────────────────────────────
export const verifyAdmin2FA = asyncHandler(async (req, res) => {
  const { code } = req.body;
  // TODO: integrate speakeasy/TOTP verification against user.twoFaSecret
  if (!code) return res.status(400).json({ success: false, message: 'OTP code is required' });

  await User.findByIdAndUpdate(req.user._id, { twoFaEnabled: true });
  res.json({ success: true, message: '2FA enabled successfully' });
});
