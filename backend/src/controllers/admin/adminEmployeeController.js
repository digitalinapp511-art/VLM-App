import User from '../../models/User.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

// List all admin employees (except super admins)
export const getEmployees = asyncHandler(async (req, res) => {
  const employees = await User.find({
    role: 'admin',
    isSuperAdmin: { $ne: true }
  }).select('+password');

  const mapped = employees.map(emp => ({
    _id: emp._id,
    name: emp.name || '',
    email: emp.email,
    permissions: emp.permissions,
    status: emp.status,
    lastLogin: emp.lastLogin,
    createdAt: emp.createdAt
  }));

  res.json({ success: true, data: mapped });
});

// Create new sub-admin employee
export const createEmployee = asyncHandler(async (req, res) => {
  const { name, email, password, permissions } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  // Validate duplicate user
  const exists = await User.findOne({ email, role: 'admin' });
  if (exists) {
    return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
  }

  const employee = await User.create({
    name,
    email,
    password,
    role: 'admin',
    activeRole: 'admin',
    isEmailVerified: true,
    isSuperAdmin: false,
    permissions: Array.isArray(permissions) ? permissions : []
  });

  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: {
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      permissions: employee.permissions,
      status: employee.status
    }
  });
});

// Update employee details and permissions
export const updateEmployee = asyncHandler(async (req, res) => {
  const { name, email, password, permissions, status } = req.body;

  const employee = await User.findById(req.params.id);
  if (!employee || employee.role !== 'admin' || employee.isSuperAdmin) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  if (name !== undefined) employee.name = name;
  if (email !== undefined) employee.email = email;
  if (permissions !== undefined) employee.permissions = Array.isArray(permissions) ? permissions : [];
  if (status !== undefined) employee.status = status;

  if (password) {
    employee.password = password; // pre-save hook will hash it automatically
  }

  await employee.save();

  res.json({
    success: true,
    message: 'Employee updated successfully',
    data: {
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      permissions: employee.permissions,
      status: employee.status
    }
  });
});

// Delete employee account
export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee || employee.role !== 'admin' || employee.isSuperAdmin) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Employee deleted successfully' });
});
