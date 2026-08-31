import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workout, Exercise, Meal, FavoriteItem, AppNotification, DailyLog, WorkoutHistory } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ActiveWorkoutState {
  workout: Workout | null;
  currentExerciseIndex: number;
  currentSet: number;
  elapsedSeconds: number;
  isPaused: boolean;
  isResting: boolean;
  restRemainingSeconds: number;
  completedExercises: Array<{
    name: string;
    setsCompleted: number;
    repsCompleted: number;
    weightKg?: number;
  }>;
}

interface FitnessContextType {
  // Active workout execution
  activeWorkoutState: ActiveWorkoutState | null;
  startWorkout: (workout: Workout) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  nextExercise: () => void;
  previousExercise: () => void;
  completeCurrentSet: () => void;
  skipRest: () => void;
  finishWorkout: () => Promise<WorkoutHistory | null>;
  cancelWorkout: () => void;

  // Selected item modals
  selectedWorkout: Workout | null;
  setSelectedWorkout: (w: Workout | null) => void;
  selectedExercise: Exercise | null;
  setSelectedExercise: (e: Exercise | null) => void;
  selectedMeal: Meal | null;
  setSelectedMeal: (m: Meal | null) => void;

  // Modal open states
  isProgressModalOpen: boolean;
  setIsProgressModalOpen: (open: boolean) => void;
  isCalculatorModalOpen: boolean;
  setIsCalculatorModalOpen: (open: boolean) => void;
  isNotificationModalOpen: boolean;
  setIsNotificationModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'forgot';
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot') => void;

  // Favorites
  favorites: FavoriteItem[];
  isFavorite: (itemType: 'workout' | 'exercise' | 'meal', itemId: string) => boolean;
  toggleFavorite: (itemType: 'workout' | 'exercise' | 'meal', itemId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Daily Nutrition state
  dailySummary: any;
  refreshDailyNutrition: () => Promise<void>;
  logWater: (delta?: number, exact?: number) => Promise<void>;
  logMealToDaily: (meal: Meal) => Promise<void>;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Completed workout celebration modal
  completedSessionData: WorkoutHistory | null;
  setCompletedSessionData: (history: WorkoutHistory | null) => void;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

// Web Audio sound generator for timers
const playBeep = (freq = 800, duration = 0.15) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio context might be restricted before user gesture
  }
};

