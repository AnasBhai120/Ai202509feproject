import { Request, Response } from 'express';
import { memoryStore, generateId, isMongoConnected } from '../services/dataStore.js';
import { FavoriteModel } from '../models/Favorite.js';
import { AuthRequest } from '../middleware/auth.js';

// @route   GET /api/favorites
// @desc    Get user's favorites separated by itemType (workout, exercise, meal)
export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { type } = req.query;

    let favorites = memoryStore.favorites.filter((f) => f.userId === userId);

    if (type) {
      favorites = favorites.filter((f) => f.itemType === type);
    }

    // Hydrate itemData if missing
    favorites = favorites.map((f) => {
      let item = f.itemData;
      if (!item) {
        if (f.itemType === 'workout') item = memoryStore.workouts.find((w) => w._id.toString() === f.itemId);
        if (f.itemType === 'exercise') item = memoryStore.exercises.find((e) => e._id.toString() === f.itemId);
        if (f.itemType === 'meal') item = memoryStore.meals.find((m) => m._id.toString() === f.itemId);
      }
      return { ...f, itemData: item || f.itemData };
    });

    res.json({
      success: true,
      data: {
        total: favorites.length,
        favorites,
        workouts: favorites.filter((f) => f.itemType === 'workout'),
        exercises: favorites.filter((f) => f.itemType === 'exercise'),
        meals: favorites.filter((f) => f.itemType === 'meal'),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/favorites/toggle
// @desc    Toggle favorite item (add if not exists, remove if exists)
export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { itemType, itemId } = req.body;

    if (!itemType || !itemId) {
      res.status(400).json({ success: false, message: 'itemType and itemId are required' });
      return;
    }

    const existingIndex = memoryStore.favorites.findIndex(
      (f) => f.userId === userId && f.itemType === itemType && f.itemId.toString() === itemId.toString()
    );

    if (existingIndex !== -1) {
      // Remove
      memoryStore.favorites.splice(existingIndex, 1);
      if (isMongoConnected()) {
        await FavoriteModel.findOneAndDelete({ userId, itemType, itemId });
      }

      res.json({
        success: true,
        message: 'Removed from favorites',
        data: { isFavorite: false, itemType, itemId },
      });
      return;
    }

    // Add
    let itemData: any = null;
    if (itemType === 'workout') itemData = memoryStore.workouts.find((w) => w._id.toString() === itemId);
    if (itemType === 'exercise') itemData = memoryStore.exercises.find((e) => e._id.toString() === itemId);
    if (itemType === 'meal') itemData = memoryStore.meals.find((m) => m._id.toString() === itemId);

    const newFav = {
      _id: generateId(),
      userId: userId!,
      itemType,
      itemId,
      itemData,
      createdAt: new Date(),
    };

    memoryStore.favorites.push(newFav);

    if (isMongoConnected()) {
      try {
        await FavoriteModel.create(newFav);
      } catch (err) {
        console.warn('Mongo fav insert:', err);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: { isFavorite: true, favorite: newFav },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/favorites/:id
// @desc    Delete favorite by favorite ID or item ID
export const deleteFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const index = memoryStore.favorites.findIndex(
      (f) => (f._id.toString() === id || f.itemId.toString() === id) && f.userId === userId
    );

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Favorite not found' });
      return;
    }

    memoryStore.favorites.splice(index, 1);

    if (isMongoConnected()) {
      await FavoriteModel.findOneAndDelete({ $or: [{ _id: id }, { itemId: id }], userId });
    }

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
