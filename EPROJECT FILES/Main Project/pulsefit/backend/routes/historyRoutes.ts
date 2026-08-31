import express from 'express';
import { getWorkoutHistory, logCompletedWorkout } from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getWorkoutHistory);
router.post('/', protect, logCompletedWorkout);

export default router;
