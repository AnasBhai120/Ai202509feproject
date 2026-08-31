import React from 'react';
import {
  LayoutDashboard,
  Flame,
  Dumbbell,
  Utensils,
  TrendingUp,
  User,
  Heart,
  History,
} from 'lucide-react';
import { UserTab } from './Navbar';

interface BottomNavProps {
  activeTab: UserTab;
  onNavigate: (tab: UserTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate }) => {
  const tabs: Array<{ id: UserTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workouts', label: 'Workouts', icon: Flame },
    { id: 'exercises', label: 'Exercises', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'progress', label: 'Analytics', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-lg border-t border-white/10 px-2 py-2 pb-safe lg:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
                isActive ? 'text-[#D9FF00]' : 'text-white/40 hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute -top-2 w-6 h-1 rounded-full bg-[#D9FF00] shadow-[0_0_8px_rgba(217,255,0,0.8)]" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span className={`text-[10px] mt-1 tracking-tight font-medium ${isActive ? 'font-bold text-[#D9FF00]' : 'text-white/40'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
