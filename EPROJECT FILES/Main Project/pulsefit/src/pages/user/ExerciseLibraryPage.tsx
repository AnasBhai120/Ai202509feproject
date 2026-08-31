import React, { useState, useEffect } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { api } from '../../services/api';
import { Exercise } from '../../types';
import { Search, Dumbbell, Target, Heart, Layers, Flame, Info } from 'lucide-react';

export const ExerciseLibraryPage: React.FC = () => {
  const { setSelectedExercise, isFavorite, toggleFavorite } = useFitness();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([
    'All',
    'Chest',
    'Back',
    'Legs',
    'Shoulders',
    'Arms',
    'Core',
  ]);
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setIsLoading(true);
    try {
      const res = await api.exercises.getAll();
      setExercises(res.data.exercises);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesMuscle =
      selectedMuscle === 'All' ||
      ex.muscleGroup.toLowerCase() === selectedMuscle.toLowerCase() ||
      ex.secondaryMuscles?.some((m) => m.toLowerCase() === selectedMuscle.toLowerCase());

    const matchesEquipment =
      selectedEquipment === 'All' || ex.equipment.toLowerCase().includes(selectedEquipment.toLowerCase());

    const matchesSearch =
      !searchQuery ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesMuscle && matchesEquipment && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
          Exercise <span className="font-bold text-[#D9FF00]">Library</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/40 mt-1">
          Explore movement mechanics, biomechanical focus, and execution standards.
        </p>
      </div>

      {/* Search & Muscle Group Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search exercises by name, primary muscle, or cues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-full pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#D9FF00] transition-colors"
          />
        </div>

        {/* Muscle group horizontal tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {muscleGroups.map((muscle) => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedMuscle === muscle
                  ? 'bg-[#D9FF00] text-black font-bold shadow-[0_0_10px_rgba(217,255,0,0.3)]'
                  : 'bg-[#111111] border border-white/5 text-white/50 hover:text-white'
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>

        {/* Equipment row */}
        <div className="flex items-center gap-1.5 text-xs text-white/40 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 mr-1 shrink-0">Equipment:</span>
          {['All', 'Barbell', 'Dumbbells', 'Bodyweight', 'Cable', 'Machine'].map((eq) => (
            <button
              key={eq}
              onClick={() => setSelectedEquipment(eq)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
                selectedEquipment === eq ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Exercises */}
      {filteredExercises.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] border border-white/5 rounded-3xl">
          <Dumbbell className="w-10 h-10 mx-auto text-white/20 mb-2" />
          <h3 className="text-sm font-bold text-white/60">No exercises found</h3>
          <p className="text-xs text-white/30 mt-1">Try selecting another muscle group or equipment filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => {
            const isFav = isFavorite('exercise', exercise._id);

            return (
              <div
                key={exercise._id}
                onClick={() => setSelectedExercise(exercise)}
                className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:border-white/20 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo */}
                  <div className="relative aspect-[16/10] w-full bg-[#1A1A1A] overflow-hidden">
                    <img
                      src={exercise.image}
                      alt={exercise.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite('exercise', exercise._id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/60 hover:text-red-400 border border-white/10 transition-colors"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-red-500 fill-red-500' : ''}`} />
                    </button>

                    <div className="absolute bottom-2.5 left-3">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#D9FF00] text-black uppercase tracking-wider">
                        {exercise.muscleGroup}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#D9FF00] transition-colors">
                      {exercise.name}
                    </h3>
                    <p className="text-xs text-white/40 line-clamp-2 mt-1">{exercise.description}</p>

                    <div className="flex items-center justify-between text-xs text-white/40 mt-3 pt-2.5 border-t border-white/5">
                      <span>🏋️ {exercise.equipment}</span>
                      <span className="text-[#D9FF00] font-semibold">{exercise.defaultSets} × {exercise.defaultReps}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="w-full py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors">
                    <Info className="w-3.5 h-3.5 text-[#D9FF00]" />
                    <span>View Form & Steps</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
