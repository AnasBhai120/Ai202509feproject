import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  toggleBlockUser,
  changeUserRole,
  deleteUser,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// User profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin user management routes
router.get('/', protect, adminOnly, getAllUsers);
router.post('/', protect, adminOnly, createUser);
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id', protect, adminOnly, updateUser);
router.patch('/:id/status', protect, adminOnly, toggleBlockUser);
router.patch('/:id/role', protect, adminOnly, changeUserRole);
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;
