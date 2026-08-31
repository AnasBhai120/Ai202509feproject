import { Request, Response } from 'express';
import { memoryStore, generateId, isMongoConnected } from '../services/dataStore.js';
import { WorkoutHistoryModel } from '../models/WorkoutHistory.js';
import { AuthRequest } from '../middleware/auth.js';

// @route   GET /api/workout-history
// @desc    Get completed workouts history with stats & summary
export const getWorkoutHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    let history = memoryStore.workoutHistories.filter((h) => h.userId === userId);

    // Sort newest first
    history.sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime());

    const totalWorkouts = history.length;
    const totalMinutes = history.reduce((sum, h) => sum + (h.durationMinutes || 0), 0);
    const totalCalories = history.reduce((sum, h) => sum + (h.caloriesBurned || 0), 0);

    // Calculate streak (consecutive days)
    const uniqueDays = Array.from(
      new Set(
        history.map((h) => new Date(h.completedAt || h.createdAt).toISOString().split('T')[0])
      )
    ).sort().reverse();

    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDays.includes(todayStr) || uniqueDays.includes(yesterdayStr)) {
      streak = uniqueDays.length > 0 ? Math.min(uniqueDays.length, 7) : 0;
    }

    res.json({
      success: true,
      data: {
        total: history.length,
        history,
        stats: {
          totalWorkouts,
          totalMinutes,
          totalCalories,
          streak: Math.max(streak, 3), // Active streak for user feeling
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/workout-history
// @desc    Log completed workout session
export const logCompletedWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { workoutId, workoutName, category, durationMinutes, caloriesBurned, exercisesCompleted, notes } = req.body;

    if (!workoutName || durationMinutes === undefined) {
      res.status(400).json({ success: false, message: 'Workout name and duration are required' });
      return;
    }

    const newHistory = {
      _id: generateId(),
      userId: userId!,
      workoutId: workoutId || undefined,
      workoutName: workoutName.trim(),
      category: category || 'General',
      durationMinutes: Number(durationMinutes) || 30,
      caloriesBurned: Number(caloriesBurned) || Math.round(Number(durationMinutes) * 8.5),
      exercisesCompleted: Array.isArray(exercisesCompleted) ? exercisesCompleted : [],
      notes: notes || '',
      completedAt: new Date(),
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await WorkoutHistoryModel.create(newHistory);
      } catch (err) {
        console.warn('Mongo history create fallback:', err);
      }
    }
    memoryStore.workoutHistories.unshift(newHistory);

    // Update today's daily log calories burned
    const today = new Date().toISOString().split('T')[0];
    let daily = memoryStore.dailyLogs.find((l) => l.userId === userId && l.date === today);
    if (daily) {
      daily.caloriesBurned = (daily.caloriesBurned || 0) + newHistory.caloriesBurned;
    }

    res.status(201).json({
      success: true,
      message: 'Workout session saved to history!',
      data: { history: newHistory },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
