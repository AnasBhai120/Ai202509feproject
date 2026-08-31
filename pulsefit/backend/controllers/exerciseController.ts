import { Request, Response } from 'express';
import { memoryStore, generateId, isMongoConnected } from '../services/dataStore.js';
import { ExerciseModel } from '../models/Exercise.js';
import { AuthRequest } from '../middleware/auth.js';

// @route   GET /api/exercises
// @desc    Get exercises with search and filters (muscle, equipment, difficulty, type)
export const getExercises = async (req: Request, res: Response): Promise<void> => {
  try {
    const { muscle, equipment, difficulty, type, search } = req.query;

    let exercises = [...memoryStore.exercises];

    if (muscle && muscle !== 'All') {
      exercises = exercises.filter((e) => e.muscleGroup.toLowerCase() === String(muscle).toLowerCase());
    }
    if (equipment && equipment !== 'All') {
      exercises = exercises.filter((e) => e.equipment.toLowerCase() === String(equipment).toLowerCase());
    }
    if (difficulty && difficulty !== 'All') {
      exercises = exercises.filter((e) => e.difficulty.toLowerCase() === String(difficulty).toLowerCase());
    }
    if (type && type !== 'All') {
      exercises = exercises.filter((e) => e.exerciseType?.toLowerCase() === String(type).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      exercises = exercises.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.muscleGroup.toLowerCase().includes(q) ||
          e.equipment.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      data: {
        total: exercises.length,
        exercises,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/exercises/:id
// @desc    Get exercise by ID
export const getExerciseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const exercise = memoryStore.exercises.find((e) => e._id.toString() === id);

    if (!exercise) {
      res.status(404).json({ success: false, message: 'Exercise not found' });
      return;
    }

    res.json({ success: true, data: { exercise } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/exercises
// @desc    Admin: create new exercise
export const createExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      muscleGroup,
      secondaryMuscles,
      equipment,
      difficulty,
      exerciseType,
      instructions,
      image,
      videoUrl,
      defaultSets,
      defaultReps,
      caloriesPerHour,
    } = req.body;

    if (!name || !description || !muscleGroup || !image) {
      res.status(400).json({ success: false, message: 'Name, description, muscle group, and image are required' });
      return;
    }

    const newExercise = {
      _id: generateId(),
      name: name.trim(),
      description: description.trim(),
      muscleGroup: muscleGroup.trim(),
      secondaryMuscles: Array.isArray(secondaryMuscles) ? secondaryMuscles : secondaryMuscles ? [secondaryMuscles] : [],
      equipment: equipment || 'Bodyweight',
      difficulty: difficulty || 'Beginner',
      exerciseType: exerciseType || 'Strength',
      instructions: Array.isArray(instructions) ? instructions : instructions ? [instructions] : [],
      image,
      videoUrl: videoUrl || '',
      defaultSets: Number(defaultSets) || 3,
      defaultReps: Number(defaultReps) || 10,
      caloriesPerHour: Number(caloriesPerHour) || 350,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await ExerciseModel.create(newExercise);
      } catch (err) {
        console.warn('Mongo create exercise fallback:', err);
      }
    }
    memoryStore.exercises.unshift(newExercise);

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      data: { exercise: newExercise },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/exercises/:id
// @desc    Admin: update exercise
export const updateExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = memoryStore.exercises.findIndex((e) => e._id.toString() === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Exercise not found' });
      return;
    }

    const updated = {
      ...memoryStore.exercises[index],
      ...req.body,
      defaultSets: Number(req.body.defaultSets) || memoryStore.exercises[index].defaultSets,
      defaultReps: Number(req.body.defaultReps) || memoryStore.exercises[index].defaultReps,
      updatedAt: new Date(),
    };

    memoryStore.exercises[index] = updated;

    if (isMongoConnected()) {
      await ExerciseModel.findByIdAndUpdate(id, updated);
    }

    res.json({
      success: true,
      message: 'Exercise updated successfully',
      data: { exercise: updated },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/exercises/:id
// @desc    Admin: delete exercise
export const deleteExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = memoryStore.exercises.findIndex((e) => e._id.toString() === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Exercise not found' });
      return;
    }

    memoryStore.exercises.splice(index, 1);

    if (isMongoConnected()) {
      await ExerciseModel.findByIdAndDelete(id);
    }

    res.json({ success: true, message: 'Exercise deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
