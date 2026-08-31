import { Request, Response } from 'express';
import { seedInitialData } from '../services/dataStore.js';

// @route   POST /api/seed
// @desc    Seed or reset database with sample records and admin user
export const seedDatabase = async (req: Request, res: Response): Promise<void> => {
  try {
    await seedInitialData();
    res.json({
      success: true,
      message: 'Database seeded successfully with default Admin (admin@fitness.com / admin123) and Demo User (user@fitness.com / user123).',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
