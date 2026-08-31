import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFitness } from '../../context/FitnessContext';
import { api } from '../../services/api';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './AdminUsers';
import { AdminWorkouts } from './AdminWorkouts';
import { AdminExercises } from './AdminExercises';
import { AdminMeals } from './AdminMeals';
import { AdminCategories } from './AdminCategories';
import { AdminNotifications } from './AdminNotifications';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Target,
  Utensils,
  Layers,
  Bell,
  ArrowLeft,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface AdminLayoutProps {
  onSwitchToUser: () => void;
}

type AdminTab = 'dashboard' | 'users' | 'workouts' | 'exercises' | 'meals' | 'categories' | 'notifications';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onSwitchToUser }) => {
  const { user } = useAuth();
  const { showToast } = useFitness();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    if (!window.confirm('Reset and re-seed database with default workouts, exercises, and meals?')) return;
    setIsSeeding(true);
    try {
      await api.seed();
      showToast('Database successfully re-seeded with demo records!', 'success');
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || 'Seed failed', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Athletes & Users', icon: Users },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'exercises', label: 'Exercises', icon: Target },
    { id: 'meals', label: 'Nutrition & Meals', icon: Utensils },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'notifications', label: 'Broadcasts', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#D9FF00] selection:text-black">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchToUser}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#D9FF00]" />
              <span>Back to Athlete App</span>
            </button>

            <div className="flex items-center gap-2.5 border-l border-white/10 pl-3.5">
              <div className="w-7 h-7 rounded-lg bg-[#D9FF00] flex items-center justify-center font-black text-black text-xs shadow-[0_0_10px_rgba(217,255,0,0.3)]">
                <Zap className="w-4 h-4 fill-black" />
              </div>
              <div>
                <span className="text-xs font-black text-white tracking-tight block">PulseFit Portal</span>
                <span className="text-[9px] text-[#D9FF00] font-mono uppercase tracking-wider">Admin Console</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Database sync status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] border border-white/5 text-[11px] text-white/50 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#D9FF00] shadow-[0_0_6px_#D9FF00]" />
              <span>DB Connected</span>
            </div>

            {/* Re-seed Button */}
            <button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-white/80 border border-white/10 transition-colors"
              title="Reset and re-seed default demo data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset & Seed DB</span>
            </button>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <img
                src={
                  user?.profileImage ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border border-white/10"
              />
              <span className="text-xs font-bold text-white hidden md:inline">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row gap-6 p-4 sm:p-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-56 shrink-0">
          <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none bg-[#0A0A0A] border border-white/5 p-2 rounded-3xl sticky md:top-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all text-left ${
                    isActive
                      ? 'bg-[#D9FF00] text-black shadow-[0_0_15px_rgba(217,255,0,0.25)] font-extrabold'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Admin View */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'workouts' && <AdminWorkouts />}
          {activeTab === 'exercises' && <AdminExercises />}
          {activeTab === 'meals' && <AdminMeals />}
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'notifications' && <AdminNotifications />}
        </main>
      </div>
    </div>
  );
};
