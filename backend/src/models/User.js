import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    mobile: { type: String, sparse: true },
    email: { type: String, sparse: true },
    password: { type: String, select: false },
    name: String,
    role: { type: String, enum: Object.values(ROLES), required: true },
    activeRole: { type: String, enum: Object.values(ROLES) },
    isSuperAdmin: { type: Boolean, default: false },
    permissions: { type: [String], default: [] },
    isMobileVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    googleId: { type: String, sparse: true },
    status: {
      type: String,
      enum: ['active', 'blocked', 'suspended'],
      default: 'active',
    },
    blockReason: String,
    lastLogin: Date,
    deviceTokens: [String],
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property roles for backward compatibility
userSchema.virtual('roles').get(function() {
  return [this.role];
});

// Compound Indexes for role-scoped uniqueness
userSchema.index(
  { mobile: 1, role: 1 },
  { 
    unique: true, 
    partialFilterExpression: { mobile: { $type: "string" } } 
  }
);
userSchema.index(
  { email: 1, role: 1 },
  { 
    unique: true, 
    partialFilterExpression: { email: { $type: "string" } } 
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);


