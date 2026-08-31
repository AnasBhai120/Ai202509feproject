export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  age: number;
  gender: string;
  height: number; // in cm
  weight: number; // in kg
  fitnessGoal: 'Weight Loss' | 'Muscle Gain' | 'Strength' | 'Endurance' | 'General Fitness';
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extra Active';
  profileImage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkoutExercise {
  exerciseId?: string;
  name: string;
  sets: number;
  reps: number;
  restTimeSeconds: number;
  notes?: string;
  image?: string;
  videoUrl?: string;
}

export interface Workout {
  _id: string;
  name: string;
  description: string;
  coverImage: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  caloriesBurned: number;
  category: string;
  equipment: string[];
  muscleGroups: string[];
  exercises: WorkoutExercise[];
  videoUrl?: string;
  instructions: string[];
  isFeatured?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Exercise {
  _id: string;
  name: string;
  description: string;
  muscleGroup: string;
  secondaryMuscles?: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exerciseType: 'Strength' | 'Cardio' | 'Flexibility' | 'Plyometrics';
  instructions: string[];
  image: string;
  videoUrl?: string;
  defaultSets: number;
  defaultReps: number;
  caloriesPerHour?: number;
  createdAt?: string;
}

export interface Meal {
  _id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTimeMinutes: number;
  ingredients: string[];
  instructions: string[];
  dietaryTags?: string[];
  createdAt?: string;
}

export interface DailyMealItem {
  mealId?: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
}

export interface DailyLog {
  _id: string;
  userId: string;
  date: string;
  waterGlasses: number;
  steps: number;
  caloriesBurned: number;
  calorieTarget: number;
  meals: DailyMealItem[];
}

export interface ProgressLog {
  _id: string;
  userId: string;
  date: string;
  weightKg: number;
  heightCm?: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  hipsCm?: number;
  thighsCm?: number;
  bmi: number;
  bodyFatPercentage?: number;
  photoUrl?: string;
  notes?: string;
  createdAt?: string;
}

export interface CompletedExercise {
  name: string;
  setsCompleted: number;
  repsCompleted: number;
  weightKg?: number;
}

export interface WorkoutHistory {
  _id: string;
  userId: string;
  workoutId?: string;
  workoutName: string;
  category?: string;
  durationMinutes: number;
  caloriesBurned: number;
  exercisesCompleted: CompletedExercise[];
  notes?: string;
  completedAt: string;
}

export interface FavoriteItem {
  _id: string;
  userId: string;
  itemType: 'workout' | 'exercise' | 'meal';
  itemId: string;
  itemData?: any;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: 'workout' | 'meal' | 'progress' | 'announcement';
  isRead: boolean;
  targetRole?: 'all' | 'user' | 'admin';
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  type: 'workout' | 'exercise' | 'meal' | 'difficulty' | 'muscle' | 'equipment';
  icon?: string;
  description?: string;
  color?: string;
}

export interface AdminDashboardData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    totalWorkouts: number;
    totalExercises: number;
    totalMeals: number;
    totalCompletedWorkouts: number;
    totalCaloriesBurned: number;
    avgWorkoutDuration: number;
    completionRate: string;
  };
  userGrowth: Array<{ name: string; users: number; workouts: number }>;
  popularWorkouts: Array<{
    id: string;
    name: string;
    category: string;
    difficulty: string;
    completions: number;
    durationMinutes: number;
  }>;
  goalsDistribution: Array<{ name: string; value: number }>;
  categoryBreakdown: Array<{ name: string; count: number }>;
  recentUsers: User[];
}
