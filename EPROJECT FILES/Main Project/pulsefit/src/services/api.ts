import {
  User,
  Workout,
  Exercise,
  Meal,
  ProgressLog,
  WorkoutHistory,
  DailyLog,
  FavoriteItem,
  AppNotification,
  Category,
  AdminDashboardData,
} from '../types';

const API_BASE = '/api';

const cleanQueryParams = (params?: Record<string, any>): string => {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all' && v !== 'All') {
      sp.append(k, String(v));
    }
  });
  const str = sp.toString();
  return str ? `?${str}` : '';
};

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('pulsefit_token');
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  const data = await res.json();
  if (!res.ok || !data.success) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    if (res.status === 401 && !window.location.pathname.includes('/login')) {
      // Token might be invalid, but we allow user to re-login gracefully
    }
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth
  auth: {
    register: (userData: any) =>
      fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      }).then(handleResponse<{ success: boolean; token: string; data: { user: User } }>),

    login: (credentials: { email: string; password: string }) =>
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      }).then(handleResponse<{ success: boolean; token: string; data: { user: User } }>),

    getMe: () =>
      fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; data: { user: User } }>),

    forgotPassword: (email: string) =>
      fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      }).then(handleResponse<{ success: boolean; message: string; resetToken?: string }>),

    resetPassword: (payload: { email: string; resetToken: string; newPassword: string }) =>
      fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then(handleResponse<{ success: boolean; message: string }>),
  },

  // Users & Profile
  users: {
    getProfile: () =>
      fetch(`${API_BASE}/users/profile`, {
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; data: { user: User } }>),

    updateProfile: (profileData: Partial<User>) =>
      fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      }).then(handleResponse<{ success: boolean; message: string; data: { user: User } }>),

    changePassword: (payload: { currentPassword: string; newPassword: string }) =>
      fetch(`${API_BASE}/users/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then(handleResponse<{ success: boolean; message: string }>),

    // Admin users
    getAll: (params?: { search?: string; role?: string; status?: string; goal?: string }) => {
      const qs = cleanQueryParams(params);
      return fetch(`${API_BASE}/users${qs}`, {
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; data: { total: number; users: User[] } }>);
    },

    create: (userData: any) =>
      fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      }).then(handleResponse<{ success: boolean; message: string; data: { user: User } }>),

    getById: (id: string) =>
      fetch(`${API_BASE}/users/${id}`, {
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; data: { user: User } }>),

    updateUser: (id: string, data: Partial<User>) =>
      fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse<{ success: boolean; message: string; data: { user: User } }>),

    toggleStatus: (id: string) =>
      fetch(`${API_BASE}/users/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; message: string; data: { status: string } }>),

    changeRole: (id: string, role: 'user' | 'admin') =>
      fetch(`${API_BASE}/users/${id}/role`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ role }),
      }).then(handleResponse<{ success: boolean; message: string; data: { role: string } }>),

    deleteUser: (id: string) =>
      fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; message: string }>),
  },

  // Workouts
  workouts: {
    getAll: (params?: { category?: string; difficulty?: string; search?: string; featured?: string; durationMax?: number }) => {
      const qs = cleanQueryParams(params);
      return fetch(`${API_BASE}/workouts${qs}`, {
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; data: { total: number; workouts: Workout[] } }>);
    },

    getById: (id: string) =>
      fetch(`${API_BASE}/workouts/${id}`, {
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; data: { workout: Workout } }>),

    create: (workout: Partial<Workout>) =>
      fetch(`${API_BASE}/workouts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(workout),
      }).then(handleResponse<{ success: boolean; message: string; data: { workout: Workout } }>),

    update: (id: string, workout: Partial<Workout>) =>
      fetch(`${API_BASE}/workouts/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(workout),
      }).then(handleResponse<{ success: boolean; message: string; data: { workout: Workout } }>),

    delete: (id: string) =>
      fetch(`${API_BASE}/workouts/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; message: string }>),
  },

  // Exercises
  exercises: {
    getAll: (params?: { muscle?: string; equipment?: string; difficulty?: string; type?: string; search?: string }) => {
      const qs = cleanQueryParams(params);
      return fetch(`${API_BASE}/exercises${qs}`, {
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; data: { total: number; exercises: Exercise[] } }>);
    },

    getById: (id: string) =>
      fetch(`${API_BASE}/exercises/${id}`, {
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; data: { exercise: Exercise } }>),

    create: (exercise: Partial<Exercise>) =>
      fetch(`${API_BASE}/exercises`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(exercise),
      }).then(handleResponse<{ success: boolean; message: string; data: { exercise: Exercise } }>),

    update: (id: string, exercise: Partial<Exercise>) =>
      fetch(`${API_BASE}/exercises/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(exercise),
      }).then(handleResponse<{ success: boolean; message: string; data: { exercise: Exercise } }>),

    delete: (id: string) =>
      fetch(`${API_BASE}/exercises/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; message: string }>),
  },

  // Meals & Nutrition
  meals: {
    getAll: (params?: { category?: string; search?: string; maxCalories?: number }) => {
      const qs = cleanQueryParams(params);
      return fetch(`${API_BASE}/meals${qs}`, {
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; data: { total: number; meals: Meal[] } }>);
    },

    getById: (id: string) =>
      fetch(`${API_BASE}/meals/${id}`, {
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; data: { meal: Meal } }>),

    create: (meal: Partial<Meal>) =>
      fetch(`${API_BASE}/meals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(meal),
      }).then(handleResponse<{ success: boolean; message: string; data: { meal: Meal } }>),

    update: (id: string, meal: Partial<Meal>) =>
      fetch(`${API_BASE}/meals/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(meal),
      }).then(handleResponse<{ success: boolean; message: string; data: { meal: Meal } }>),

    delete: (id: string) =>
      fetch(`${API_BASE}/meals/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; message: string }>),

    // Daily Nutrition Journal
    getDailySummary: (date?: string) => {
      const qs = date ? `?date=${date}` : '';
      return fetch(`${API_BASE}/meals/daily/summary${qs}`, {
        headers: getHeaders(),
      }).then(
        handleResponse<{
          success: boolean;
          data: {
            log: DailyLog;
            totals: {
              calories: number;
              protein: number;
              carbs: number;
              fat: number;
              waterGlasses: number;
              waterLiters: number;
              calorieTarget: number;
              calorieRemaining: number;
            };
          };
        }>
      );
    },

    logDailyMeal: (payload: {
      mealId?: string;
      name: string;
      category: string;
      calories: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      date?: string;
    }) =>
      fetch(`${API_BASE}/meals/daily/log`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then(handleResponse<{ success: boolean; message: string; data: any }>),

    updateWater: (payload: { delta?: number; exact?: number; date?: string }) =>
      fetch(`${API_BASE}/meals/daily/water`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then(handleResponse<{ success: boolean; message: string; data: { waterGlasses: number; waterLiters: number } }>),
  },

  // Progress Logs
  progress: {
    getAll: () =>
      fetch(`${API_BASE}/progress`, {
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; data: { total: number; logs: ProgressLog[]; latest: ProgressLog | null } }>),

    add: (logData: Partial<ProgressLog>) =>
      fetch(`${API_BASE}/progress`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(logData),
      }).then(handleResponse<{ success: boolean; message: string; data: { progress: ProgressLog } }>),

    update: (id: string, logData: Partial<ProgressLog>) =>
      fetch(`${API_BASE}/progress/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(logData),
      }).then(handleResponse<{ success: boolean; message: string; data: { progress: ProgressLog } }>),

    delete: (id: string) =>
      fetch(`${API_BASE}/progress/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; message: string }>),
  },

  // Workout History
  history: {
    getAll: () =>
      fetch(`${API_BASE}/workout-history`, {
        headers: getHeaders(),
      }).then(
        handleResponse<{
          success: boolean;
          data: {
            total: number;
            history: WorkoutHistory[];
            stats: { totalWorkouts: number; totalMinutes: number; totalCalories: number; streak: number };
          };
        }>
      ),

    logSession: (sessionData: {
      workoutId?: string;
      workoutName: string;
      category?: string;
      durationMinutes: number;
      caloriesBurned: number;
      exercisesCompleted: Array<{ name: string; setsCompleted: number; repsCompleted: number; weightKg?: number }>;
      notes?: string;
    }) =>
      fetch(`${API_BASE}/workout-history`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(sessionData),
      }).then(handleResponse<{ success: boolean; message: string; data: { history: WorkoutHistory } }>),
  },

  // Favorites
  favorites: {
    getAll: (type?: 'workout' | 'exercise' | 'meal') => {
      const qs = type ? `?type=${type}` : '';
      return fetch(`${API_BASE}/favorites${qs}`, {
        headers: getHeaders(),
      }).then(
        handleResponse<{
          success: boolean;
          data: {
            total: number;
            favorites: FavoriteItem[];
            workouts: FavoriteItem[];
            exercises: FavoriteItem[];
            meals: FavoriteItem[];
          };
        }>
      );
    },

    toggle: (itemType: 'workout' | 'exercise' | 'meal', itemId: string) =>
      fetch(`${API_BASE}/favorites/toggle`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ itemType, itemId }),
      }).then(handleResponse<{ success: boolean; message: string; data: { isFavorite: boolean } }>),

    delete: (id: string) =>
      fetch(`${API_BASE}/favorites/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; message: string }>),
  },

  // Notifications
  notifications: {
    getAll: () =>
      fetch(`${API_BASE}/notifications`, {
        headers: getHeaders(),
      }).then(
        handleResponse<{
          success: boolean;
          data: { total: number; unreadCount: number; notifications: AppNotification[] };
        }>
      ),

    markAsRead: (id: string) =>
      fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; message: string }>),

    markAllAsRead: () =>
      fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; message: string }>),

    create: (payload: { title: string; message: string; type?: string; targetRole?: string; userId?: string }) =>
      fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then(handleResponse<{ success: boolean; message: string; data: { notification: AppNotification } }>),

    delete: (id: string) =>
      fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; message: string }>),

    clearAll: () =>
      fetch(`${API_BASE}/notifications/clear-all`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; message: string }>),
  },

  // Categories
  categories: {
    getAll: (type?: string) => {
      const qs = type ? `?type=${type}` : '';
      return fetch(`${API_BASE}/categories${qs}`, {
        headers: getHeaders(),
      }).then(
        handleResponse<{
          success: boolean;
          data: {
            total: number;
            categories: Category[];
            workoutCategories: Category[];
            muscleGroups: Category[];
            equipment: Category[];
          };
        }>
      );
    },

    create: (cat: Partial<Category>) =>
      fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(cat),
      }).then(handleResponse<{ success: boolean; message: string; data: { category: Category } }>),

    update: (id: string, cat: Partial<Category>) =>
      fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(cat),
      }).then(handleResponse<{ success: boolean; message: string; data: { category: Category } }>),

    delete: (id: string) =>
      fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; message: string }>),
  },

  // Admin Analytics
  admin: {
    getDashboard: () =>
      fetch(`${API_BASE}/admin/dashboard`, {
        headers: getHeaders(),
      }).then(handleResponse<{ success: boolean; data: AdminDashboardData }>),
  },

  // Image Upload
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse<{ success: boolean; message: string; data: { url: string } }>(res);
  },

  // Database Seed
  seed: () =>
    fetch(`${API_BASE}/seed`, {
      method: 'POST',
      headers: getHeaders(),
    }).then(handleResponse<{ success: boolean; message: string }>),
};
