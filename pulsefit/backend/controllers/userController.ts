import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { memoryStore, isMongoConnected, generateId } from '../services/dataStore.js';
import { UserModel } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

// @route   GET /api/users/profile
// @desc    Get logged in user profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = memoryStore.users.find((u) => u._id.toString() === userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { password, ...safeUser } = user;
    res.json({ success: true, data: { user: safeUser } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/users/profile
// @desc    Update logged in user profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, age, gender, height, weight, fitnessGoal, activityLevel, profileImage } = req.body;

    const userIndex = memoryStore.users.findIndex((u) => u._id.toString() === userId);
    if (userIndex === -1) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const user = memoryStore.users[userIndex];
    if (name) user.name = name.trim();
    if (age !== undefined) user.age = Number(age);
    if (gender) user.gender = gender;
    if (height !== undefined) user.height = Number(height);
    if (weight !== undefined) user.weight = Number(weight);
    if (fitnessGoal) user.fitnessGoal = fitnessGoal;
    if (activityLevel) user.activityLevel = activityLevel;
    if (profileImage) user.profileImage = profileImage;
    user.updatedAt = new Date();

    if (isMongoConnected()) {
      await UserModel.findByIdAndUpdate(userId, user);
    }

    const { password, ...safeUser } = user;
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: safeUser },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/users/change-password
// @desc    Change password for logged in user
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current password and new password are required' });
      return;
    }

    const user = memoryStore.users.find((u) => u._id.toString() === userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password does not match' });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();

    if (isMongoConnected()) {
      await UserModel.findByIdAndUpdate(userId, { password: user.password });
    }

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ADMIN USER MANAGEMENT ROUTES ---

// @route   POST /api/users
// @desc    Admin: create a new athlete / user
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      role = 'user',
      status = 'active',
      age,
      gender,
      height,
      weight,
      fitnessGoal,
      activityLevel,
      profileImage,
    } = req.body;

    if (!name || !email) {
      res.status(400).json({ success: false, message: 'Name and email are required' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = memoryStore.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      res.status(400).json({ success: false, message: 'A user with this email address already exists' });
      return;
    }

    const rawPassword = password || 'password123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const newId = generateId();

    const newUser: any = {
      _id: newId,
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
      status: status === 'blocked' ? 'blocked' : 'active',
      age: age ? Number(age) : 25,
      gender: gender || 'Male',
      height: height ? Number(height) : 175,
      weight: weight ? Number(weight) : 70,
      fitnessGoal: fitnessGoal || 'Muscle Gain',
      activityLevel: activityLevel || 'Moderately Active',
      profileImage:
        profileImage ||
        (gender === 'Female'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.users.unshift(newUser);

    if (isMongoConnected()) {
      await UserModel.create(newUser);
    }

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({
      success: true,
      message: 'New athlete created successfully',
      data: { user: safeUser },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/users
// @desc    Admin: get all users with search & filters
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, role, status, goal } = req.query;

    // Self-heal: ensure admin@fitness.com is always active admin
    const adminUser = memoryStore.users.find((u) => u.email.toLowerCase() === 'admin@fitness.com');
    if (adminUser) {
      adminUser.role = 'admin';
      adminUser.status = 'active';
    }

    let users = [...memoryStore.users];

    if (search && search !== 'undefined' && search !== 'null' && String(search).trim()) {
      const q = String(search).toLowerCase().trim();
      users = users.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.fitnessGoal && u.fitnessGoal.toLowerCase().includes(q))
      );
    }
    if (role && role !== 'all' && role !== 'undefined' && role !== 'null') {
      users = users.filter((u) => u.role === role);
    }
    if (status && status !== 'all' && status !== 'undefined' && status !== 'null') {
      users = users.filter((u) => u.status === status);
    }
    if (goal && goal !== 'all' && goal !== 'undefined' && goal !== 'null') {
      users = users.filter((u) => u.fitnessGoal === goal);
    }

    const safeUsers = users.map((u) => {
      const { password, ...safe } = u;
      return safe;
    });

    res.json({
      success: true,
      data: {
        total: safeUsers.length,
        users: safeUsers,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/users/:id
// @desc    Admin: get single user
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = memoryStore.users.find((u) => u._id.toString() === id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { password, ...safeUser } = user;
    res.json({ success: true, data: { user: safeUser } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/users/:id
// @desc    Admin: update user details
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, status, age, gender, height, weight, fitnessGoal, activityLevel } = req.body;

    const userIndex = memoryStore.users.findIndex((u) => u._id.toString() === id);
    if (userIndex === -1) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const user = memoryStore.users[userIndex];
    if (user.email === 'admin@fitness.com' && role && role !== 'admin') {
      res.status(400).json({ success: false, message: 'The primary demo administrator (admin@fitness.com) cannot be demoted.' });
      return;
    }
    if (user.email === 'admin@fitness.com' && status === 'blocked') {
      res.status(400).json({ success: false, message: 'The primary demo administrator (admin@fitness.com) cannot be blocked.' });
      return;
    }
    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (role) user.role = role;
    if (status) user.status = status;
    if (age !== undefined) user.age = Number(age);
    if (gender) user.gender = gender;
    if (height !== undefined) user.height = Number(height);
    if (weight !== undefined) user.weight = Number(weight);
    if (fitnessGoal) user.fitnessGoal = fitnessGoal;
    if (activityLevel) user.activityLevel = activityLevel;
    user.updatedAt = new Date();

    if (isMongoConnected()) {
      await UserModel.findByIdAndUpdate(id, user);
    }

    const { password, ...safeUser } = user;
    res.json({ success: true, message: 'User updated successfully', data: { user: safeUser } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/users/:id/status
// @desc    Admin: toggle block/unblock user
export const toggleBlockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = memoryStore.users.find((u) => u._id.toString() === id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.email === 'admin@fitness.com') {
      res.status(400).json({ success: false, message: 'The primary demo administrator account cannot be blocked.' });
      return;
    }

    // Do not allow blocking self
    if (req.user?.id === id) {
      res.status(400).json({ success: false, message: 'You cannot block your own administrative account.' });
      return;
    }

    user.status = user.status === 'active' ? 'blocked' : 'active';
    user.updatedAt = new Date();

    if (isMongoConnected()) {
      await UserModel.findByIdAndUpdate(id, { status: user.status });
    }

    res.json({
      success: true,
      message: `User status changed to ${user.status}`,
      data: { status: user.status },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/users/:id/role
// @desc    Admin: change user role
export const changeUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Role must be either user or admin' });
      return;
    }

    const user = memoryStore.users.find((u) => u._id.toString() === id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.email === 'admin@fitness.com' && role !== 'admin') {
      res.status(400).json({ success: false, message: 'The primary demo administrator (admin@fitness.com) cannot be demoted to user.' });
      return;
    }

    user.role = role;
    user.updatedAt = new Date();

    if (isMongoConnected()) {
      await UserModel.findByIdAndUpdate(id, { role });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: { role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/users/:id
// @desc    Admin: delete user
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = memoryStore.users.find((u) => u._id.toString() === id);
    if (user && user.email === 'admin@fitness.com') {
      res.status(400).json({ success: false, message: 'The primary demo administrator account cannot be deleted.' });
      return;
    }

    if (req.user?.id === id) {
      res.status(400).json({ success: false, message: 'Cannot delete active session account' });
      return;
    }

    const index = memoryStore.users.findIndex((u) => u._id.toString() === id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    memoryStore.users.splice(index, 1);

    if (isMongoConnected()) {
      await UserModel.findByIdAndDelete(id);
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