export const FitnessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // Active workout execution state
  const [activeWorkoutState, setActiveWorkoutState] = useState<ActiveWorkoutState | null>(null);
  const [completedSessionData, setCompletedSessionData] = useState<WorkoutHistory | null>(null);

  // Selected item inspectors
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  // General modals
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Favorites & Notifications
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Daily Nutrition & Water
  const [dailySummary, setDailySummary] = useState<any>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Workout Timer Interval
  useEffect(() => {
    if (!activeWorkoutState || activeWorkoutState.isPaused) return;

    const timer = setInterval(() => {
      setActiveWorkoutState((prev) => {
        if (!prev || prev.isPaused) return prev;

        if (prev.isResting) {
          if (prev.restRemainingSeconds <= 1) {
            playBeep(980, 0.3); // High beep when rest is finished!
            return {
              ...prev,
              isResting: false,
              restRemainingSeconds: 0,
              elapsedSeconds: prev.elapsedSeconds + 1,
            };
          } else {
            if (prev.restRemainingSeconds <= 3) {
              playBeep(600, 0.08); // countdown tick
            }
            return {
              ...prev,
              restRemainingSeconds: prev.restRemainingSeconds - 1,
              elapsedSeconds: prev.elapsedSeconds + 1,
            };
          }
        } else {
          return {
            ...prev,
            elapsedSeconds: prev.elapsedSeconds + 1,
          };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeWorkoutState?.isPaused, activeWorkoutState?.isResting]);

  // Load user data on auth change
  useEffect(() => {
    if (isAuthenticated) {
      refreshFavorites();
      refreshNotifications();
      refreshDailyNutrition();
    }
  }, [isAuthenticated, user?._id]);

  const refreshFavorites = async () => {
    try {
      const res = await api.favorites.getAll();
      setFavorites(res.data.favorites);
    } catch {
      // ignore
    }
  };

  const refreshNotifications = async () => {
    try {
      const res = await api.notifications.getAll();
      setNotifications(res.data.notifications);
      setUnreadNotificationsCount(res.data.unreadCount);
    } catch {
      // ignore
    }
  };

  const refreshDailyNutrition = async () => {
    try {
      const res = await api.meals.getDailySummary();
      setDailySummary(res.data);
    } catch {
      // ignore
    }
  };

  const startWorkout = (workout: Workout) => {
    setSelectedWorkout(null);
    setActiveWorkoutState({
      workout,
      currentExerciseIndex: 0,
      currentSet: 1,
      elapsedSeconds: 0,
      isPaused: false,
      isResting: false,
      restRemainingSeconds: 0,
      completedExercises: workout.exercises.map((e) => ({
        name: e.name,
        setsCompleted: 0,
        repsCompleted: e.reps,
      })),
    });
    playBeep(700, 0.2);
    showToast(`Started "${workout.name}" workout!`, 'success');
  };

  const pauseWorkout = () => {
    setActiveWorkoutState((prev) => (prev ? { ...prev, isPaused: true } : null));
  };

  const resumeWorkout = () => {
    setActiveWorkoutState((prev) => (prev ? { ...prev, isPaused: false } : null));
  };

  const completeCurrentSet = () => {
    if (!activeWorkoutState || !activeWorkoutState.workout) return;
    const { currentExerciseIndex, currentSet, workout, completedExercises } = activeWorkoutState;
    const currEx = workout.exercises[currentExerciseIndex];

    const updatedCompleted = [...completedExercises];
    if (updatedCompleted[currentExerciseIndex]) {
      updatedCompleted[currentExerciseIndex].setsCompleted += 1;
    }

    const restTime = currEx?.restTimeSeconds || 45;

    if (currentSet < (currEx?.sets || 3)) {
      // Start rest timer before next set
      setActiveWorkoutState((prev) =>
        prev
          ? {
              ...prev,
              currentSet: currentSet + 1,
              isResting: true,
              restRemainingSeconds: restTime,
              completedExercises: updatedCompleted,
            }
          : null
      );
      playBeep(850, 0.15);
    } else {
      // Advance to next exercise
      if (currentExerciseIndex < workout.exercises.length - 1) {
        setActiveWorkoutState((prev) =>
          prev
            ? {
                ...prev,
                currentExerciseIndex: currentExerciseIndex + 1,
                currentSet: 1,
                isResting: true,
                restRemainingSeconds: restTime + 15,
                completedExercises: updatedCompleted,
              }
            : null
        );
        playBeep(900, 0.25);
      } else {
        // Workout exercises all completed
        finishWorkout();
      }
    }
  };

  const skipRest = () => {
    setActiveWorkoutState((prev) => (prev ? { ...prev, isResting: false, restRemainingSeconds: 0 } : null));
  };

  const nextExercise = () => {
    if (!activeWorkoutState || !activeWorkoutState.workout) return;
    const { currentExerciseIndex, workout } = activeWorkoutState;
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setActiveWorkoutState((prev) =>
        prev
          ? {
              ...prev,
              currentExerciseIndex: currentExerciseIndex + 1,
              currentSet: 1,
              isResting: false,
              restRemainingSeconds: 0,
            }
          : null
      );
    }
  };

  const previousExercise = () => {
    if (!activeWorkoutState) return;
    const { currentExerciseIndex } = activeWorkoutState;
    if (currentExerciseIndex > 0) {
      setActiveWorkoutState((prev) =>
        prev
          ? {
              ...prev,
              currentExerciseIndex: currentExerciseIndex - 1,
              currentSet: 1,
              isResting: false,
              restRemainingSeconds: 0,
            }
          : null
      );
    }
  };

  const finishWorkout = async (): Promise<WorkoutHistory | null> => {
    if (!activeWorkoutState || !activeWorkoutState.workout) return null;

    const { workout, elapsedSeconds, completedExercises } = activeWorkoutState;
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const estimatedCalories = Math.round(durationMinutes * 9.2);

    try {
      const res = await api.history.logSession({
        workoutId: workout._id,
        workoutName: workout.name,
        category: workout.category,
        durationMinutes,
        caloriesBurned: estimatedCalories,
        exercisesCompleted: completedExercises,
        notes: `Completed in ${durationMinutes} minutes with ${completedExercises.reduce((sum, e) => sum + e.setsCompleted, 0)} sets!`,
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      setCompletedSessionData(res.data.history);
      setActiveWorkoutState(null);
      showToast('Workout successfully completed and saved!', 'success');
      refreshDailyNutrition();
      return res.data.history;
    } catch (err: any) {
      showToast(err.message || 'Failed to save workout history', 'error');
      setActiveWorkoutState(null);
      return null;
    }
  };

  const cancelWorkout = () => {
    setActiveWorkoutState(null);
    showToast('Workout cancelled', 'info');
  };

  const isFavorite = (itemType: 'workout' | 'exercise' | 'meal', itemId: string) => {
    return favorites.some((f) => f.itemType === itemType && f.itemId.toString() === itemId.toString());
  };

  const toggleFavorite = async (itemType: 'workout' | 'exercise' | 'meal', itemId: string) => {
    try {
      const res = await api.favorites.toggle(itemType, itemId);
      showToast(res.message, 'success');
      await refreshFavorites();
    } catch (err: any) {
      showToast(err.message || 'Failed to update favorites', 'error');
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotificationsCount(0);
      showToast('All notifications marked as read', 'success');
    } catch {
      // ignore
    }
  };

  const logWater = async (delta = 1, exact?: number) => {
    try {
      const res = await api.meals.updateWater({ delta, exact });
      showToast(`Hydration logged: ${res.data.waterGlasses} glasses (${res.data.waterLiters}L)`, 'success');
      refreshDailyNutrition();
    } catch (err: any) {
      showToast(err.message || 'Failed to log water', 'error');
    }
  };

  const logMealToDaily = async (meal: Meal) => {
    try {
      await api.meals.logDailyMeal({
        mealId: meal._id,
        name: meal.name,
        category: meal.category,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
      });
      showToast(`Logged "${meal.name}" (${meal.calories} kcal) to today's food journal!`, 'success');
      refreshDailyNutrition();
    } catch (err: any) {
      showToast(err.message || 'Failed to log meal', 'error');
    }
  };

  return (
    <FitnessContext.Provider
      value={{
        activeWorkoutState,
        startWorkout,
        pauseWorkout,
        resumeWorkout,
        nextExercise,
        previousExercise,
        completeCurrentSet,
        skipRest,
        finishWorkout,
        cancelWorkout,
        selectedWorkout,
        setSelectedWorkout,
        selectedExercise,
        setSelectedExercise,
        selectedMeal,
        setSelectedMeal,
        isProgressModalOpen,
        setIsProgressModalOpen,
        isCalculatorModalOpen,
        setIsCalculatorModalOpen,
        isNotificationModalOpen,
        setIsNotificationModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        favorites,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
        notifications,
        unreadNotificationsCount,
        refreshNotifications,
        markNotificationAsRead,
        markAllNotificationsRead,
        dailySummary,
        refreshDailyNutrition,
        logWater,
        logMealToDaily,
        toasts,
        showToast,
        removeToast,
        completedSessionData,
        setCompletedSessionData,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};
