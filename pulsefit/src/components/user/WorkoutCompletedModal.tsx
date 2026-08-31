import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { Modal } from '../common/Modal';
import { Trophy, Flame, Clock, CheckCircle2, Share2, Sparkles, ArrowRight } from 'lucide-react';

export const WorkoutCompletedModal: React.FC = () => {
  const { completedSessionData, setCompletedSessionData } = useFitness();

  if (!completedSessionData) return null;

  return (
    <Modal
      isOpen={!!completedSessionData}
      onClose={() => setCompletedSessionData(null)}
      maxWidth="md"
    >
      <div className="text-center space-y-5 -m-1">
        {/* Trophy Icon with glow */}
        <div className="relative inline-block mx-auto mt-2">
          <div className="w-16 h-16 rounded-full bg-[#D9FF00] flex items-center justify-center shadow-[0_0_25px_rgba(217,255,0,0.4)] mx-auto">
            <Trophy className="w-8 h-8 text-black stroke-[2.5]" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D9FF00] opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#D9FF00]" />
          </span>
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#D9FF00]">Workout Crushed</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1.5 leading-tight">
            {completedSessionData.workoutName}
          </h1>
          <p className="text-xs text-white/40 mt-1">High physical output logged to your permanent fitness history.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 bg-[#181818] border border-white/5 p-4 rounded-3xl">
          <div className="text-center">
            <Clock className="w-4 h-4 text-[#D9FF00] mx-auto mb-1" />
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Duration</span>
            <span className="text-xl font-bold text-white font-mono mt-0.5 block">{completedSessionData.durationMinutes} min</span>
          </div>

          <div className="text-center">
            <Flame className="w-4 h-4 text-[#D9FF00] mx-auto mb-1" />
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Burn</span>
            <span className="text-xl font-bold text-[#D9FF00] font-mono mt-0.5 block">{completedSessionData.caloriesBurned} kcal</span>
          </div>
        </div>

        {/* Exercises finished */}
        {completedSessionData.exercisesCompleted && completedSessionData.exercisesCompleted.length > 0 && (
          <div className="text-left bg-[#181818] border border-white/5 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2.5">
              Completed Movements
            </span>
            <div className="space-y-2 max-h-36 overflow-y-auto scrollbar-none">
              {completedSessionData.exercisesCompleted.map((ex, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-white/80">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D9FF00] shrink-0" />
                    <span className="truncate">{ex.name}</span>
                  </div>
                  <span className="text-[#D9FF00] font-bold shrink-0 ml-2 font-mono">
                    {ex.setsCompleted} sets
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => setCompletedSessionData(null)}
            className="w-full py-4 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,255,0,0.3)] transition-all"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
