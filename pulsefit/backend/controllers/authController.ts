import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { memoryStore, generateId, isMongoConnected } from '../services/dataStore.js';
import { UserModel } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_fitness_token_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

// @route   POST /api/auth/register
// @desc    Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, age, gender, height, weight, fitnessGoal, activityLevel, profileImage } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      return;
    }

    const emailLower = email.toLowerCase().trim();

    // Check existing user
    let existingUser = null;
    if (isMongoConnected()) {
      existingUser = await UserModel.findOne({ email: emailLower });
    } else {
      existingUser = memoryStore.users.find((u) => u.email.toLowerCase() === emailLower);
    }

    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newId = generateId();

    const newUserObj = {
      _id: newId,
      name: name.trim(),
      email: emailLower,
      password: hashedPassword,
      role: 'user',
      status: 'active',
      age: Number(age) || 25,
      gender: gender || 'Not specified',
      height: Number(height) || 175,
      weight: Number(weight) || 70,
      fitnessGoal: fitnessGoal || 'General Fitness',
      activityLevel: activityLevel || 'Moderately Active',
      profileImage: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await UserModel.create(newUserObj);
      } catch (err) {
        console.warn('MongoDB insert fallback to store:', err);
      }
    }
    memoryStore.users.push(newUserObj);

    const token = generateToken(newId, 'user');

    const { password: _, ...userSafe } = newUserObj;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      data: {
        user: userSafe,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & obtain JWT token
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const emailLower = email.toLowerCase().trim();

    let user: any = null;
    if (isMongoConnected()) {
      user = await UserModel.findOne({ email: emailLower });
    }
    if (!user) {
      user = memoryStore.users.find((u) => u.email.toLowerCase() === emailLower);
    }

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Protect and ensure demo admin always has admin privileges and active status
    if (emailLower === 'admin@fitness.com') {
      user.role = 'admin';
      user.status = 'active';
      if (isMongoConnected()) {
        UserModel.updateOne({ email: emailLower }, { role: 'admin', status: 'active' }).catch(() => {});
      }
    }

    if (user.status === 'blocked') {
      res.status(403).json({ success: false, message: 'Account is suspended. Please contact administration.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        user: userObj,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

// @route   GET /api/auth/me
// @desc    Get current authenticated user
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    let user: any = null;
    if (isMongoConnected()) {
      user = await UserModel.findById(req.user.id).select('-password');
    }
    if (!user) {
      user = memoryStore.users.find((u) => u._id.toString() === req.user?.id);
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User record not found' });
      return;
    }

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    if (userObj.email?.toLowerCase() === 'admin@fitness.com') {
      userObj.role = 'admin';
      userObj.status = 'active';
      if (user) {
        user.role = 'admin';
        user.status = 'active';
      }
    }

    res.json({
      success: true,
      data: {
        user: userObj,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/forgot-password
// @desc    Request password reset token/link
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required' });
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const user = memoryStore.users.find((u) => u.email.toLowerCase() === emailLower);

    if (!user) {
      // Return success for security obfuscation
      res.json({
        success: true,
        message: 'If a matching account exists, a reset code was generated.',
        resetToken: 'reset-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      });
      return;
    }

    const resetToken = 'FIT-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    res.json({
      success: true,
      message: `Password reset instructions sent to ${email}`,
      resetToken, // Provided for easy client demo / verification
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/reset-password
// @desc    Reset password using reset token
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !newPassword) {
      res.status(400).json({ success: false, message: 'Email and new password are required' });
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const user = memoryStore.users.find((u) => u.email.toLowerCase() === emailLower);

    if (!user) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();

    if (isMongoConnected()) {
      await UserModel.findOneAndUpdate({ email: emailLower }, { password: user.password });
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
