import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Exercise } from '../../types';
import { useFitness } from '../../context/FitnessContext';
import { Modal } from '../../components/common/Modal';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Search,
} from 'lucide-react';

export const AdminExercises: React.FC = () => {
  const { showToast } = useFitness();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Partial<Exercise> | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setIsLoading(true);
    try {
      const res = await api.exercises.getAll();
      setExercises(res.data.exercises);
    } catch (err: any) {
      showToast(err.message || 'Failed to load exercises', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingExercise({
      name: '',
      muscleGroup: 'Chest',
      secondaryMuscles: ['Triceps', 'Shoulders'],
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      exerciseType: 'Strength',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80',
      description: '',
      instructions: ['Lie flat on the bench with eyes under the bar.', 'Lower the bar slowly to mid-chest.', 'Press explosively upward.'],
      defaultSets: 4,
      defaultReps: 10,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ex: Exercise) => {
    setEditingExercise({ ...ex });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.exercises.delete(id);
      showToast('Exercise deleted', 'success');
      loadExercises();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise) return;

    try {
      if (editingExercise._id) {
        await api.exercises.update(editingExercise._id, editingExercise);
        showToast('Exercise updated', 'success');
      } else {
        await api.exercises.create(editingExercise);
        showToast('New exercise created', 'success');
      }
      setIsModalOpen(false);
      loadExercises();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  const filtered = exercises.filter((ex) => {
    const matchMuscle = muscleFilter === 'All' || ex.muscleGroup === muscleFilter;
    const matchSearch =
      !search ||
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(search.toLowerCase());
    return matchMuscle && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Exercise Library Catalog</h1>
          <p className="text-xs text-white/40 mt-0.5">
            Manage movement mechanics, targeted muscle groups, instructions, and default rep structures.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(217,255,0,0.3)] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Exercise</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D9FF00]"
          />
        </div>

        <select
          value={muscleFilter}
          onChange={(e) => setMuscleFilter(e.target.value)}
          className="bg-[#111111] border border-white/10 rounded-2xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
        >
          <option value="All">All Muscles</option>
          <option value="Chest">Chest</option>
          <option value="Back">Back</option>
          <option value="Legs">Legs</option>
          <option value="Shoulders">Shoulders</option>
          <option value="Arms">Arms</option>
          <option value="Core">Core</option>
          <option value="Cardio">Cardio</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((ex) => (
          <div
            key={ex._id}
            className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/10] w-full bg-[#1A1A1A]">
                <img src={ex.image} alt={ex.name} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#D9FF00] text-black uppercase">
                    {ex.muscleGroup}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white uppercase border border-white/10">
                    {ex.equipment}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <h3 className="text-sm font-bold text-white">{ex.name}</h3>
                <p className="text-xs text-white/50 line-clamp-2">{ex.description}</p>
                <div className="text-xs text-[#D9FF00] font-semibold pt-2 border-t border-white/5 font-mono">
                  {ex.defaultSets} sets × {ex.defaultReps} reps
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 flex gap-2">
              <button
                onClick={() => handleOpenEdit(ex)}
                className="flex-1 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-white/10 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(ex._id)}
                className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                title="Delete Exercise"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && editingExercise && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingExercise._id ? 'Edit Exercise' : 'Create Exercise'}
          maxWidth="xl"
        >
          <form onSubmit={handleSave} className="space-y-3 -m-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Exercise Name</label>
                <input
                  type="text"
                  required
                  value={editingExercise.name}
                  onChange={(e) => setEditingExercise({ ...editingExercise, name: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Muscle Group</label>
                <select
                  value={editingExercise.muscleGroup}
                  onChange={(e) => setEditingExercise({ ...editingExercise, muscleGroup: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
                >
                  <option value="Chest">Chest</option>
                  <option value="Back">Back</option>
                  <option value="Legs">Legs</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Arms">Arms</option>
                  <option value="Core">Core</option>
                  <option value="Cardio">Cardio</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Equipment</label>
                <input
                  type="text"
                  required
                  value={editingExercise.equipment}
                  onChange={(e) => setEditingExercise({ ...editingExercise, equipment: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={editingExercise.image}
                  onChange={(e) => setEditingExercise({ ...editingExercise, image: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Default Sets</label>
                <input
                  type="number"
                  value={editingExercise.defaultSets}
                  onChange={(e) => setEditingExercise({ ...editingExercise, defaultSets: Number(e.target.value) })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Default Reps</label>
                <input
                  type="number"
                  value={editingExercise.defaultReps}
                  onChange={(e) => setEditingExercise({ ...editingExercise, defaultReps: Number(e.target.value) })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D9FF00]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/60 block mb-1">Description</label>
              <textarea
                rows={2}
                required
                value={editingExercise.description}
                onChange={(e) => setEditingExercise({ ...editingExercise, description: e.target.value })}
                className="w-full bg-[#181818] border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-[#D9FF00] resize-none"
              />
            </div>

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
                Save Exercise
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
