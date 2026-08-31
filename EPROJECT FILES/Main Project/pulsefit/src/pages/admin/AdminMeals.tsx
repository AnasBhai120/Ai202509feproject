import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Meal } from '../../types';
import { useFitness } from '../../context/FitnessContext';
import { Modal } from '../../components/common/Modal';
import {
  Utensils,
  Plus,
  Edit2,
  Trash2,
  Search,
} from 'lucide-react';

export const AdminMeals: React.FC = () => {
  const { showToast } = useFitness();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Partial<Meal> | null>(null);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    setIsLoading(true);
    try {
      const res = await api.meals.getAll();
      setMeals(res.data.meals);
    } catch (err: any) {
      showToast(err.message || 'Failed to load meals', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingMeal({
      name: '',
      category: 'Lunch',
      calories: 450,
      protein: 35,
      carbs: 45,
      fat: 12,
      prepTimeMinutes: 20,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      ingredients: ['150g Grilled Chicken Breast', '1 cup Brown Rice', '1 cup Steamed Broccoli'],
      instructions: ['Season the chicken with herbs and olive oil.', 'Grill for 6-8 minutes per side.', 'Serve with warm brown rice and vegetables.'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (meal: Meal) => {
    setEditingMeal({ ...meal });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.meals.delete(id);
      showToast('Meal recipe deleted', 'success');
      loadMeals();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeal) return;

    try {
      if (editingMeal._id) {
        await api.meals.update(editingMeal._id, editingMeal);
        showToast('Meal updated', 'success');
      } else {
        await api.meals.create(editingMeal);
        showToast('New meal recipe created', 'success');
      }
      setIsModalOpen(false);
      loadMeals();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  const filtered = meals.filter((m) => {
    const matchCategory = categoryFilter === 'All' || m.category === categoryFilter;
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Nutrition & Recipes Catalog</h1>
          <p className="text-xs text-white/40 mt-0.5">
            Manage healthy meal recipes, macro breakdowns (Protein, Carbs, Fat), and ingredient guidelines.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(217,255,0,0.3)] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Recipe</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search meal recipes..."
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
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snacks">Snacks</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((meal) => (
          <div
            key={meal._id}
            className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/9] w-full bg-[#1A1A1A]">
                <img src={meal.image} alt={meal.name} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#D9FF00] text-black uppercase">
                    {meal.category}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <h3 className="text-sm font-bold text-white">{meal.name}</h3>
                <div className="flex items-center gap-2 text-xs text-white/60 font-mono">
                  <span className="text-[#D9FF00] font-bold">{meal.calories} kcal</span>
                  <span>•</span>
                  <span>⏱️ {meal.prepTimeMinutes}m</span>
                </div>
                <div className="text-[11px] text-white/40 pt-2 border-t border-white/5 font-mono">
                  {meal.protein}g Protein • {meal.carbs}g Carbs • {meal.fat}g Fat
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 flex gap-2">
              <button
                onClick={() => handleOpenEdit(meal)}
                className="flex-1 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-white/10 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(meal._id)}
                className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                title="Delete Recipe"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && editingMeal && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingMeal._id ? 'Edit Recipe' : 'Create Recipe'}
          maxWidth="xl"
        >
          <form onSubmit={handleSave} className="space-y-3 -m-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Recipe Name</label>
                <input
                  type="text"
                  required
                  value={editingMeal.name}
                  onChange={(e) => setEditingMeal({ ...editingMeal, name: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Category</label>
                <select
                  value={editingMeal.category}
                  onChange={(e) => setEditingMeal({ ...editingMeal, category: e.target.value as any })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snacks">Snacks</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={editingMeal.image}
                  onChange={(e) => setEditingMeal({ ...editingMeal, image: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Prep Time (Mins)</label>
                <input
                  type="number"
                  value={editingMeal.prepTimeMinutes}
                  onChange={(e) => setEditingMeal({ ...editingMeal, prepTimeMinutes: Number(e.target.value) })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  value={editingMeal.calories}
                  onChange={(e) => setEditingMeal({ ...editingMeal, calories: Number(e.target.value) })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={editingMeal.protein}
                  onChange={(e) => setEditingMeal({ ...editingMeal, protein: Number(e.target.value) })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={editingMeal.carbs}
                  onChange={(e) => setEditingMeal({ ...editingMeal, carbs: Number(e.target.value) })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={editingMeal.fat}
                  onChange={(e) => setEditingMeal({ ...editingMeal, fat: Number(e.target.value) })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D9FF00]"
                />
              </div>
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
                Save Recipe
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
