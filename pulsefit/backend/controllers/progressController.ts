import { Request, Response } from 'express';
import { memoryStore, generateId, isMongoConnected } from '../services/dataStore.js';
import { ProgressModel } from '../models/Progress.js';
import { AuthRequest } from '../middleware/auth.js';

// Calculate BMI helper
const calcBMI = (weightKg: number, heightCm: number) => {
  if (!weightKg || !heightCm) return 22;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
};

// @route   GET /api/progress
// @desc    Get user's progress history logs & metrics
export const getProgressLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    let logs = memoryStore.progress.filter((p) => p.userId === userId);

    // Sort by date ascending for charts
    logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Latest entry
    const latest = logs.length > 0 ? logs[logs.length - 1] : null;

    res.json({
      success: true,
      data: {
        total: logs.length,
        logs,
        latest,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/progress
// @desc    Add new progress measurement entry
export const addProgressLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { date, weightKg, heightCm, chestCm, waistCm, armsCm, hipsCm, thighsCm, bodyFatPercentage, photoUrl, notes } = req.body;

    if (!weightKg) {
      res.status(400).json({ success: false, message: 'Weight (kg) is required' });
      return;
    }

    // Get user height if not provided
    const user = memoryStore.users.find((u) => u._id.toString() === userId);
    const effectiveHeight = heightCm || user?.height || 175;
    const bmi = calcBMI(Number(weightKg), Number(effectiveHeight));

    const newLog = {
      _id: generateId(),
      userId: userId!,
      date: date || new Date().toISOString().split('T')[0],
      weightKg: Number(weightKg),
      heightCm: Number(effectiveHeight),
      chestCm: chestCm ? Number(chestCm) : undefined,
      waistCm: waistCm ? Number(waistCm) : undefined,
      armsCm: armsCm ? Number(armsCm) : undefined,
      hipsCm: hipsCm ? Number(hipsCm) : undefined,
      thighsCm: thighsCm ? Number(thighsCm) : undefined,
      bmi,
      bodyFatPercentage: bodyFatPercentage ? Number(bodyFatPercentage) : undefined,
      photoUrl: photoUrl || '',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await ProgressModel.create(newLog);
      } catch (err) {
        console.warn('Mongo progress create fallback:', err);
      }
    }

    // Update user current weight
    if (user) {
      user.weight = Number(weightKg);
      user.updatedAt = new Date();
    }

    memoryStore.progress.push(newLog);

    res.status(201).json({
      success: true,
      message: 'Progress recorded successfully',
      data: { progress: newLog },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/progress/:id
// @desc    Update progress measurement entry
export const updateProgressLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const index = memoryStore.progress.findIndex((p) => p._id.toString() === id && p.userId === userId);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Progress record not found' });
      return;
    }

    const updated = {
      ...memoryStore.progress[index],
      ...req.body,
      weightKg: req.body.weightKg ? Number(req.body.weightKg) : memoryStore.progress[index].weightKg,
      updatedAt: new Date(),
    };

    memoryStore.progress[index] = updated;

    if (isMongoConnected()) {
      await ProgressModel.findByIdAndUpdate(id, updated);
    }

    res.json({
      success: true,
      message: 'Progress record updated',
      data: { progress: updated },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/progress/:id
// @desc    Delete progress measurement entry
export const deleteProgressLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const index = memoryStore.progress.findIndex((p) => p._id.toString() === id && p.userId === userId);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Progress record not found' });
      return;
    }

    memoryStore.progress.splice(index, 1);

    if (isMongoConnected()) {
      await ProgressModel.findByIdAndDelete(id);
    }

    res.json({ success: true, message: 'Progress record deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
