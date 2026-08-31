import { Request, Response } from 'express';
import { memoryStore, generateId, isMongoConnected } from '../services/dataStore.js';
import { WorkoutModel } from '../models/Workout.js';
import { AuthRequest } from '../middleware/auth.js';

// @route   GET /api/workouts
// @desc    Get all workouts with filtering and search
export const getWorkouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, difficulty, search, featured, durationMax } = req.query;

    let workouts = [...memoryStore.workouts];

    if (category && category !== 'All') {
      workouts = workouts.filter((w) => w.category.toLowerCase() === String(category).toLowerCase());
    }
    if (difficulty && difficulty !== 'All') {
      workouts = workouts.filter((w) => w.difficulty.toLowerCase() === String(difficulty).toLowerCase());
    }
    if (featured === 'true') {
      workouts = workouts.filter((w) => w.isFeatured);
    }
    if (durationMax) {
      workouts = workouts.filter((w) => w.durationMinutes <= Number(durationMax));
    }
    if (search) {
      const q = String(search).toLowerCase();
      workouts = workouts.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.muscleGroups?.some((m: string) => m.toLowerCase().includes(q)) ||
          w.category.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      data: {
        total: workouts.length,
        workouts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/workouts/:id
// @desc    Get workout by ID
export const getWorkoutById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const workout = memoryStore.workouts.find((w) => w._id.toString() === id);

    if (!workout) {
      res.status(404).json({ success: false, message: 'Workout routine not found' });
      return;
    }

    res.json({ success: true, data: { workout } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/workouts
// @desc    Admin: create workout
export const createWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      coverImage,
      difficulty,
      durationMinutes,
      caloriesBurned,
      category,
      equipment,
      muscleGroups,
      exercises,
      videoUrl,
      instructions,
      isFeatured,
    } = req.body;

    if (!name || !description || !coverImage) {
      res.status(400).json({ success: false, message: 'Name, description, and cover image are required' });
      return;
    }

    const newWorkout = {
      _id: generateId(),
      name: name.trim(),
      description: description.trim(),
      coverImage,
      difficulty: difficulty || 'Intermediate',
      durationMinutes: Number(durationMinutes) || 30,
      caloriesBurned: Number(caloriesBurned) || 250,
      category: category || 'Full Body',
      equipment: Array.isArray(equipment) ? equipment : equipment ? [equipment] : [],
      muscleGroups: Array.isArray(muscleGroups) ? muscleGroups : muscleGroups ? [muscleGroups] : [],
      exercises: Array.isArray(exercises) ? exercises : [],
      videoUrl: videoUrl || '',
      instructions: Array.isArray(instructions) ? instructions : instructions ? [instructions] : [],
      isFeatured: Boolean(isFeatured),
      createdBy: req.user?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await WorkoutModel.create(newWorkout);
      } catch (err) {
        console.warn('Mongo insert workout fallback:', err);
      }
    }
    memoryStore.workouts.unshift(newWorkout);

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: { workout: newWorkout },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/workouts/:id
// @desc    Admin: update workout
export const updateWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = memoryStore.workouts.findIndex((w) => w._id.toString() === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Workout not found' });
      return;
    }

    const updated = {
      ...memoryStore.workouts[index],
      ...req.body,
      durationMinutes: Number(req.body.durationMinutes) || memoryStore.workouts[index].durationMinutes,
      caloriesBurned: Number(req.body.caloriesBurned) || memoryStore.workouts[index].caloriesBurned,
      updatedAt: new Date(),
    };

    memoryStore.workouts[index] = updated;

    if (isMongoConnected()) {
      await WorkoutModel.findByIdAndUpdate(id, updated);
    }

    res.json({
      success: true,
      message: 'Workout updated successfully',
      data: { workout: updated },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/workouts/:id
// @desc    Admin: delete workout
export const deleteWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = memoryStore.workouts.findIndex((w) => w._id.toString() === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Workout not found' });
      return;
    }

    memoryStore.workouts.splice(index, 1);

    if (isMongoConnected()) {
      await WorkoutModel.findByIdAndDelete(id);
    }

    res.json({ success: true, message: 'Workout deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
