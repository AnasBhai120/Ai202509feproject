import express from 'express';
import {
  getProgressLogs,
  addProgressLog,
  updateProgressLog,
  deleteProgressLog,
} from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getProgressLogs);
router.post('/', protect, addProgressLog);
router.put('/:id', protect, updateProgressLog);
router.delete('/:id', protect, deleteProgressLog);

export default router;
