import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFitness } from '../../context/FitnessContext';
import {
  Flame,
  Shield,
  LayoutDashboard,
  Bell,
  Calculator,
  User as UserIcon,
  LogOut,
  Sparkles,
  Zap,
} from 'lucide-react';

export type UserTab = 'home' | 'workouts' | 'exercises' | 'nutrition' | 'progress' | 'history' | 'favorites' | 'profile';

interface NavbarProps {
  activeTab: UserTab;
  onNavigate: (tab: UserTab) => void;
  onSwitchToAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  onSwitchToAdmin,
}) => {
  const { user, isAuthenticated, isAdmin, logout, quickDemoLogin } = useAuth();
  const {
    unreadNotificationsCount,
    setIsNotificationModalOpen,
    setIsCalculatorModalOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useFitness();

  const navLinks: { id: UserTab; label: string }[] = [
    { id: 'home', label: 'Dashboard' },
    { id: 'workouts', label: 'Workouts' },
    { id: 'exercises', label: 'Exercises' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'progress', label: 'Analytics' },
    { id: 'history', label: 'History' },
    { id: 'favorites', label: 'Saved' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo - Sophisticated Dark Identity */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            
           <img src="logo1.png" alt="" />
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold tracking-tight text-white">
                PULSE<span className="text-[#D9FF00]">FIT</span>
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/60 ml-1.5 hidden sm:inline">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Center Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#111111] p-1 rounded-full border border-white/5">
          {navLinks.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#D9FF00] text-black font-bold shadow-[0_0_10px_rgba(217,255,0,0.3)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Tools & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-[#111111] border border-white/10 px-2 py-1 rounded-full text-xs">
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium px-1">Role:</span>
            <button
              onClick={() => quickDemoLogin('user')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                user?.role === 'user'
                  ? 'bg-white/15 text-white'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Athlete
            </button>
            <button
              onClick={() => {
                quickDemoLogin('admin');
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                user?.role === 'admin'
                  ? 'bg-[#D9FF00]/20 text-[#D9FF00] border border-[#D9FF00]/30'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Admin Mode Switcher if Admin */}
          {isAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D9FF00]/10 hover:bg-[#D9FF00]/20 border border-[#D9FF00]/30 text-[#D9FF00] text-xs font-bold transition-all"
              title="Enter Admin Management Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin Center</span>
            </button>
          )}

          {/* Fitness Calculators trigger */}
          <button
            onClick={() => setIsCalculatorModalOpen(true)}
            className="p-2 rounded-full bg-[#111111] border border-white/10 text-white/70 hover:text-[#D9FF00] hover:border-[#D9FF00]/40 transition-colors"
            title="Fitness & BMI Calculators"
          >
            <Calculator className="w-4 h-4" />
          </button>

          {/* Notifications trigger */}
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className="relative p-2 rounded-full bg-[#111111] border border-white/10 text-white/70 hover:text-[#D9FF00] hover:border-[#D9FF00]/40 transition-colors"
            title="Notifications & Announcements"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D9FF00] text-black font-black text-[10px] flex items-center justify-center shadow-[0_0_8px_rgba(217,255,0,0.6)]">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile Pill / Auth Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 bg-[#111111] border border-white/10 pl-1.5 pr-2.5 py-1 rounded-full">
              <img
                src={
                  user.profileImage ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-white/20"
              />
              <div className="flex flex-col text-left hidden md:flex">
                <span className="text-xs font-bold text-white leading-tight truncate max-w-[90px]">{user.name}</span>
                <span className="text-[10px] text-[#D9FF00] capitalize">{user.role}</span>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="p-1 text-white/40 hover:text-red-400 transition-colors ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#D9FF00] text-black text-xs font-bold hover:bg-[#D9FF00]/90 transition-colors shadow-[0_0_12px_rgba(217,255,0,0.3)]"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
