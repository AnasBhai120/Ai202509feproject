import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFitness } from '../../context/FitnessContext';
import { api } from '../../services/api';
import {
  User,
  Shield,
  KeyRound,
  LogOut,
  CheckCircle2,
  Save,
  Flame,
  Activity,
  Heart,
  History,
  Database,
  ArrowRight,
} from 'lucide-react';

interface ProfilePageProps {
  onNavigateTab: (tab: any) => void;
  onSwitchToAdmin: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigateTab, onSwitchToAdmin }) => {
  const { user, updateUser, logout, isAdmin } = useAuth();
  const { showToast } = useFitness();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || 25);
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [height, setHeight] = useState(user?.height || 175);
  const [weight, setWeight] = useState(user?.weight || 72);
  const [fitnessGoal, setFitnessGoal] = useState(user?.fitnessGoal || 'Muscle Gain');
  const [activityLevel, setActivityLevel] = useState(user?.activityLevel || 'Moderately Active');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateUser({
        name,
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        fitnessGoal: fitnessGoal as any,
        activityLevel: activityLevel as any,
      });
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.users.changePassword({ currentPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setIsChangingPass(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        <img
          src={
            user?.profileImage ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
          }
          alt={user?.name}
          className="w-20 h-20 rounded-full object-cover border-2 border-[#D9FF00] shadow-[0_0_15px_rgba(217,255,0,0.25)]"
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{user?.name}</h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#D9FF00] text-black tracking-wider">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-white/40 mt-1">{user?.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-white/60 mt-2">
            <span>🎯 {user?.fitnessGoal}</span>
            <span>•</span>
            <span>⚡ {user?.activityLevel}</span>
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 shrink-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors border border-white/10"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="bg-[#111111] border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-xs font-bold text-white uppercase tracking-widest">Update Athlete Bio</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-white/60 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/60 block mb-1">Gender & Age</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-2 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-2 py-2 text-xs text-white font-bold text-center focus:outline-none focus:border-[#D9FF00]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/60 block mb-1">Height (cm) & Weight (kg)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-2 py-2 text-xs text-white font-bold text-center focus:outline-none focus:border-[#D9FF00]"
                />
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-2 py-2 text-xs text-white font-bold text-center focus:outline-none focus:border-[#D9FF00]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/60 block mb-1">Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value as any)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
              >
                <option value="Muscle Gain">Muscle Gain / Hypertrophy</option>
                <option value="Weight Loss">Weight Loss / Fat Burn</option>
                <option value="Strength">Strength & Power</option>
                <option value="Endurance">Endurance & Cardio</option>
                <option value="General Fitness">General Health & Fitness</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-white/60 block mb-1">Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as any)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
            >
              <option value="Sedentary">Sedentary (Office desk / minimal activity)</option>
              <option value="Lightly Active">Lightly Active (1-2 days exercise)</option>
              <option value="Moderately Active">Moderately Active (3-5 days exercise)</option>
              <option value="Very Active">Very Active (6-7 days intense workouts)</option>
              <option value="Extra Active">Extra Active (Athlete / Heavy labor)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-full bg-white/5 text-xs text-white/60 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-full bg-[#D9FF00] text-black text-xs font-black flex items-center gap-1.5 hover:bg-[#D9FF00]/90 transition-colors shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      ) : null}

      {/* Quick Navigation Rows */}
      <div className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
        <button
          onClick={() => onNavigateTab('history')}
          className="w-full p-5 flex items-center justify-between hover:bg-white/5 text-left transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-white/5 text-[#D9FF00] border border-white/10 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">Completed Workout Sessions</span>
          </div>
          <ArrowRight className="w-4 h-4 text-white/30" />
        </button>

        <button
          onClick={() => onNavigateTab('favorites')}
          className="w-full p-5 flex items-center justify-between hover:bg-white/5 text-left transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-white/5 text-red-400 border border-white/10 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">Bookmarked Favorites</span>
          </div>
          <ArrowRight className="w-4 h-4 text-white/30" />
        </button>

        {isAdmin && (
          <button
            onClick={onSwitchToAdmin}
            className="w-full p-5 flex items-center justify-between hover:bg-[#D9FF00]/10 text-left transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-[#D9FF00]/10 text-[#D9FF00] border border-[#D9FF00]/30 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#D9FF00]">Open Admin Management Workspace</span>
            </div>
            <span className="text-xs text-[#D9FF00] font-bold">Admin Portal →</span>
          </button>
        )}

        <button
          onClick={() => setIsChangingPass(!isChangingPass)}
          className="w-full p-5 flex items-center justify-between hover:bg-white/5 text-left transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-white/5 text-cyan-400 border border-white/10 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">Change Account Password</span>
          </div>
          <span className="text-xs text-white/40">{isChangingPass ? 'Close' : 'Update'}</span>
        </button>
      </div>

      {/* Change Password Form */}
      {isChangingPass && (
        <form onSubmit={handleChangePassword} className="bg-[#111111] border border-white/10 p-5 rounded-3xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Change Password</h3>
          <div>
            <label className="text-[11px] text-white/40 block mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
            />
          </div>
          <div>
            <label className="text-[11px] text-white/40 block mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-full bg-[#D9FF00] text-black text-xs font-black"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}

      {/* System info & Logout */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#111111] border border-white/5 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#D9FF00]" />
            <span>MERN Backend: Active (mongodb://127.0.0.1:27017/fitness)</span>
          </div>
          <span className="text-[10px] text-[#D9FF00] font-mono">v1.0.0</span>
        </div>

        <button
          onClick={logout}
          className="w-full py-3.5 rounded-full bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of PulseFit</span>
        </button>
      </div>
    </div>
  );
};
