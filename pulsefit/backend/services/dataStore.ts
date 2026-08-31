import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel, IUser } from '../models/User.js';
import { WorkoutModel, IWorkout } from '../models/Workout.js';
import { ExerciseModel, IExercise } from '../models/Exercise.js';
import { MealModel, IMeal } from '../models/Meal.js';
import { WorkoutHistoryModel, IWorkoutHistory } from '../models/WorkoutHistory.js';
import { ProgressModel, IProgress } from '../models/Progress.js';
import { FavoriteModel, IFavorite } from '../models/Favorite.js';
import { NotificationModel, INotification } from '../models/Notification.js';
import { CategoryModel, ICategory } from '../models/Category.js';
import { DailyLogModel, IDailyLog } from '../models/DailyLog.js';

// In-Memory fallback store for container / preview environments
export interface MemoryStore {
  users: any[];
  workouts: any[];
  exercises: any[];
  meals: any[];
  workoutHistories: any[];
  progress: any[];
  favorites: any[];
  notifications: any[];
  categories: any[];
  dailyLogs: any[];
}

export const memoryStore: MemoryStore = {
  users: [],
  workouts: [],
  exercises: [],
  meals: [],
  workoutHistories: [],
  progress: [],
  favorites: [],
  notifications: [],
  categories: [],
  dailyLogs: [],
};

export const generateId = () => new mongoose.Types.ObjectId().toString();

export const isMongoConnected = () => mongoose.connection.readyState === 1;

