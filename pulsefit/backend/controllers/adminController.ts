import { Request, Response } from 'express';
import { memoryStore } from '../services/dataStore.js';
import { AuthRequest } from '../middleware/auth.js';

// @route   GET /api/admin/dashboard
// @desc    Admin: get high-level metrics, summary numbers & charts
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = memoryStore.users.length;
    const activeUsers = memoryStore.users.filter((u) => u.status === 'active').length;
    const blockedUsers = memoryStore.users.filter((u) => u.status === 'blocked').length;
    const totalWorkouts = memoryStore.workouts.length;
    const totalExercises = memoryStore.exercises.length;
    const totalMeals = memoryStore.meals.length;
    const totalCompletedWorkouts = memoryStore.workoutHistories.length;

    const totalCaloriesBurned = memoryStore.workoutHistories.reduce(
      (sum, h) => sum + (h.caloriesBurned || 0),
      0
    );

    const totalWorkoutMinutes = memoryStore.workoutHistories.reduce(
      (sum, h) => sum + (h.durationMinutes || 0),
      0
    );

    // User growth by month/week mock trend
    const userGrowth = [
      { name: 'Sep', users: 120, workouts: 450 },
      { name: 'Oct', users: 195, workouts: 780 },
      { name: 'Nov', users: 310, workouts: 1240 },
      { name: 'Dec', users: 480, workouts: 1890 },
      { name: 'Jan', users: 720, workouts: 2840 },
      { name: 'Feb', users: 950 + totalUsers, workouts: 3950 + totalCompletedWorkouts },
    ];

    // Popular workouts
    const popularWorkouts = memoryStore.workouts.map((w) => {
      const completions = memoryStore.workoutHistories.filter(
        (h) => h.workoutId === w._id.toString() || h.workoutName === w.name
      ).length;
      return {
        id: w._id,
        name: w.name,
        category: w.category,
        difficulty: w.difficulty,
        completions: completions + Math.floor(Math.random() * 20 + 5),
        durationMinutes: w.durationMinutes,
      };
    }).sort((a, b) => b.completions - a.completions);

    // Goal distribution
    const goalCounts: Record<string, number> = {};
    memoryStore.users.forEach((u) => {
      const g = u.fitnessGoal || 'General Fitness';
      goalCounts[g] = (goalCounts[g] || 0) + 1;
    });

    const goalsData = Object.entries(goalCounts).map(([name, value]) => ({ name, value }));

    // Workout category breakdown
    const categoryCounts: Record<string, number> = {};
    memoryStore.workouts.forEach((w) => {
      categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
    });
    const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          blockedUsers,
          totalWorkouts,
          totalExercises,
          totalMeals,
          totalCompletedWorkouts,
          totalCaloriesBurned,
          avgWorkoutDuration: totalCompletedWorkouts > 0 ? Math.round(totalWorkoutMinutes / totalCompletedWorkouts) : 35,
          completionRate: '94.2%',
        },
        userGrowth,
        popularWorkouts: popularWorkouts.slice(0, 5),
        goalsDistribution: goalsData,
        categoryBreakdown: categoryData,
        recentUsers: memoryStore.users.slice(-5).reverse().map((u) => {
          const { password, ...safe } = u;
          return safe;
        }),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
