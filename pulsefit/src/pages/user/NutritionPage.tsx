import React, { useState, useEffect } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { api } from '../../services/api';
import { Meal } from '../../types';
import {
  Utensils,
  Flame,
  Droplets,
  Plus,
  Minus,
  CheckCircle2,
  Heart,
  Clock,
  Sparkles,
  PlusCircle,
  ChevronRight,
} from 'lucide-react';

export const NutritionPage: React.FC = () => {
  const { dailySummary, refreshDailyNutrition, logWater, logMealToDaily, setSelectedMeal, isFavorite, toggleFavorite } = useFitness();

  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'>('All');
  const [isLoading, setIsLoading] = useState(true);

  // Quick custom meal log inputs
  const [isCustomMealOpen, setIsCustomMealOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'>('Lunch');
  const [customCalories, setCustomCalories] = useState<number>(450);
  const [customProtein, setCustomProtein] = useState<number>(30);
  const [customCarbs, setCustomCarbs] = useState<number>(40);
  const [customFat, setCustomFat] = useState<number>(15);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const res = await api.meals.getAll();
      setRecipes(res.data.meals);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogCustomMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName) return;

    await api.meals.logDailyMeal({
      name: customName.trim(),
      category: customCategory,
      calories: Number(customCalories),
      protein: Number(customProtein),
      carbs: Number(customCarbs),
      fat: Number(customFat),
    });

    setCustomName('');
    setIsCustomMealOpen(false);
    refreshDailyNutrition();
  };

  const totals = dailySummary?.totals || {
    calories: 0,
    calorieTarget: 2200,
    calorieRemaining: 2200,
    protein: 0,
    carbs: 0,
    fat: 0,
    waterGlasses: 0,
    waterLiters: 0,
  };

  const loggedMeals = dailySummary?.log?.meals || [];

  const filteredRecipes = recipes.filter((r) => {
    return selectedCategory === 'All' || r.category === selectedCategory;
  });

  const proteinGoal = 140;
  const carbsGoal = 220;
  const fatGoal = 65;

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Nutrition & <span className="font-bold text-[#D9FF00]">Macronutrients</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/40 mt-1">
            Fuel your performance with calibrated daily macros, hydration, and clean meal plans.
          </p>
        </div>

        <button
          onClick={() => setIsCustomMealOpen(!isCustomMealOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black text-xs font-black shadow-[0_0_12px_rgba(217,255,0,0.3)] transition-all"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>QUICK LOG</span>
        </button>
      </div>

      {/* Custom Meal Form Accordion */}
      {isCustomMealOpen && (
        <form onSubmit={handleLogCustomMeal} className="bg-[#111111] border border-white/10 p-5 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Log Custom Food or Meal</h3>
            <span className="text-[10px] text-white/40">Macro breakdown</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-white/40 block mb-1">Meal / Food Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Grilled Chicken & Quinoa Bowl"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
              />
            </div>
            <div>
              <label className="text-[11px] text-white/40 block mb-1">Category</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as any)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-white/40 block mb-1 font-bold">Calories (kcal)</label>
              <input
                type="number"
                value={customCalories}
                onChange={(e) => setCustomCalories(Number(e.target.value))}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#D9FF00] block mb-1 font-bold">Protein (g)</label>
              <input
                type="number"
                value={customProtein}
                onChange={(e) => setCustomProtein(Number(e.target.value))}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] text-cyan-400 block mb-1 font-bold">Carbs (g)</label>
              <input
                type="number"
                value={customCarbs}
                onChange={(e) => setCustomCarbs(Number(e.target.value))}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] text-purple-400 block mb-1 font-bold">Fat (g)</label>
              <input
                type="number"
                value={customFat}
                onChange={(e) => setCustomFat(Number(e.target.value))}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCustomMealOpen(false)}
              className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs text-white/60 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#D9FF00] text-black text-xs font-black hover:bg-[#D9FF00]/90 transition-colors shadow-md"
            >
              Add to Daily Log
            </button>
          </div>
        </form>
      )}

      {/* Main Daily Nutrition Card */}
      <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl space-y-5">
        {/* Calories Progress Top */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Daily Caloric Target</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold text-white tracking-tight">{totals.calories}</span>
              <span className="text-xs text-white/40 font-medium">/ {totals.calorieTarget} kcal</span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Remaining Budget</span>
            <span className="text-2xl font-bold text-[#D9FF00] font-mono tracking-tight">
              {Math.max(0, totals.calorieTarget - totals.calories)} kcal
            </span>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D9FF00] rounded-full shadow-[0_0_10px_rgba(217,255,0,0.5)] transition-all duration-500"
            style={{ width: `${Math.min(100, (totals.calories / totals.calorieTarget) * 100)}%` }}
          />
        </div>

        {/* 3 Macro Target Progress Bars */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {/* Protein */}
          <div className="bg-[#181818] border border-white/5 p-4 rounded-2xl">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-[#D9FF00]">Protein</span>
              <span className="text-white text-xs">{totals.protein}g / {proteinGoal}g</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D9FF00] rounded-full"
                style={{ width: `${Math.min(100, (totals.protein / proteinGoal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-[#181818] border border-white/5 p-4 rounded-2xl">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-cyan-400">Carbs</span>
              <span className="text-white text-xs">{totals.carbs}g / {carbsGoal}g</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${Math.min(100, (totals.carbs / carbsGoal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="bg-[#181818] border border-white/5 p-4 rounded-2xl">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-purple-400">Fats</span>
              <span className="text-white text-xs">{totals.fat}g / {fatGoal}g</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-400 rounded-full"
                style={{ width: `${Math.min(100, (totals.fat / fatGoal) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hydration Interactive Widget */}
      <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Droplets className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Daily Hydration Log</h3>
            <p className="text-xs text-white/40">
              {totals.waterGlasses} of 8 glasses logged ({totals.waterLiters} Liters)
            </p>
          </div>
        </div>

        {/* 8 Glasses visual row + quick buttons */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => logWater(undefined, idx + 1)}
                className={`w-5 h-8 rounded-lg border transition-all ${
                  idx < totals.waterGlasses
                    ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                    : 'bg-white/5 border-white/10 hover:border-cyan-400'
                }`}
                title={`Glass ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => logWater(-1)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => logWater(1)}
              className="p-2 rounded-full bg-cyan-400 text-black font-extrabold text-xs hover:bg-cyan-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Meals Logged Today List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">
          Today's Food Journal ({loggedMeals.length} items)
        </h2>

        {loggedMeals.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#111111] border border-white/5 text-center text-white/40 text-xs">
            No meals logged for today yet. Pick a recipe below or tap "Quick Log"!
          </div>
        ) : (
          <div className="space-y-2">
            {loggedMeals.map((m: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#111111] border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 text-[#D9FF00] border border-white/10 flex items-center justify-center text-xs font-bold">
                    {m.category?.[0] || 'M'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{m.name}</h4>
                    <span className="text-[11px] text-white/40">{m.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-[#D9FF00] font-mono">{m.calories} kcal</span>
                  <div className="text-[10px] text-white/40">
                    {m.protein || 0}P • {m.carbs || 0}C • {m.fat || 0}F
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Directory */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">
            Recipe Catalog & Meal Inspiration
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((cat: any) => (
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

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredRecipes.map((meal) => {
            const isFav = isFavorite('meal', meal._id);

            return (
              <div
                key={meal._id}
                onClick={() => setSelectedMeal(meal)}
                className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:border-white/20 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full bg-[#1A1A1A] overflow-hidden">
                    <img
                      src={meal.image}
                      alt={meal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite('meal', meal._id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/60 hover:text-red-400 border border-white/10 transition-colors"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-red-500 fill-red-500' : ''}`} />
                    </button>

                    <div className="absolute bottom-2.5 left-3">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#D9FF00] text-black uppercase tracking-wider">
                        {meal.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#D9FF00] transition-colors">
                      {meal.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                      <span className="text-white font-bold">{meal.calories} kcal</span>
                      <span>•</span>
                      <span className="text-[#D9FF00] font-semibold">{meal.protein}g protein</span>
                      <span>•</span>
                      <span>⏱️ {meal.prepTimeMinutes}m</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      logMealToDaily(meal);
                    }}
                    className="w-full py-2.5 rounded-full bg-white/5 hover:bg-[#D9FF00] hover:text-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log (+{meal.calories} kcal)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
