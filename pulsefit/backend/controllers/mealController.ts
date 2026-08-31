import { Request, Response } from 'express';
import { memoryStore, generateId, isMongoConnected } from '../services/dataStore.js';
import { MealModel } from '../models/Meal.js';
import { DailyLogModel } from '../models/DailyLog.js';
import { AuthRequest } from '../middleware/auth.js';

// @route   GET /api/meals
// @desc    Get meals with category & search filter
export const getMeals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, maxCalories } = req.query;

    let meals = [...memoryStore.meals];

    if (category && category !== 'All') {
      meals = meals.filter((m) => m.category.toLowerCase() === String(category).toLowerCase());
    }
    if (maxCalories) {
      meals = meals.filter((m) => m.calories <= Number(maxCalories));
    }
    if (search) {
      const q = String(search).toLowerCase();
      meals = meals.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.ingredients?.some((i: string) => i.toLowerCase().includes(q)) ||
          m.dietaryTags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      data: {
        total: meals.length,
        meals,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/meals/:id
// @desc    Get meal by ID
export const getMealById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const meal = memoryStore.meals.find((m) => m._id.toString() === id);

    if (!meal) {
      res.status(404).json({ success: false, message: 'Meal recipe not found' });
      return;
    }

    res.json({ success: true, data: { meal } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/meals
// @desc    Admin: create meal
export const createMeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, image, calories, protein, carbs, fat, prepTimeMinutes, ingredients, instructions, dietaryTags } = req.body;

    if (!name || !category || !image || calories === undefined) {
      res.status(400).json({ success: false, message: 'Name, category, image, and calories are required' });
      return;
    }

    const newMeal = {
      _id: generateId(),
      name: name.trim(),
      category,
      image,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      prepTimeMinutes: Number(prepTimeMinutes) || 15,
      ingredients: Array.isArray(ingredients) ? ingredients : ingredients ? [ingredients] : [],
      instructions: Array.isArray(instructions) ? instructions : instructions ? [instructions] : [],
      dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : dietaryTags ? [dietaryTags] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await MealModel.create(newMeal);
      } catch (err) {
        console.warn('Mongo insert meal fallback:', err);
      }
    }
    memoryStore.meals.unshift(newMeal);

    res.status(201).json({
      success: true,
      message: 'Meal created successfully',
      data: { meal: newMeal },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/meals/:id
// @desc    Admin: update meal
export const updateMeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = memoryStore.meals.findIndex((m) => m._id.toString() === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Meal not found' });
      return;
    }

    const updated = {
      ...memoryStore.meals[index],
      ...req.body,
      calories: Number(req.body.calories) || memoryStore.meals[index].calories,
      protein: Number(req.body.protein) || memoryStore.meals[index].protein,
      carbs: Number(req.body.carbs) || memoryStore.meals[index].carbs,
      fat: Number(req.body.fat) || memoryStore.meals[index].fat,
      updatedAt: new Date(),
    };

    memoryStore.meals[index] = updated;

    if (isMongoConnected()) {
      await MealModel.findByIdAndUpdate(id, updated);
    }

    res.json({
      success: true,
      message: 'Meal updated successfully',
      data: { meal: updated },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/meals/:id
// @desc    Admin: delete meal
export const deleteMeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = memoryStore.meals.findIndex((m) => m._id.toString() === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Meal not found' });
      return;
    }

    memoryStore.meals.splice(index, 1);

    if (isMongoConnected()) {
      await MealModel.findByIdAndDelete(id);
    }

    res.json({ success: true, message: 'Meal deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- USER DAILY NUTRITION LOGGING & WATER TRACKER ---

// @route   GET /api/meals/daily/summary
// @desc    Get user's daily nutrition log, macros, and water intake for date
export const getDailyNutrition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

    let log = memoryStore.dailyLogs.find((l) => l.userId === userId && l.date === date);

    if (!log) {
      log = {
        _id: generateId(),
        userId: userId!,
        date,
        waterGlasses: 0,
        steps: 4200,
        caloriesBurned: 150,
        calorieTarget: 2200,
        meals: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.dailyLogs.push(log);
    }

    // Calculate totals
    const totalCalories = log.meals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
    const totalProtein = log.meals.reduce((sum: number, m: any) => sum + (m.protein || 0), 0);
    const totalCarbs = log.meals.reduce((sum: number, m: any) => sum + (m.carbs || 0), 0);
    const totalFat = log.meals.reduce((sum: number, m: any) => sum + (m.fat || 0), 0);

    res.json({
      success: true,
      data: {
        log,
        totals: {
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
          waterGlasses: log.waterGlasses,
          waterLiters: Number((log.waterGlasses * 0.25).toFixed(2)),
          calorieTarget: log.calorieTarget || 2200,
          calorieRemaining: Math.max(0, (log.calorieTarget || 2200) - totalCalories),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/meals/daily/log
// @desc    Log a meal item to today's daily food journal
export const logDailyMeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { mealId, name, category, calories, protein, carbs, fat, date } = req.body;

    const logDate = date || new Date().toISOString().split('T')[0];

    let log = memoryStore.dailyLogs.find((l) => l.userId === userId && l.date === logDate);

    if (!log) {
      log = {
        _id: generateId(),
        userId: userId!,
        date: logDate,
        waterGlasses: 0,
        steps: 3500,
        caloriesBurned: 100,
        calorieTarget: 2200,
        meals: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.dailyLogs.push(log);
    }

    const newMealItem = {
      mealId: mealId || undefined,
      name: name || 'Custom Meal',
      category: category || 'Snacks',
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      loggedAt: new Date(),
    };

    log.meals.push(newMealItem);
    log.updatedAt = new Date();

    if (isMongoConnected()) {
      await DailyLogModel.findOneAndUpdate({ userId, date: logDate }, log, { upsert: true });
    }

    res.status(201).json({
      success: true,
      message: 'Meal logged to today journal',
      data: { log, addedItem: newMealItem },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PATCH /api/meals/daily/water
// @desc    Increment or set water glasses
export const updateDailyWater = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { delta, exact, date } = req.body;
    const logDate = date || new Date().toISOString().split('T')[0];

    let log = memoryStore.dailyLogs.find((l) => l.userId === userId && l.date === logDate);

    if (!log) {
      log = {
        _id: generateId(),
        userId: userId!,
        date: logDate,
        waterGlasses: 0,
        steps: 0,
        caloriesBurned: 0,
        calorieTarget: 2200,
        meals: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.dailyLogs.push(log);
    }

    if (exact !== undefined) {
      log.waterGlasses = Math.max(0, Number(exact));
    } else if (delta !== undefined) {
      log.waterGlasses = Math.max(0, log.waterGlasses + Number(delta));
    }

    log.updatedAt = new Date();

    if (isMongoConnected()) {
      await DailyLogModel.findOneAndUpdate({ userId, date: logDate }, log, { upsert: true });
    }

    res.json({
      success: true,
      message: 'Water log updated',
      data: {
        waterGlasses: log.waterGlasses,
        waterLiters: Number((log.waterGlasses * 0.25).toFixed(2)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
