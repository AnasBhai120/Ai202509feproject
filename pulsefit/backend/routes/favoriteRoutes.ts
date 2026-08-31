import express from 'express';
import { getFavorites, toggleFavorite, deleteFavorite } from '../controllers/favoriteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getFavorites);
router.post('/toggle', protect, toggleFavorite);
router.delete('/:id', protect, deleteFavorite);

export default router;
