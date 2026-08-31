import express from 'express';
import {
  getMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
  getDailyNutrition,
  logDailyMeal,
  updateDailyWater,
} from '../controllers/mealController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// User daily nutrition & water endpoints
router.get('/daily/summary', protect, getDailyNutrition);
router.post('/daily/log', protect, logDailyMeal);
router.patch('/daily/water', protect, updateDailyWater);

// Meal catalog
router.get('/', getMeals);
router.get('/:id', getMealById);
router.post('/', protect, adminOnly, createMeal);
router.put('/:id', protect, adminOnly, updateMeal);
router.delete('/:id', protect, adminOnly, deleteMeal);

export default router;
