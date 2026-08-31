import React, { useState, useEffect } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { api } from '../../services/api';
import {
  Heart,
  Flame,
  Dumbbell,
  Utensils,
  Play,
  Info,
  Clock,
  Plus,
  Trash2,
} from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const {
    favorites,
    refreshFavorites,
    startWorkout,
    setSelectedWorkout,
    setSelectedExercise,
    setSelectedMeal,
    logMealToDaily,
    toggleFavorite,
  } = useFitness();

  const [activeTab, setActiveTab] = useState<'all' | 'workout' | 'exercise' | 'meal'>('all');

  useEffect(() => {
    refreshFavorites();
  }, []);

  const workouts = favorites.filter((f) => f.itemType === 'workout' && f.itemData);
  const exercises = favorites.filter((f) => f.itemType === 'exercise' && f.itemData);
  const meals = favorites.filter((f) => f.itemType === 'meal' && f.itemData);

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
          Saved <span className="font-bold text-[#D9FF00]">Bookmarks</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/40 mt-1">
          Quickly access your pinned training routines, exercise mechanics, and nutrition logs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-[#D9FF00] text-black font-bold shadow-[0_0_10px_rgba(217,255,0,0.3)]'
              : 'bg-[#111111] border border-white/5 text-white/50 hover:text-white'
          }`}
        >
          All ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab('workout')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'workout'
              ? 'bg-[#D9FF00] text-black font-bold shadow-[0_0_10px_rgba(217,255,0,0.3)]'
              : 'bg-[#111111] border border-white/5 text-white/50 hover:text-white'
          }`}
        >
          Workouts ({workouts.length})
        </button>
        <button
          onClick={() => setActiveTab('exercise')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'exercise'
              ? 'bg-[#D9FF00] text-black font-bold shadow-[0_0_10px_rgba(217,255,0,0.3)]'
              : 'bg-[#111111] border border-white/5 text-white/50 hover:text-white'
          }`}
        >
          Exercises ({exercises.length})
        </button>
        <button
          onClick={() => setActiveTab('meal')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'meal'
              ? 'bg-[#D9FF00] text-black font-bold shadow-[0_0_10px_rgba(217,255,0,0.3)]'
              : 'bg-[#111111] border border-white/5 text-white/50 hover:text-white'
          }`}
        >
          Meals ({meals.length})
        </button>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] border border-white/5 rounded-3xl">
          <Heart className="w-10 h-10 mx-auto text-white/20 mb-2" />
          <h3 className="text-sm font-bold text-white/60">No favorites saved yet</h3>
          <p className="text-xs text-white/30 mt-1">
            Tap the heart icon on any routine, exercise, or recipe to bookmark it here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Workouts section */}
          {(activeTab === 'all' || activeTab === 'workout') && workouts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#D9FF00] uppercase tracking-widest flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span>Saved Workouts ({workouts.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workouts.map((fav) => {
                  const w = fav.itemData;
                  return (
                    <div
                      key={fav._id}
                      onClick={() => setSelectedWorkout(w)}
                      className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:border-white/20 transition-all group flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/9] w-full bg-[#1A1A1A]">
                        <img src={w.coverImage} alt={w.name} className="w-full h-full object-cover opacity-70" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite('workout', w._id);
                          }}
                          className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-red-500 border border-white/10"
                        >
                          <Heart className="w-4 h-4 fill-red-500" />
                        </button>
                        <div className="absolute bottom-2.5 left-3">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#D9FF00] text-black uppercase tracking-wider">
                            {w.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#D9FF00] transition-colors">{w.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                          <span>⏱️ {w.durationMinutes}m</span>
                          <span>🔥 {w.caloriesBurned} kcal</span>
                        </div>
                      </div>
                      <div className="p-4 pt-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startWorkout(w);
                          }}
                          className="w-full py-2.5 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                        >
                          <Play className="w-3.5 h-3.5 fill-black" />
                          <span>START</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exercises section */}
          {(activeTab === 'all' || activeTab === 'exercise') && exercises.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                <span>Favorite Movements ({exercises.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {exercises.map((fav) => {
                  const ex = fav.itemData;
                  return (
                    <div
                      key={fav._id}
                      onClick={() => setSelectedExercise(ex)}
                      className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:border-white/20 transition-all p-3 space-y-2 flex flex-col justify-between group"
                    >
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#1A1A1A]">
                        <img src={ex.image} alt={ex.name} className="w-full h-full object-cover opacity-80" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite('exercise', ex._id);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-red-500 border border-white/10"
                        >
                          <Heart className="w-3.5 h-3.5 fill-red-500" />
                        </button>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#D9FF00] font-bold uppercase tracking-wider">{ex.muscleGroup}</span>
                        <h4 className="text-xs font-bold text-white group-hover:text-[#D9FF00] transition-colors">{ex.name}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Meals section */}
          {(activeTab === 'all' || activeTab === 'meal') && meals.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                <span>Saved Recipes ({meals.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {meals.map((fav) => {
                  const m = fav.itemData;
                  return (
                    <div
                      key={fav._id}
                      onClick={() => setSelectedMeal(m)}
                      className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:border-white/20 transition-all p-4 flex items-center justify-between gap-3 group"
                    >
                      <img src={m.image} alt={m.name} className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#D9FF00]">{m.category}</span>
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-[#D9FF00] transition-colors">{m.name}</h4>
                        <span className="text-xs text-white/40">{m.calories} kcal • {m.protein}g protein</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          logMealToDaily(m);
                        }}
                        className="p-2.5 rounded-full bg-white/5 hover:bg-[#D9FF00] hover:text-black text-white text-xs font-bold shrink-0 transition-colors"
                        title="Log to today"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
