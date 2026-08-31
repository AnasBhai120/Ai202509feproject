import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Workout, Exercise } from '../../types';
import { useFitness } from '../../context/FitnessContext';
import { Modal } from '../../components/common/Modal';
import {
  Dumbbell,
  Plus,
  Edit2,
  Trash2,
  Search,
  Flame,
  Clock,
  Layers,
  PlusCircle,
  X,
  Sparkles,
} from 'lucide-react';

export const AdminWorkouts: React.FC = () => {
  const { showToast } = useFitness();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Partial<Workout> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [wRes, eRes] = await Promise.all([api.workouts.getAll(), api.exercises.getAll()]);
      setWorkouts(wRes.data.workouts);
      setExercisesList(eRes.data.exercises);
    } catch (err: any) {
      showToast(err.message || 'Failed to load workouts', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingWorkout({
      name: '',
      description: '',
      category: 'Full Body',
      difficulty: 'Intermediate',
      durationMinutes: 40,
      caloriesBurned: 350,
      muscleGroups: ['Chest', 'Back'],
      coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      exercises: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (workout: Workout) => {
    setEditingWorkout({ ...workout });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.workouts.delete(id);
      showToast('Workout deleted successfully', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete workout', 'error');
    }
  };

  const handleAddExerciseToWorkout = (exerciseId: string) => {
    if (!editingWorkout) return;
    const selectedEx = exercisesList.find((e) => e._id === exerciseId);
    if (!selectedEx) return;

    const newEx = {
      exercise: selectedEx._id,
      name: selectedEx.name,
      sets: selectedEx.defaultSets || 3,
      reps: selectedEx.defaultReps || 12,
      restSeconds: 60,
    };

    setEditingWorkout({
      ...editingWorkout,
      exercises: [...(editingWorkout.exercises || []), newEx],
    });
  };

  const handleRemoveExercise = (idx: number) => {
    if (!editingWorkout || !editingWorkout.exercises) return;
    const updated = [...editingWorkout.exercises];
    updated.splice(idx, 1);
    setEditingWorkout({ ...editingWorkout, exercises: updated });
  };

  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkout) return;

    try {
      if (editingWorkout._id) {
        await api.workouts.update(editingWorkout._id, editingWorkout);
        showToast('Workout updated successfully', 'success');
      } else {
        await api.workouts.create(editingWorkout);
        showToast('New workout routine created', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  const filteredWorkouts = workouts.filter((w) => {
    const matchesCategory = categoryFilter === 'All' || w.category === categoryFilter;
    const matchesSearch =
      !search ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Workout Programs Catalog</h1>
          <p className="text-xs text-white/40 mt-0.5">
            Create, calibrate, and structure full workout routines with targeted exercise sequences.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(217,255,0,0.3)] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Workout</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search workouts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D9FF00]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-[#111111] border border-white/10 rounded-2xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
        >
          <option value="All">All Categories</option>
          <option value="Full Body">Full Body</option>
          <option value="Upper Body">Upper Body</option>
          <option value="Lower Body">Lower Body</option>
          <option value="Core">Core</option>
          <option value="Cardio">Cardio</option>
          <option value="HIIT">HIIT</option>
          <option value="Strength">Strength</option>
        </select>
      </div>

      {/* Grid of Workouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkouts.map((workout) => (
          <div
            key={workout._id}
            className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/9] w-full bg-[#1A1A1A]">
                <img src={workout.coverImage} alt={workout.name} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#D9FF00] text-black uppercase">
                    {workout.difficulty}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white uppercase border border-white/10">
                    {workout.category}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-white">{workout.name}</h3>
                <p className="text-xs text-white/50 line-clamp-2">{workout.description}</p>
                <div className="flex items-center gap-3 text-xs text-white/60 pt-2 border-t border-white/5 font-mono">
                  <span>⏱️ {workout.durationMinutes}m</span>
                  <span>🔥 {workout.caloriesBurned} kcal</span>
                  <span>🏋️ {workout.exercises.length} moves</span>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 flex gap-2">
              <button
                onClick={() => handleOpenEdit(workout)}
                className="flex-1 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-white/10 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Routine</span>
              </button>
              <button
                onClick={() => handleDelete(workout._id)}
                className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                title="Delete Workout"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Workout Modal */}
      {isModalOpen && editingWorkout && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingWorkout._id ? 'Edit Workout Routine' : 'Create New Workout Routine'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveWorkout} className="space-y-4 -m-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Workout Name</label>
                <input
                  type="text"
                  required
                  value={editingWorkout.name}
                  onChange={(e) => setEditingWorkout({ ...editingWorkout, name: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Category</label>
                <select
                  value={editingWorkout.category}
                  onChange={(e) => setEditingWorkout({ ...editingWorkout, category: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
                >
                  <option value="Full Body">Full Body</option>
                  <option value="Upper Body">Upper Body</option>
                  <option value="Lower Body">Lower Body</option>
                  <option value="Core">Core</option>
                  <option value="Cardio">Cardio</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Strength">Strength</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Difficulty</label>
                <select
                  value={editingWorkout.difficulty}
                  onChange={(e) => setEditingWorkout({ ...editingWorkout, difficulty: e.target.value as any })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  required
                  value={editingWorkout.coverImage}
                  onChange={(e) => setEditingWorkout({ ...editingWorkout, coverImage: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={editingWorkout.durationMinutes}
                  onChange={(e) => setEditingWorkout({ ...editingWorkout, durationMinutes: Number(e.target.value) })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Calories Burned (kcal)</label>
                <input
                  type="number"
                  value={editingWorkout.caloriesBurned}
                  onChange={(e) => setEditingWorkout({ ...editingWorkout, caloriesBurned: Number(e.target.value) })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D9FF00]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/60 block mb-1">Workout Description</label>
              <textarea
                rows={2}
                required
                value={editingWorkout.description}
                onChange={(e) => setEditingWorkout({ ...editingWorkout, description: e.target.value })}
                className="w-full bg-[#181818] border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-[#D9FF00] resize-none"
              />
            </div>

            {/* Exercise Sequence Builder */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                  Exercise Sequence ({editingWorkout.exercises?.length || 0})
                </span>

                {/* Add Exercise Dropdown */}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddExerciseToWorkout(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="bg-[#181818] border border-white/10 rounded-full px-3 py-1 text-xs text-[#D9FF00] font-bold focus:outline-none focus:border-[#D9FF00]"
                >
                  <option value="">+ Add Exercise...</option>
                  {exercisesList.map((ex) => (
                    <option key={ex._id} value={ex._id}>
                      {ex.name} ({ex.muscleGroup})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-none">
                {(editingWorkout.exercises || []).map((ex, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[#181818] border border-white/5 text-xs"
                  >
                    <span className="font-bold text-white">
                      {idx + 1}. {ex.name}
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-white/50 font-mono">
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => {
                            const updated = [...(editingWorkout.exercises || [])];
                            updated[idx].sets = Number(e.target.value);
                            setEditingWorkout({ ...editingWorkout, exercises: updated });
                          }}
                          className="w-10 bg-[#111111] border border-white/10 text-center rounded text-white"
                        />
                        <span>sets ×</span>
                        <input
                          type="number"
                          value={ex.reps}
                          onChange={(e) => {
                            const updated = [...(editingWorkout.exercises || [])];
                            updated[idx].reps = Number(e.target.value);
                            setEditingWorkout({ ...editingWorkout, exercises: updated });
                          }}
                          className="w-10 bg-[#111111] border border-white/10 text-center rounded text-white"
                        />
                        <span>reps</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(idx)}
                        className="text-white/40 hover:text-red-400 p-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-full bg-white/5 text-xs text-white/60 font-bold hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black text-xs font-black uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(217,255,0,0.3)]"
              >
                Save Workout Routine
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
