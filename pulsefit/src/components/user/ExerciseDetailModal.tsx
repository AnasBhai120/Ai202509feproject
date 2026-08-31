import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { Modal } from '../common/Modal';
import { Dumbbell, Target, Layers, Heart, CheckCircle2, Flame } from 'lucide-react';

export const ExerciseDetailModal: React.FC = () => {
  const { selectedExercise, setSelectedExercise, isFavorite, toggleFavorite } = useFitness();

  if (!selectedExercise) return null;

  const isFav = isFavorite('exercise', selectedExercise._id);

  return (
    <Modal
      isOpen={!!selectedExercise}
      onClose={() => setSelectedExercise(null)}
      maxWidth="lg"
    >
      <div className="space-y-4 -m-1">
        {/* Cover image */}
        <div className="relative rounded-3xl overflow-hidden aspect-[16/9] w-full bg-[#1A1A1A]">
          <img
            src={selectedExercise.image}
            alt={selectedExercise.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/30 to-transparent" />

          <button
            onClick={() => toggleFavorite('exercise', selectedExercise._id)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white/60 hover:text-red-500 border border-white/10 transition-colors"
          >
            <Heart className={`w-5 h-5 ${isFav ? 'text-red-500 fill-red-500' : ''}`} />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#D9FF00] text-black uppercase tracking-wider">
              {selectedExercise.muscleGroup}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-2 leading-tight">
              {selectedExercise.name}
            </h1>
          </div>
        </div>

        {/* Quick Specs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#181818] border border-white/5 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Difficulty</span>
            <span className="text-xs font-bold text-[#D9FF00] mt-0.5 block">{selectedExercise.difficulty}</span>
          </div>
          <div className="bg-[#181818] border border-white/5 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Equipment</span>
            <span className="text-xs font-bold text-white truncate mt-0.5 block">{selectedExercise.equipment}</span>
          </div>
          <div className="bg-[#181818] border border-white/5 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Type</span>
            <span className="text-xs font-bold text-white mt-0.5 block">{selectedExercise.exerciseType}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Description</h3>
          <p className="text-xs text-white/70 leading-relaxed">{selectedExercise.description}</p>
        </div>

        {/* Instructions */}
        <div>
          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Step-by-Step Form & Technique</h3>
          <div className="space-y-2">
            {selectedExercise.instructions?.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-[#181818] border border-white/5">
                <span className="w-5 h-5 rounded-full bg-[#D9FF00]/20 text-[#D9FF00] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  {idx + 1}
                </span>
                <p className="text-xs text-white/80 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Target Recommendations */}
        <div className="bg-[#181818] border border-[#D9FF00]/20 p-3.5 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-white font-medium">
            <Flame className="w-4 h-4 text-[#D9FF00]" />
            <span>Recommended: {selectedExercise.defaultSets} Sets × {selectedExercise.defaultReps} Reps</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
