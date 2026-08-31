import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { Modal } from '../common/Modal';
import { Utensils, Clock, Flame, Heart, PlusCircle, Check } from 'lucide-react';

export const MealDetailModal: React.FC = () => {
  const { selectedMeal, setSelectedMeal, isFavorite, toggleFavorite, logMealToDaily } = useFitness();

  if (!selectedMeal) return null;

  const isFav = isFavorite('meal', selectedMeal._id);

  return (
    <Modal
      isOpen={!!selectedMeal}
      onClose={() => setSelectedMeal(null)}
      maxWidth="lg"
    >
      <div className="space-y-4 -m-1">
        {/* Cover image */}
        <div className="relative rounded-3xl overflow-hidden aspect-[16/9] w-full bg-[#1A1A1A]">
          <img
            src={selectedMeal.image}
            alt={selectedMeal.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/30 to-transparent" />

          <button
            onClick={() => toggleFavorite('meal', selectedMeal._id)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white/60 hover:text-red-500 border border-white/10 transition-colors"
          >
            <Heart className={`w-5 h-5 ${isFav ? 'text-red-500 fill-red-500' : ''}`} />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#D9FF00] text-black uppercase tracking-wider">
              {selectedMeal.category}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-2 leading-tight">
              {selectedMeal.name}
            </h1>
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="grid grid-cols-4 gap-2.5">
          <div className="bg-[#181818] border border-white/5 p-3 rounded-2xl text-center">
            <span className="text-[9px] text-white/40 block uppercase tracking-wider font-bold">Calories</span>
            <span className="text-sm font-bold text-white font-mono">{selectedMeal.calories}</span>
            <span className="text-[9px] text-white/40 block">kcal</span>
          </div>

          <div className="bg-[#181818] border border-white/5 p-3 rounded-2xl text-center">
            <span className="text-[9px] text-[#D9FF00] block uppercase tracking-wider font-bold">Protein</span>
            <span className="text-sm font-bold text-[#D9FF00] font-mono">{selectedMeal.protein}g</span>
            <span className="text-[9px] text-white/40 block">{Math.round(((selectedMeal.protein * 4) / selectedMeal.calories) * 100)}%</span>
          </div>

          <div className="bg-[#181818] border border-white/5 p-3 rounded-2xl text-center">
            <span className="text-[9px] text-cyan-400 block uppercase tracking-wider font-bold">Carbs</span>
            <span className="text-sm font-bold text-cyan-400 font-mono">{selectedMeal.carbs}g</span>
            <span className="text-[9px] text-white/40 block">{Math.round(((selectedMeal.carbs * 4) / selectedMeal.calories) * 100)}%</span>
          </div>

          <div className="bg-[#181818] border border-white/5 p-3 rounded-2xl text-center">
            <span className="text-[9px] text-purple-400 block uppercase tracking-wider font-bold">Fats</span>
            <span className="text-sm font-bold text-purple-400 font-mono">{selectedMeal.fat}g</span>
            <span className="text-[9px] text-white/40 block">{Math.round(((selectedMeal.fat * 9) / selectedMeal.calories) * 100)}%</span>
          </div>
        </div>

        {/* Dietary tags */}
        {selectedMeal.dietaryTags && selectedMeal.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedMeal.dietaryTags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/70 border border-white/10 font-semibold">
                🌿 {tag}
              </span>
            ))}
            <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/70 border border-white/10 font-semibold">
              ⏱️ {selectedMeal.prepTimeMinutes} min prep
            </span>
          </div>
        )}

        {/* Ingredients */}
        <div>
          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Ingredients Checklist</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedMeal.ingredients?.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#181818] border border-white/5 text-xs text-white/80">
                <Check className="w-3.5 h-3.5 text-[#D9FF00] shrink-0" />
                <span>{ing}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preparation steps */}
        {selectedMeal.instructions && selectedMeal.instructions.length > 0 && (
          <div>
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Preparation Steps</h3>
            <div className="space-y-2">
              {selectedMeal.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-[#181818] border border-white/5 text-xs text-white/80 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-[#D9FF00]/20 text-[#D9FF00] text-xs font-bold flex items-center justify-center shrink-0 font-mono">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              logMealToDaily(selectedMeal);
              setSelectedMeal(null);
            }}
            className="w-full py-3.5 px-6 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,255,0,0.3)] transition-all"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Log to Today's Journal (+{selectedMeal.calories} kcal)</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
