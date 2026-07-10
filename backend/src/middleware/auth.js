import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ── Token generators ──────────────────────────────────────────────────────────

/** Short-lived access token: 15 minutes (JWT_ACCESS_EXPIRES) */
export const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });

/** Long-lived refresh token: 30 days (JWT_REFRESH_EXPIRES) */
export const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d',
  });

/** Helper used by controllers to set the refresh token httpOnly cookie */
export const setRefreshCookie = (res, refreshToken) => {
  res.cookie('vlm_refresh', refreshToken, {
    httpOnly: true,            // JS cannot read it — immune to XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  });
};

/** Clear refresh cookie on logout */
export const clearRefreshCookie = (res) => {
  res.cookie('vlm_refresh', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
};

// ── Protect middleware ─────────────────────────────────────────────────────────

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Account blocked', reason: user.blockReason });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ── Role guard ────────────────────────────────────────────────────────────────

export const authorize = (...roles) => async (req, res, next) => {
  const hasRole = roles.some(r => req.user.roles.includes(r));
  if (!hasRole) {
    return res.status(403).json({ success: false, message: 'Access denied for this role' });
  }
  if (!roles.includes(req.user.activeRole)) {
    const matchingRole = roles.find(r => req.user.roles.includes(r));
    if (matchingRole) {
      req.user.activeRole = matchingRole;
      try {
        await req.user.save();
      } catch (err) {
        console.error('Failed to save activeRole switch:', err);
      }
    }
  }
  next();
};

// ── Legacy alias (keeps compatibility with any file still using generateToken) ─
export const generateToken = generateAccessToken;
