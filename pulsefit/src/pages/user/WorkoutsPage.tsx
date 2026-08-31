import React, { useState, useEffect } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { api } from '../../services/api';
import { Workout } from '../../types';
import {
  Search,
  Flame,
  Clock,
  Dumbbell,
  Play,
  Heart,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';

export const WorkoutsPage: React.FC = () => {
  const { startWorkout, setSelectedWorkout, isFavorite, toggleFavorite } = useFitness();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [categories, setCategories] = useState<string[]>([
    'All',
    'Full Body',
    'Upper Body',
    'Lower Body',
    'Core',
    'Cardio & HIIT',
    'Strength',
  ]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    setIsLoading(true);
    try {
      const res = await api.workouts.getAll();
      setWorkouts(res.data.workouts);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWorkouts = workouts.filter((w) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      w.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'Cardio & HIIT' && (w.category === 'Cardio' || w.category === 'HIIT'));

    const matchesDifficulty = selectedDifficulty === 'All' || w.difficulty === selectedDifficulty;

    const matchesSearch =
      !searchQuery ||
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.muscleGroups.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
          Workout <span className="font-bold text-[#D9FF00]">Programs</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/40 mt-1">
          Explore structured routines with integrated interval timers and audio cues.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search workouts by name, target muscle, or gear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-full pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#D9FF00] transition-colors"
          />
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#D9FF00] text-black font-bold shadow-[0_0_10px_rgba(217,255,0,0.3)]'
                  : 'bg-[#111111] border border-white/5 text-white/50 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 mr-1">Intensity:</span>
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-white/15 text-white'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Workouts Grid */}
      {filteredWorkouts.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] border border-white/5 rounded-3xl">
          <Dumbbell className="w-10 h-10 mx-auto text-white/20 mb-2" />
          <h3 className="text-sm font-bold text-white/60">No workouts match your criteria</h3>
          <p className="text-xs text-white/30 mt-1">Try searching with another keyword or resetting filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredWorkouts.map((workout) => {
            const isFav = isFavorite('workout', workout._id);

            return (
              <div
                key={workout._id}
                onClick={() => setSelectedWorkout(workout)}
                className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:border-white/20 transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Card Cover */}
                  <div className="relative aspect-[16/9] w-full bg-[#1A1A1A] overflow-hidden">
                    <img
                      src={workout.coverImage}
                      alt={workout.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/30 to-transparent" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite('workout', workout._id);
                      }}
                      className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/60 hover:text-red-400 border border-white/10 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'text-red-500 fill-red-500' : ''}`} />
                    </button>

                    <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#D9FF00] text-black uppercase tracking-wider">
                        {workout.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-5">
                    <div className="text-[10px] font-bold text-[#D9FF00] uppercase tracking-wider">
                      {workout.category}
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 leading-snug group-hover:text-[#D9FF00] transition-colors">
                      {workout.name}
                    </h3>
                    <p className="text-xs text-white/50 line-clamp-2 mt-1">{workout.description}</p>

                    {/* Stats pills */}
                    <div className="flex items-center gap-4 text-xs text-white/40 mt-4 pt-3 border-t border-white/5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#D9FF00]" />
                        <span>{workout.durationMinutes} min</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>{workout.caloriesBurned} kcal</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{workout.exercises.length} moves</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startWorkout(workout);
                    }}
                    className="w-full py-2.5 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(217,255,0,0.3)] transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>START WORKOUT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
