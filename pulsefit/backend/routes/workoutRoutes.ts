import express from 'express';
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from '../controllers/workoutController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getWorkouts);
router.get('/:id', getWorkoutById);
router.post('/', protect, adminOnly, createWorkout);
router.put('/:id', protect, adminOnly, updateWorkout);
router.delete('/:id', protect, adminOnly, deleteWorkout);

export default router;
