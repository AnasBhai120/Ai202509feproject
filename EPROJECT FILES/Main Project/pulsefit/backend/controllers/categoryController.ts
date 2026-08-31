import { Request, Response } from 'express';
import { memoryStore, generateId, isMongoConnected } from '../services/dataStore.js';
import { CategoryModel } from '../models/Category.js';
import { AuthRequest } from '../middleware/auth.js';

// @route   GET /api/categories
// @desc    Get categories with optional type filter
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.query;

    let categories = [...memoryStore.categories];
    if (type) {
      categories = categories.filter((c) => c.type === type);
    }

    res.json({
      success: true,
      data: {
        total: categories.length,
        categories,
        workoutCategories: categories.filter((c) => c.type === 'workout'),
        muscleGroups: categories.filter((c) => c.type === 'muscle'),
        equipment: categories.filter((c) => c.type === 'equipment'),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/categories
// @desc    Admin: create category
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, icon, description, color } = req.body;

    if (!name || !type) {
      res.status(400).json({ success: false, message: 'Name and type are required' });
      return;
    }

    const newCategory = {
      _id: generateId(),
      name: name.trim(),
      type,
      icon: icon || 'Dumbbell',
      description: description || '',
      color: color || '#22c55e',
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await CategoryModel.create(newCategory);
      } catch (err) {
        console.warn('Mongo insert category fallback:', err);
      }
    }
    memoryStore.categories.push(newCategory);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category: newCategory },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/categories/:id
// @desc    Admin: update category
export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = memoryStore.categories.findIndex((c) => c._id.toString() === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    const updated = {
      ...memoryStore.categories[index],
      ...req.body,
    };

    memoryStore.categories[index] = updated;

    if (isMongoConnected()) {
      await CategoryModel.findByIdAndUpdate(id, updated);
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category: updated },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/categories/:id
// @desc    Admin: delete category
export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = memoryStore.categories.findIndex((c) => c._id.toString() === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    memoryStore.categories.splice(index, 1);

    if (isMongoConnected()) {
      await CategoryModel.findByIdAndDelete(id);
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
