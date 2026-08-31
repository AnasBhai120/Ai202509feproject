import React, { useState } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { LogIn, UserPlus, KeyRound, Sparkles, CheckCircle2, Shield } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalMode, setAuthModalMode, showToast } = useFitness();
  const { login, register, quickDemoLogin } = useAuth();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [fitnessGoal, setFitnessGoal] = useState<'Weight Loss' | 'Muscle Gain' | 'Strength' | 'Endurance' | 'General Fitness'>('Muscle Gain');
  const [activityLevel, setActivityLevel] = useState<'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extra Active'>('Moderately Active');

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetStep, setIsResetStep] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      showToast('Logged in successfully!', 'success');
      setIsAuthModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({
        name,
        email: regEmail,
        password: regPassword,
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        fitnessGoal,
        activityLevel,
      });
      showToast('Account registered successfully! Welcome to PulseFit!', 'success');
      setIsAuthModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.auth.forgotPassword(forgotEmail);
      showToast('Reset code generated: ' + (res.resetToken || 'fitness-reset-2025'), 'success');
      setResetToken(res.resetToken || 'fitness-reset-2025');
      setIsResetStep(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to request reset', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.auth.resetPassword({
        email: forgotEmail,
        resetToken,
        newPassword,
      });
      showToast('Password reset successfully! Please login with your new password.', 'success');
      setIsResetStep(false);
      setAuthModalMode('login');
      setEmail(forgotEmail);
      setPassword(newPassword);
    } catch (err: any) {
      showToast(err.message || 'Password reset failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      maxWidth={authModalMode === 'register' ? 'xl' : 'md'}
    >
      <div className="space-y-4 -m-1">
        {/* Auth Mode Toggle */}
        <div className="flex items-center justify-center gap-2 pb-2 border-b border-white/5">
          <button
            onClick={() => setAuthModalMode('login')}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              authModalMode === 'login'
                ? 'bg-[#D9FF00] text-black font-bold shadow-[0_0_10px_rgba(217,255,0,0.3)]'
                : 'text-white/40 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthModalMode('register')}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              authModalMode === 'register'
                ? 'bg-[#D9FF00] text-black font-bold shadow-[0_0_10px_rgba(217,255,0,0.3)]'
                : 'text-white/40 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Pre-sets */}
        <div className="bg-[#181818] border border-white/5 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D9FF00]" />
            <span className="text-xs text-white/70 font-semibold">Quick Test Mode:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                quickDemoLogin('user');
                setIsAuthModalOpen(false);
              }}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors border border-white/10"
            >
              Demo User
            </button>
            <button
              onClick={() => {
                quickDemoLogin('admin');
                setIsAuthModalOpen(false);
              }}
              className="px-3 py-1 rounded-full bg-[#D9FF00]/10 text-[#D9FF00] border border-[#D9FF00]/30 hover:bg-[#D9FF00]/20 text-xs font-bold transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Mode 1: Sign In */}
        {authModalMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white/60 block mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="user@fitness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D9FF00]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-white/60">Password</label>
                <button
                  type="button"
                  onClick={() => setAuthModalMode('forgot')}
                  className="text-[11px] text-[#D9FF00] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D9FF00]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,255,0,0.3)] transition-all disabled:opacity-50 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Signing In...' : 'Sign In to PulseFit'}</span>
            </button>
          </form>
        )}

        {/* Mode 2: Register */}
        {authModalMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@fitness.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D9FF00]"
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
                    placeholder="Age"
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
                    placeholder="Height (cm)"
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-2 py-2 text-xs text-white font-bold text-center focus:outline-none focus:border-[#D9FF00]"
                  />
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    placeholder="Weight (kg)"
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-2 py-2 text-xs text-white font-bold text-center focus:outline-none focus:border-[#D9FF00]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Primary Fitness Goal</label>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,255,0,0.3)] transition-all disabled:opacity-50 mt-3"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating Account...' : 'Complete Registration & Start'}</span>
            </button>
          </form>
        )}

        {/* Mode 3: Forgot / Reset Password */}
        {authModalMode === 'forgot' && (
          <div className="space-y-3">
            {!isResetStep ? (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-xs text-white/40 leading-relaxed">
                  Enter your registered account email. We will generate a secure reset token.
                </p>
                <div>
                  <label className="text-xs font-bold text-white/60 block mb-1">Account Email</label>
                  <input
                    type="email"
                    required
                    placeholder="user@fitness.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-[#D9FF00] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Send Reset Token</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-white/60 block mb-1">Reset Token</label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#D9FF00] font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white/60 block mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-[#D9FF00] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </form>
            )}

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="text-xs text-white/40 hover:text-white"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
