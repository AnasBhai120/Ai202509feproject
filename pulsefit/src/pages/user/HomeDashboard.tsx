import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFitness } from '../../context/FitnessContext';
import { api } from '../../services/api';
import { Workout, Meal } from '../../types';
import {
  Flame,
  Droplets,
  Zap,
  Play,
  Heart,
  Scale,
  Calculator,
  Plus,
  Minus,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  ArrowUpRight,
  Utensils,
  History,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface HomeDashboardProps {
  onNavigateTab: (tab: any) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const {
    startWorkout,
    setSelectedWorkout,
    setSelectedMeal,
    setIsProgressModalOpen,
    setIsCalculatorModalOpen,
    dailySummary,
    logWater,
    isFavorite,
    toggleFavorite,
  } = useFitness();

  const [featuredWorkouts, setFeaturedWorkouts] = useState<Workout[]>([]);
  const [featuredMeals, setFeaturedMeals] = useState<Meal[]>([]);
  const [historyStats, setHistoryStats] = useState<{ totalWorkouts: number; totalMinutes: number; totalCalories: number; streak: number }>({
    totalWorkouts: 4,
    totalMinutes: 140,
    totalCalories: 1250,
    streak: 3,
  });

  useEffect(() => {
    api.workouts.getAll().then((res) => {
      setFeaturedWorkouts(res.data.workouts);
    }).catch(() => {});

    api.meals.getAll().then((res) => {
      setFeaturedMeals(res.data.meals);
    }).catch(() => {});

    api.history.getAll().then((res) => {
      if (res.data.stats) {
        setHistoryStats(res.data.stats);
      }
    }).catch(() => {});
  }, []);

  const weeklyActivity = [
    { day: 'Mon', calories: 420, minutes: 45 },
    { day: 'Tue', calories: 380, minutes: 35 },
    { day: 'Wed', calories: 550, minutes: 55 },
    { day: 'Thu', calories: 290, minutes: 30 },
    { day: 'Fri', calories: 480, minutes: 45 },
    { day: 'Sat', calories: 620, minutes: 60 },
    { day: 'Sun', calories: 350, minutes: 40 },
  ];

  const targetCalories = dailySummary?.totals?.calorieTarget || 2200;
  const consumedCalories = dailySummary?.totals?.calories || 0;
  const waterGlasses = dailySummary?.totals?.waterGlasses || 0;
  const waterLiters = dailySummary?.totals?.waterLiters || 0;

  const topWorkout = featuredWorkouts[0];
  const topMeal = featuredMeals[0];

  const heightM = (user?.height || 175) / 100;
  const currentWeight = user?.weight || 72;
  const bmi = heightM > 0 ? (currentWeight / (heightM * heightM)).toFixed(1) : '22.4';

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Header Greeting & Real-time Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D9FF00]/10 border border-[#D9FF00]/20 text-[11px] font-extrabold text-[#D9FF00]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D9FF00] animate-pulse" />
              <span>{historyStats.streak} Day Streak</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight mt-1">
            Hello, <span className="font-bold text-[#D9FF00]">{user?.name?.split(' ')[0] || 'Athlete'}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsProgressModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111111] hover:bg-[#181818] border border-white/10 text-xs font-semibold text-white transition-all shadow-sm"
          >
            <Scale className="w-4 h-4 text-[#D9FF00]" />
            <span>Log Body Metrics</span>
          </button>
        </div>
      </div>

      {/* Main Daily Metrics Overview Bento - Sophisticated Dark Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Consumed */}
        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl flex flex-col justify-between hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Nutrition Target</span>
            <Flame className="w-4 h-4 text-[#D9FF00]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold text-white tracking-tight">{consumedCalories}</div>
            <div className="text-xs text-white/40 mt-0.5">of {targetCalories} kcal budget</div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D9FF00] rounded-full shadow-[0_0_8px_rgba(217,255,0,0.5)]"
              style={{ width: `${Math.min(100, (consumedCalories / targetCalories) * 100)}%` }}
            />
          </div>
        </div>

        {/* Workout Activity Minutes */}
        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl flex flex-col justify-between hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Active Minutes</span>
            <Zap className="w-4 h-4 text-[#D9FF00]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold text-white tracking-tight">{historyStats.totalMinutes}m</div>
            <div className="text-xs text-white/40 mt-0.5">{historyStats.totalWorkouts} sessions completed</div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#D9FF00] rounded-full shadow-[0_0_8px_rgba(217,255,0,0.5)] w-[75%]" />
          </div>
        </div>

        {/* Interactive Hydration Tracker */}
        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl flex flex-col justify-between hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Hydration</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-white tracking-tight">{waterGlasses}</span>
              <span className="text-xs text-white/40">/ 8 cups ({waterLiters}L)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => logWater(-1)}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => logWater(1)}
              className="flex-1 py-1 rounded-full bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 border border-cyan-400/20 text-xs font-bold text-center transition-colors"
            >
              +1 Glass
            </button>
          </div>
        </div>

        {/* Current Weight & BMI */}
        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl flex flex-col justify-between hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Body Mass</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white tracking-tight">{currentWeight}</span>
              <span className="text-xs text-white/40 font-bold">kg</span>
            </div>
            <div className="text-xs text-[#D9FF00] font-semibold mt-0.5">BMI {bmi} • Optimal</div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-purple-400 rounded-full w-[60%]" />
          </div>
        </div>
      </div>

      {/* Featured Workout Recommendation Card */}
      {topWorkout && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">Curated Program</span>
              <span className="px-2 py-0.5 bg-[#D9FF00] text-black text-[9px] font-black rounded-sm uppercase tracking-wider">
                FEATURED
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('workouts')}
              className="text-xs text-[#D9FF00] hover:underline font-semibold flex items-center gap-0.5"
            >
              <span>View All Routines</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative rounded-3xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] w-full bg-[#111111] border border-white/10 group shadow-2xl">
            <img
              src={topWorkout.coverImage}
              alt={topWorkout.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite('workout', topWorkout._id);
              }}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/70 backdrop-blur-md text-white/60 hover:text-red-400 border border-white/10 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFavorite('workout', topWorkout._id) ? 'text-red-500 fill-red-500' : ''}`} />
            </button>

            <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#D9FF00] text-black uppercase tracking-wider">
                    {topWorkout.difficulty}
                  </span>
                  <span className="text-xs text-[#D9FF00] font-bold tracking-wide uppercase">
                    {topWorkout.category}
                  </span>
                </div>
                <h3 className="text-xl sm:text-3xl font-bold text-white tracking-tight leading-tight">{topWorkout.name}</h3>
                <p className="text-xs text-white/60 line-clamp-1">{topWorkout.description}</p>
                <div className="flex items-center gap-4 text-xs text-white/40 pt-1">
                  <span>⏱️ {topWorkout.durationMinutes} mins</span>
                  <span>🔥 {topWorkout.caloriesBurned} kcal</span>
                  <span>🏋️ {topWorkout.exercises.length} exercises</span>
                </div>
              </div>

              <div className="flex gap-2.5 shrink-0">
                <button
                  onClick={() => setSelectedWorkout(topWorkout)}
                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-bold text-white border border-white/10 transition-all"
                >
                  Details
                </button>
                <button
                  onClick={() => startWorkout(topWorkout)}
                  className="px-6 py-2.5 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black text-xs font-black flex items-center gap-2 shadow-[0_0_15px_rgba(217,255,0,0.4)] transition-all transform active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>START WORKOUT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Activity Chart & Analysis */}
      <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight">Weekly Activity & Burn</h3>
            <p className="text-xs text-white/40">Caloric output and session duration over the last 7 days</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-[#D9FF00]/10 border border-[#D9FF00]/20 rounded-full text-xs text-[#D9FF00] font-bold">
              3,090 kcal burned
            </div>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyActivity}>
              <defs>
                <linearGradient id="voltGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D9FF00" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D9FF00" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0a0a',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  fontSize: '12px',
                  color: '#ffffff',
                }}
                formatter={(val: any) => [`${val} kcal`, 'Calories Burned']}
              />
              <Area type="monotone" dataKey="calories" stroke="#D9FF00" strokeWidth={2.5} fillOpacity={1} fill="url(#voltGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-white/40">
          <div className="flex items-center gap-6">
            <div>
              <span className="block text-[10px] uppercase text-white/30">Top Day</span>
              <span className="text-white font-medium">Saturday (620 kcal)</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-white/30">Avg Session</span>
              <span className="text-white font-medium">44 mins</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('progress')}
            className="text-xs font-bold text-white hover:text-[#D9FF00] flex items-center gap-1 transition-colors"
          >
            <span>Full Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Nutrition & Quick Start Utilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Recommended Meal Tile */}
        {topMeal && (
          <div
            onClick={() => setSelectedMeal(topMeal)}
            className="bg-[#111111] border border-white/5 p-4 rounded-3xl flex gap-4 items-center cursor-pointer hover:border-white/20 transition-all group"
          >
            <img
              src={topMeal.image}
              alt={topMeal.name}
              className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#D9FF00] tracking-wider">Post-Workout Nutrition</span>
              <h4 className="text-sm font-bold text-white truncate mt-0.5">{topMeal.name}</h4>
              <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                <span>{topMeal.calories} kcal</span>
                <span>•</span>
                <span className="text-[#D9FF00] font-semibold">{topMeal.protein}g protein</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors shrink-0" />
          </div>
        )}

        {/* Quick Utilities Tile */}
        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Quick Utilities</span>
            <Calculator className="w-4 h-4 text-[#D9FF00]" />
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            <button
              onClick={() => setIsCalculatorModalOpen(true)}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold text-white text-left transition-colors flex items-center justify-between"
            >
              <span>BMI & TDEE</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#D9FF00]" />
            </button>
            <button
              onClick={() => onNavigateTab('history')}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold text-white text-left transition-colors flex items-center justify-between"
            >
              <span>Workout Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#D9FF00]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
