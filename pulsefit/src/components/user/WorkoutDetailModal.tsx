import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { Modal } from '../common/Modal';
import {
  Flame,
  Clock,
  Zap,
  Dumbbell,
  Play,
  Heart,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const WorkoutDetailModal: React.FC = () => {
  const {
    selectedWorkout,
    setSelectedWorkout,
    startWorkout,
    isFavorite,
    toggleFavorite,
    setSelectedExercise,
  } = useFitness();

  if (!selectedWorkout) return null;

  const isFav = isFavorite('workout', selectedWorkout._id);

  return (
    <Modal
      isOpen={!!selectedWorkout}
      onClose={() => setSelectedWorkout(null)}
      maxWidth="2xl"
    >
      <div className="space-y-5 -m-1">
        {/* Cover Banner */}
        <div className="relative rounded-3xl overflow-hidden aspect-[16/9] w-full bg-[#1A1A1A]">
          <img
            src={selectedWorkout.coverImage}
            alt={selectedWorkout.name}
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/30 to-transparent" />

          <button
            onClick={() => toggleFavorite('workout', selectedWorkout._id)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white/60 hover:text-red-500 border border-white/10 transition-colors"
          >
            <Heart className={`w-5 h-5 ${isFav ? 'text-red-500 fill-red-500' : ''}`} />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#D9FF00] text-black uppercase tracking-wider">
              {selectedWorkout.difficulty}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-2 leading-tight">
              {selectedWorkout.name}
            </h1>
          </div>
        </div>

        {/* Stats Pill Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#181818] border border-white/5 p-3.5 rounded-2xl text-center">
            <Clock className="w-4 h-4 text-[#D9FF00] mx-auto mb-1" />
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Duration</span>
            <span className="text-sm font-bold text-white mt-0.5 block">{selectedWorkout.durationMinutes} min</span>
          </div>

          <div className="bg-[#181818] border border-white/5 p-3.5 rounded-2xl text-center">
            <Flame className="w-4 h-4 text-[#D9FF00] mx-auto mb-1" />
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Est. Burn</span>
            <span className="text-sm font-bold text-white mt-0.5 block">{selectedWorkout.caloriesBurned} kcal</span>
          </div>

          <div className="bg-[#181818] border border-white/5 p-3.5 rounded-2xl text-center">
            <Layers className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Exercises</span>
            <span className="text-sm font-bold text-white mt-0.5 block">{selectedWorkout.exercises?.length || 0} moves</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Overview</h3>
          <p className="text-xs text-white/70 leading-relaxed">{selectedWorkout.description}</p>
        </div>

        {/* Target Muscles & Equipment */}
        <div className="flex flex-wrap gap-2">
          {selectedWorkout.muscleGroups?.map((m) => (
            <span key={m} className="px-3 py-1 rounded-full bg-white/5 text-white/70 text-xs font-semibold border border-white/10">
              🎯 {m}
            </span>
          ))}
          {selectedWorkout.equipment?.map((eq) => (
            <span key={eq} className="px-3 py-1 rounded-full bg-white/5 text-white/70 text-xs font-semibold border border-white/10">
              🏋️ {eq}
            </span>
          ))}
        </div>

        {/* Exercise Sequence List */}
        <div>
          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2.5">
            Routine Structure ({selectedWorkout.exercises?.length} Movements)
          </h3>
          <div className="space-y-2">
            {selectedWorkout.exercises?.map((ex, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#181818] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 text-[#D9FF00] font-bold flex items-center justify-center text-xs border border-white/10">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                    <p className="text-[11px] text-white/40">
                      {ex.sets} sets × {ex.reps} reps • {ex.restTimeSeconds || 45}s recovery
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#D9FF00] bg-[#D9FF00]/10 px-2.5 py-0.5 rounded-full border border-[#D9FF00]/20 font-mono">
                    {ex.sets * ex.reps} reps
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Workout Button */}
        <div className="pt-2">
          <button
            onClick={() => startWorkout(selectedWorkout)}
            className="w-full py-4 px-6 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,255,0,0.3)] transition-all"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Start Workout Routine</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
