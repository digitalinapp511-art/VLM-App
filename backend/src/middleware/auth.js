import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

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
        console.error("Failed to save activeRole switch:", err);
      }
    }
  }
  next();
};

export const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