// Initialize seed data
export const seedInitialData = async () => {
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordUser = await bcrypt.hash('user123', 10);

  const adminId = '60d0fe4f5311236168a109ca';
  const userId = '60d0fe4f5311236168a109cb';

  const defaultUsers = [
    {
      _id: adminId,
      name: 'Alex Morgan (Admin)',
      email: 'admin@fitness.com',
      password: hashedPasswordAdmin,
      role: 'admin',
      status: 'active',
      age: 29,
      gender: 'Female',
      height: 172,
      weight: 64,
      fitnessGoal: 'Strength',
      activityLevel: 'Very Active',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      createdAt: new Date('2026-01-15T08:00:00Z'),
      updatedAt: new Date(),
    },
    {
      _id: userId,
      name: 'Marcus Vance',
      email: 'user@fitness.com',
      password: hashedPasswordUser,
      role: 'user',
      status: 'active',
      age: 26,
      gender: 'Male',
      height: 182,
      weight: 78,
      fitnessGoal: 'Muscle Gain',
      activityLevel: 'Moderately Active',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      createdAt: new Date('2026-02-01T10:00:00Z'),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      name: 'Elena Rostova',
      email: 'elena@fitness.com',
      password: hashedPasswordUser,
      role: 'user',
      status: 'active',
      age: 24,
      gender: 'Female',
      height: 168,
      weight: 58,
      fitnessGoal: 'Weight Loss',
      activityLevel: 'Lightly Active',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      createdAt: new Date('2026-02-10T14:30:00Z'),
      updatedAt: new Date(),
    },
  ];

  const defaultCategories = [
    { _id: generateId(), name: 'Strength', type: 'workout', icon: 'Dumbbell', color: '#10b981', description: 'Resistance and muscle mass workouts' },
    { _id: generateId(), name: 'HIIT', type: 'workout', icon: 'Flame', color: '#f59e0b', description: 'High-intensity interval burns' },
    { _id: generateId(), name: 'Cardio', type: 'workout', icon: 'HeartPulse', color: '#ef4444', description: 'Aerobic and cardiovascular conditioning' },
    { _id: generateId(), name: 'Full Body', type: 'workout', icon: 'Activity', color: '#3b82f6', description: 'Complete head-to-toe routines' },
    { _id: generateId(), name: 'Upper Body', type: 'workout', icon: 'Zap', color: '#8b5cf6', description: 'Chest, back, shoulders & arms' },
    { _id: generateId(), name: 'Lower Body', type: 'workout', icon: 'Footprints', color: '#06b6d4', description: 'Legs, glutes & calves' },
    { _id: generateId(), name: 'Abs & Core', type: 'workout', icon: 'Shield', color: '#ec4899', description: 'Midsection & core stability' },
    { _id: generateId(), name: 'Flexibility', type: 'workout', icon: 'Sparkles', color: '#14b8a6', description: 'Mobility, recovery and stretching' },
    { _id: generateId(), name: 'Chest', type: 'muscle', icon: 'Target', color: '#10b981' },
    { _id: generateId(), name: 'Back', type: 'muscle', icon: 'Target', color: '#3b82f6' },
    { _id: generateId(), name: 'Legs', type: 'muscle', icon: 'Target', color: '#f59e0b' },
    { _id: generateId(), name: 'Shoulders', type: 'muscle', icon: 'Target', color: '#8b5cf6' },
    { _id: generateId(), name: 'Arms', type: 'muscle', icon: 'Target', color: '#ec4899' },
    { _id: generateId(), name: 'Dumbbell', type: 'equipment', icon: 'Dumbbell', color: '#10b981' },
    { _id: generateId(), name: 'Barbell', type: 'equipment', icon: 'Dumbbell', color: '#3b82f6' },
    { _id: generateId(), name: 'Bodyweight', type: 'equipment', icon: 'User', color: '#14b8a6' },
    { _id: generateId(), name: 'Cable', type: 'equipment', icon: 'Layers', color: '#f59e0b' },
  ];

  const defaultExercises = [
    {
      _id: 'ex_1',
      name: 'Barbell Bench Press',
      description: 'The premier compound exercise for upper body horizontal pressing strength and chest development.',
      muscleGroup: 'Chest',
      secondaryMuscles: ['Shoulders', 'Triceps'],
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      exerciseType: 'Strength',
      instructions: [
        'Lie flat on bench with eyes directly under barbell.',
        'Grip bar slightly wider than shoulder-width.',
        'Unrack bar, lower with control to mid-chest while keeping wrists stacked.',
        'Press upward explosively until arms are extended without locking elbows.',
      ],
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
      videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
      defaultSets: 4,
      defaultReps: 10,
      caloriesPerHour: 420,
    },
    {
      _id: 'ex_2',
      name: 'Goblet Squat',
      description: 'Functional squatting movement that targets quads, glutes, and deep core stability.',
      muscleGroup: 'Legs',
      secondaryMuscles: ['Glutes', 'Core'],
      equipment: 'Dumbbell',
      difficulty: 'Beginner',
      exerciseType: 'Strength',
      instructions: [
        'Hold dumbbell vertically against chest with elbows pointing down.',
        'Stand with feet shoulder-width apart, toes slightly outward.',
        'Hinge hips back and bend knees to sink down until thighs are parallel to ground.',
        'Drive through whole foot to stand back up.',
      ],
      image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
      defaultSets: 3,
      defaultReps: 12,
      caloriesPerHour: 400,
    },
    {
      _id: 'ex_3',
      name: 'Pull-Up',
      description: 'The gold standard bodyweight vertical pulling movement building a wide, dense back.',
      muscleGroup: 'Back',
      secondaryMuscles: ['Biceps', 'Forearms'],
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      exerciseType: 'Strength',
      instructions: [
        'Grip pull-up bar with overhand grip wider than shoulders.',
        'Engage lats and pull chest towards bar until chin clears bar.',
        'Lower down smoothly under full control to a dead hang.',
      ],
      image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80',
      defaultSets: 4,
      defaultReps: 8,
      caloriesPerHour: 480,
    },
    {
      _id: 'ex_4',
      name: 'Dumbbell Shoulder Press',
      description: 'Overhead press focusing on anterior and lateral deltoids for broad 3D shoulder shape.',
      muscleGroup: 'Shoulders',
      secondaryMuscles: ['Triceps', 'Upper Chest'],
      equipment: 'Dumbbell',
      difficulty: 'Intermediate',
      exerciseType: 'Strength',
      instructions: [
        'Sit on an incline or upright bench with dumbbells at ear height.',
        'Press dumbbells overhead together without clanging.',
        'Lower smoothly back to 90 degree elbow bend.',
      ],
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
      defaultSets: 3,
      defaultReps: 12,
      caloriesPerHour: 360,
    },
    {
      _id: 'ex_5',
      name: 'High-Knee HIIT Sprints',
      description: 'Fast-paced plyometric cardio blast accelerating heart rate and burning massive calories.',
      muscleGroup: 'Legs',
      secondaryMuscles: ['Core', 'Calves'],
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      exerciseType: 'Cardio',
      instructions: [
        'Stand tall with feet hip-distance apart.',
        'Drive knees up toward chest alternating quickly like sprinting in place.',
        'Pump arms in sync and stay light on balls of feet.',
      ],
      image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&auto=format&fit=crop&q=80',
      defaultSets: 4,
      defaultReps: 30,
      caloriesPerHour: 620,
    },
    {
      _id: 'ex_6',
      name: 'Hanging Knee Raises',
      description: 'Direct abdominal exercise targeting lower abs and hip flexors with deep spinal flexion.',
      muscleGroup: 'Abs & Core',
      secondaryMuscles: ['Hip Flexors', 'Grip'],
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      exerciseType: 'Strength',
      instructions: [
        'Hang from pull-up bar with straight arms.',
        'Exhale and contract core to pull knees up to 90 degrees or chest.',
        'Lower legs slowly without swinging body.',
      ],
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      defaultSets: 3,
      defaultReps: 15,
      caloriesPerHour: 320,
    },
    {
      _id: 'ex_7',
      name: 'Romanian Deadlift (RDL)',
      description: 'Posterior chain builder focusing on hamstring lengthening, glute drive and lower back strength.',
      muscleGroup: 'Legs',
      secondaryMuscles: ['Back', 'Glutes'],
      equipment: 'Dumbbell',
      difficulty: 'Intermediate',
      exerciseType: 'Strength',
      instructions: [
        'Stand holding dumbbells with soft knee bend.',
        'Hinge hips backwards keeping back flat and weights close to shins.',
        'Stop when deep stretch is felt in hamstrings, then thrust hips forward.',
      ],
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80',
      defaultSets: 3,
      defaultReps: 10,
      caloriesPerHour: 430,
    },
  ];

  const defaultWorkouts = [
    {
      _id: 'w_1',
      name: 'Full Body Titan Blast',
      description: 'High-octane full body muscle stimulator designed to burn fat, build dense muscle, and build work capacity.',
      coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      difficulty: 'Intermediate',
      durationMinutes: 45,
      caloriesBurned: 420,
      category: 'Full Body',
      equipment: ['Dumbbell', 'Barbell', 'Bodyweight'],
      muscleGroups: ['Chest', 'Back', 'Legs', 'Shoulders'],
      isFeatured: true,
      instructions: [
        'Warm up 5 minutes with light jogging and dynamic arm circles.',
        'Perform each exercise with controlled eccentric tempo (2-3s).',
        'Take full scheduled rest between sets for maximum power.',
      ],
      exercises: [
        {
          exerciseId: 'ex_1',
          name: 'Barbell Bench Press',
          sets: 4,
          reps: 10,
          restTimeSeconds: 60,
          notes: 'Progressive overload: add 2.5kg if previous set completed easily',
          image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
        },
        {
          exerciseId: 'ex_2',
          name: 'Goblet Squat',
          sets: 3,
          reps: 12,
          restTimeSeconds: 45,
          notes: 'Focus on maximum depth and chest upright',
          image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
        },
        {
          exerciseId: 'ex_3',
          name: 'Pull-Up',
          sets: 3,
          reps: 8,
          restTimeSeconds: 60,
          notes: 'Use resistance band if required for clean form',
          image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80',
        },
        {
          exerciseId: 'ex_6',
          name: 'Hanging Knee Raises',
          sets: 3,
          reps: 15,
          restTimeSeconds: 30,
          notes: 'No swinging, squeeze at top',
          image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      _id: 'w_2',
      name: 'HIIT Inferno Fat Burner',
      description: 'Electrifying interval workout structured with work-to-rest ratios to maximize EPOC calorie afterburn.',
      coverImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
      difficulty: 'Advanced',
      durationMinutes: 28,
      caloriesBurned: 380,
      category: 'HIIT',
      equipment: ['Bodyweight'],
      muscleGroups: ['Legs', 'Abs & Core'],
      isFeatured: true,
      instructions: [
        '40 seconds maximum effort, followed by 20 seconds recovery.',
        'Repeat each round 4 times with 1 minute rest between blocks.',
      ],
      exercises: [
        {
          exerciseId: 'ex_5',
          name: 'High-Knee HIIT Sprints',
          sets: 4,
          reps: 30,
          restTimeSeconds: 20,
          image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&auto=format&fit=crop&q=80',
        },
        {
          exerciseId: 'ex_2',
          name: 'Goblet Squat Jumps',
          sets: 4,
          reps: 15,
          restTimeSeconds: 20,
          image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      _id: 'w_3',
      name: 'Upper Body Sculpt & Power',
      description: 'Hypertrophy focused upper body workout sculpting shoulders, chest, back width, and arm peak.',
      coverImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
      difficulty: 'Intermediate',
      durationMinutes: 40,
      caloriesBurned: 340,
      category: 'Upper Body',
      equipment: ['Dumbbell', 'Barbell'],
      muscleGroups: ['Chest', 'Shoulders', 'Back', 'Arms'],
      isFeatured: false,
      instructions: [
        'Aim for high mind-muscle contraction on every rep.',
        'Focus on deep shoulder blade retraction during all pulls.',
      ],
      exercises: [
        {
          exerciseId: 'ex_1',
          name: 'Barbell Bench Press',
          sets: 4,
          reps: 10,
          restTimeSeconds: 60,
          image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
        },
        {
          exerciseId: 'ex_4',
          name: 'Dumbbell Shoulder Press',
          sets: 3,
          reps: 12,
          restTimeSeconds: 45,
          image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      _id: 'w_4',
      name: 'Lower Body Leg Quake',
      description: 'Quads, hamstrings, and glutes destruction protocol ensuring solid leg foundation and athleticism.',
      coverImage: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800&auto=format&fit=crop&q=80',
      difficulty: 'Advanced',
      durationMinutes: 50,
      caloriesBurned: 490,
      category: 'Lower Body',
      equipment: ['Dumbbell', 'Barbell'],
      muscleGroups: ['Legs', 'Glutes', 'Calves'],
      isFeatured: false,
      instructions: [
        'Maintain lumbar neutral throughout heavy hinge motions.',
      ],
      exercises: [
        {
          exerciseId: 'ex_2',
          name: 'Goblet Squat',
          sets: 4,
          reps: 12,
          restTimeSeconds: 60,
          image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
        },
        {
          exerciseId: 'ex_7',
          name: 'Romanian Deadlift (RDL)',
          sets: 4,
          reps: 10,
          restTimeSeconds: 60,
          image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      _id: 'w_5',
      name: 'Core & Six-Pack Shred',
      description: 'Direct isometric and rotational core workout targeting rectus abdominis, obliques, and transverse abs.',
      coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
      difficulty: 'Beginner',
      durationMinutes: 20,
      caloriesBurned: 180,
      category: 'Abs & Core',
      equipment: ['Bodyweight'],
      muscleGroups: ['Abs & Core'],
      isFeatured: false,
      instructions: ['Focus on blowing out all air at top of crunch.'],
      exercises: [
        {
          exerciseId: 'ex_6',
          name: 'Hanging Knee Raises',
          sets: 3,
          reps: 15,
          restTimeSeconds: 30,
          image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
        },
      ],
    },
  ];

  const defaultMeals = [
    {
      _id: 'm_1',
      name: 'Power Protein Berry Oats Bowl',
      category: 'Breakfast',
      image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=600&auto=format&fit=crop&q=80',
      calories: 420,
      protein: 34,
      carbs: 52,
      fat: 9,
      prepTimeMinutes: 10,
      dietaryTags: ['High Protein', 'Vegetarian', 'Quick Prep'],
      ingredients: [
        '60g Rolled Oats',
        '1 scoop Whey Isolate Vanilla Protein',
        '150ml Unsweetened Almond Milk',
        '50g Fresh Blueberries & Raspberries',
        '1 tbsp Chia Seeds',
      ],
      instructions: [
        'Cook rolled oats in almond milk over medium heat for 4 minutes.',
        'Remove from heat, let cool for 60 seconds, then fold in whey protein powder until creamy.',
        'Top with fresh berries, chia seeds, and optional sugar-free maple syrup.',
      ],
    },
    {
      _id: 'm_2',
      name: 'Grilled Salmon & Quinoa Super Bowl',
      category: 'Lunch',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      calories: 560,
      protein: 42,
      carbs: 45,
      fat: 18,
      prepTimeMinutes: 20,
      dietaryTags: ['Omega 3 Rich', 'Gluten Free', 'Clean Eating'],
      ingredients: [
        '180g Wild Atlantic Salmon Fillet',
        '100g Cooked Tricolor Quinoa',
        '80g Steamed Broccoli Florets',
        '1/2 Sliced Hass Avocado',
        '1 tbsp Lemon Dijon Herb Vinaigrette',
      ],
      instructions: [
        'Season salmon with sea salt, black pepper, and garlic powder.',
        'Sear in a non-stick pan over medium-high heat for 4 minutes per side.',
        'Assemble bowl with warm quinoa, steamed broccoli, avocado slices, and flaked salmon.',
      ],
    },
    {
      _id: 'm_3',
      name: 'Herb Lemon Chicken & Sweet Potato Mash',
      category: 'Dinner',
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=80',
      calories: 510,
      protein: 48,
      carbs: 48,
      fat: 12,
      prepTimeMinutes: 25,
      dietaryTags: ['High Protein', 'Lean Muscle', 'Macro Friendly'],
      ingredients: [
        '200g Lean Chicken Breast',
        '180g Roasted Sweet Potato',
        '100g Grilled Asparagus Spears',
        '1 tsp Olive Oil & Fresh Rosemary',
      ],
      instructions: [
        'Marinate chicken breast with lemon zest, rosemary, and olive oil.',
        'Grill chicken for 6 minutes each side until internal temp reaches 74°C / 165°F.',
        'Mash roasted sweet potato with pinch of cinnamon and serve with tender asparagus.',
      ],
    },
    {
      _id: 'm_4',
      name: 'Greek Yogurt & Almond Crunch Snack',
      category: 'Snacks',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80',
      calories: 230,
      protein: 22,
      carbs: 18,
      fat: 7,
      prepTimeMinutes: 5,
      dietaryTags: ['High Protein', 'Probiotic', 'No Sugar Added'],
      ingredients: [
        '200g 0% Fat Authentic Greek Yogurt',
        '15g Crushed Raw Almonds',
        '1 tsp Organic Raw Honey',
        'Dash of Ground Cinnamon',
      ],
      instructions: [
        'Spoon Greek yogurt into a chilled bowl.',
        'Top with crunchy raw almonds, a light honey drizzle, and cinnamon.',
      ],
    },
  ];

  const defaultHistory = [
    {
      _id: generateId(),
      userId,
      workoutId: 'w_1',
      workoutName: 'Full Body Titan Blast',
      category: 'Full Body',
      durationMinutes: 42,
      caloriesBurned: 410,
      exercisesCompleted: [
        { name: 'Barbell Bench Press', setsCompleted: 4, repsCompleted: 10, weightKg: 75 },
        { name: 'Goblet Squat', setsCompleted: 3, repsCompleted: 12, weightKg: 24 },
        { name: 'Pull-Up', setsCompleted: 3, repsCompleted: 8, weightKg: 0 },
      ],
      notes: 'Crushed the bench press sets today! Feeling great.',
      completedAt: new Date('2026-02-26T17:30:00Z'),
      createdAt: new Date('2026-02-26T17:30:00Z'),
    },
    {
      _id: generateId(),
      userId,
      workoutId: 'w_2',
      workoutName: 'HIIT Inferno Fat Burner',
      category: 'HIIT',
      durationMinutes: 28,
      caloriesBurned: 375,
      exercisesCompleted: [
        { name: 'High-Knee HIIT Sprints', setsCompleted: 4, repsCompleted: 30 },
        { name: 'Goblet Squat Jumps', setsCompleted: 4, repsCompleted: 15 },
      ],
      notes: 'Intense sweat session. Heart rate averaged 162 bpm.',
      completedAt: new Date('2026-02-27T08:15:00Z'),
      createdAt: new Date('2026-02-27T08:15:00Z'),
    },
  ];

  const defaultProgress = [
    {
      _id: generateId(),
      userId,
      date: '2026-02-01',
      weightKg: 81.5,
      heightCm: 182,
      chestCm: 104,
      waistCm: 86,
      armsCm: 37,
      hipsCm: 99,
      thighsCm: 60,
      bmi: 24.6,
      bodyFatPercentage: 18.2,
      notes: 'Initial starting measurement log.',
      createdAt: new Date('2026-02-01T08:00:00Z'),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      userId,
      date: '2026-02-15',
      weightKg: 79.8,
      heightCm: 182,
      chestCm: 105,
      waistCm: 84,
      armsCm: 37.5,
      hipsCm: 98,
      thighsCm: 60.5,
      bmi: 24.1,
      bodyFatPercentage: 16.8,
      notes: 'Dropped 1.7kg, waist is tighter and arms grew 0.5cm.',
      createdAt: new Date('2026-02-15T08:00:00Z'),
      updatedAt: new Date(),
    },
    {
      _id: generateId(),
      userId,
      date: '2026-02-27',
      weightKg: 78.0,
      heightCm: 182,
      chestCm: 106,
      waistCm: 82,
      armsCm: 38.2,
      hipsCm: 97,
      thighsCm: 61,
      bmi: 23.5,
      bodyFatPercentage: 15.1,
      notes: 'Hit the target goal weight of 78kg! Strength is peaked.',
      createdAt: new Date('2026-02-27T08:00:00Z'),
      updatedAt: new Date(),
    },
  ];

  const defaultNotifications = [
    {
      _id: generateId(),
      userId: null, // Broadcast
      title: '🔥 New HIIT Workouts Added!',
      message: 'Check out our 3 brand new explosive high-intensity cardio protocols in the workout tab.',
      type: 'announcement',
      isRead: false,
      targetRole: 'all',
      createdAt: new Date('2026-02-27T10:00:00Z'),
    },
    {
      _id: generateId(),
      userId,
      title: '💪 Daily Workout Reminder',
      message: 'Time to smash your daily workout! Today is scheduled: Full Body Titan Blast.',
      type: 'workout',
      isRead: false,
      targetRole: 'user',
      createdAt: new Date('2026-02-27T12:00:00Z'),
    },
    {
      _id: generateId(),
      userId,
      title: '💧 Hydration Check',
      message: 'You have logged 5 glasses of water today. Reach your 8-glass goal before bedtime!',
      type: 'meal',
      isRead: true,
      targetRole: 'user',
      createdAt: new Date('2026-02-27T15:00:00Z'),
    },
  ];

  const defaultDailyLogs = [
    {
      _id: generateId(),
      userId,
      date: new Date().toISOString().split('T')[0],
      waterGlasses: 6,
      steps: 8420,
      caloriesBurned: 410,
      calorieTarget: 2400,
      meals: [
        {
          mealId: 'm_1',
          name: 'Power Protein Berry Oats Bowl',
          category: 'Breakfast',
          calories: 420,
          protein: 34,
          carbs: 52,
          fat: 9,
          loggedAt: new Date(),
        },
        {
          mealId: 'm_2',
          name: 'Grilled Salmon & Quinoa Super Bowl',
          category: 'Lunch',
          calories: 560,
          protein: 42,
          carbs: 45,
          fat: 18,
          loggedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const defaultFavorites = [
    {
      _id: generateId(),
      userId,
      itemType: 'workout',
      itemId: 'w_1',
      itemData: defaultWorkouts[0],
      createdAt: new Date(),
    },
    {
      _id: generateId(),
      userId,
      itemType: 'exercise',
      itemId: 'ex_1',
      itemData: defaultExercises[0],
      createdAt: new Date(),
    },
    {
      _id: generateId(),
      userId,
      itemType: 'meal',
      itemId: 'm_1',
      itemData: defaultMeals[0],
      createdAt: new Date(),
    },
  ];

  // Populate memory store
  memoryStore.users = defaultUsers;
  memoryStore.categories = defaultCategories;
  memoryStore.exercises = defaultExercises;
  memoryStore.workouts = defaultWorkouts;
  memoryStore.meals = defaultMeals;
  memoryStore.workoutHistories = defaultHistory;
  memoryStore.progress = defaultProgress;
  memoryStore.notifications = defaultNotifications;
  memoryStore.dailyLogs = defaultDailyLogs;
  memoryStore.favorites = defaultFavorites;

  // If MongoDB is connected, populate MongoDB collections if empty
  if (isMongoConnected()) {
    try {
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        await UserModel.insertMany(defaultUsers as any);
        await CategoryModel.insertMany(defaultCategories as any);
        await ExerciseModel.insertMany(defaultExercises as any);
        await WorkoutModel.insertMany(defaultWorkouts as any);
        await MealModel.insertMany(defaultMeals as any);
        await WorkoutHistoryModel.insertMany(defaultHistory as any);
        await ProgressModel.insertMany(defaultProgress as any);
        await NotificationModel.insertMany(defaultNotifications as any);
        await DailyLogModel.insertMany(defaultDailyLogs as any);
        await FavoriteModel.insertMany(defaultFavorites as any);
        console.log('[Seed] Seeded database collections into MongoDB successfully.');
      }
    } catch (err: any) {
      console.warn('[Seed] MongoDB sync note:', err.message);
    }
  }

  console.log('[Store] Seed data ready with default Admin (admin@fitness.com / admin123) and Demo User (user@fitness.com / user123).');
};
