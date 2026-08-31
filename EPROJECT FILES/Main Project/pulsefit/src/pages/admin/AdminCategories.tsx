import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Category } from '../../types';
import { useFitness } from '../../context/FitnessContext';
import { Modal } from '../../components/common/Modal';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { showToast } = useFitness();

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeType, setActiveType] = useState<'workout' | 'muscle' | 'equipment' | 'meal'>('workout');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, [activeType]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.categories.getAll(activeType);
      setCategories(res.data.categories);
    } catch (err: any) {
      showToast(err.message || 'Failed to load categories', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.categories.delete(id);
      showToast('Category deleted', 'success');
      loadCategories();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.categories.update(editingId, { name, description, type: activeType });
        showToast('Category updated', 'success');
      } else {
        await api.categories.create({ name, description, type: activeType });
        showToast('New category created', 'success');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Taxonomy & Category Manager</h1>
          <p className="text-xs text-white/40 mt-0.5">
            Configure workout categories, targeted muscle groups, gear/equipment types, and meal tags.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(217,255,0,0.3)] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Category Type Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveType('workout')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeType === 'workout'
              ? 'bg-[#D9FF00] text-black shadow-[0_0_12px_rgba(217,255,0,0.25)] font-extrabold'
              : 'bg-[#111111] border border-white/5 text-white/40 hover:text-white'
          }`}
        >
          Workout Types
        </button>

        <button
          onClick={() => setActiveType('muscle')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeType === 'muscle'
              ? 'bg-[#D9FF00] text-black shadow-[0_0_12px_rgba(217,255,0,0.25)] font-extrabold'
              : 'bg-[#111111] border border-white/5 text-white/40 hover:text-white'
          }`}
        >
          Muscle Groups
        </button>

        <button
          onClick={() => setActiveType('equipment')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeType === 'equipment'
              ? 'bg-[#D9FF00] text-black shadow-[0_0_12px_rgba(217,255,0,0.25)] font-extrabold'
              : 'bg-[#111111] border border-white/5 text-white/40 hover:text-white'
          }`}
        >
          Equipment & Gear
        </button>

        <button
          onClick={() => setActiveType('meal')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeType === 'meal'
              ? 'bg-[#D9FF00] text-black shadow-[0_0_12px_rgba(217,255,0,0.25)] font-extrabold'
              : 'bg-[#111111] border border-white/5 text-white/40 hover:text-white'
          }`}
        >
          Meal Categories
        </button>
      </div>

      {/* Category items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="p-4 rounded-3xl bg-[#111111] border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#D9FF00]" />
                <h4 className="text-sm font-bold text-white">{cat.name}</h4>
              </div>
              {cat.description && <p className="text-xs text-white/40 mt-1">{cat.description}</p>}
            </div>

            <div className="flex items-center gap-1.5 ml-3">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(cat._id)}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Edit Category' : `Create ${activeType} Category`}
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-3 -m-1">
            <div>
              <label className="text-xs font-bold text-white/60 block mb-1">Category Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Strength Training, Calisthenics..."
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/60 block mb-1">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short descriptive tag"
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
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
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
