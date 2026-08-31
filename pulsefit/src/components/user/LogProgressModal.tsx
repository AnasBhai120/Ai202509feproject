import React, { useState } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { Scale, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

interface LogProgressModalProps {
  onSuccess?: () => void;
}

export const LogProgressModal: React.FC<LogProgressModalProps> = ({ onSuccess }) => {
  const { isProgressModalOpen, setIsProgressModalOpen, showToast } = useFitness();
  const { user } = useAuth();

  const [weightKg, setWeightKg] = useState<number>(user?.weight || 72);
  const [chestCm, setChestCm] = useState<string>('');
  const [waistCm, setWaistCm] = useState<string>('');
  const [armsCm, setArmsCm] = useState<string>('');
  const [hipsCm, setHipsCm] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Live BMI calculation
  const heightM = (user?.height || 175) / 100;
  const currentBmi = heightM > 0 ? Number((weightKg / (heightM * heightM)).toFixed(1)) : 22.5;

  const getBmiBadge = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
    if (bmi < 25) return { label: 'Optimal / Healthy', color: 'text-[#D9FF00] bg-[#D9FF00]/10 border-[#D9FF00]/20' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'Obese', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
  };

  const bmiInfo = getBmiBadge(currentBmi);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.progress.add({
        weightKg: Number(weightKg),
        heightCm: user?.height || 175,
        chestCm: chestCm ? Number(chestCm) : undefined,
        waistCm: waistCm ? Number(waistCm) : undefined,
        armsCm: armsCm ? Number(armsCm) : undefined,
        hipsCm: hipsCm ? Number(hipsCm) : undefined,
        bodyFatPercentage: bodyFat ? Number(bodyFat) : undefined,
        notes: notes.trim(),
      });

      showToast('Progress entry recorded successfully!', 'success');
      setIsProgressModalOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Failed to save progress', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isProgressModalOpen}
      onClose={() => setIsProgressModalOpen(false)}
      title="Log Body Metrics & Progress"
      subtitle="Track your weight, body measurements, and BMI evolution"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Live Weight and BMI Card */}
        <div className="bg-[#181818] border border-white/5 p-4 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Logged Weight</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-white tracking-tight">{weightKg}</span>
              <span className="text-xs text-white/40 font-bold">kg</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Computed BMI</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-[#D9FF00] font-mono">{currentBmi}</span>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${bmiInfo.color}`}>
                {bmiInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Weight Slider / Input */}
        <div>
          <label className="text-xs font-bold text-white/60 block mb-1.5">Weight Calibration (kg)</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="40"
              max="160"
              step="0.5"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value))}
              className="flex-1 accent-[#D9FF00] h-2 bg-[#181818] rounded-lg cursor-pointer"
            />
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
              className="w-20 bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-center text-xs font-bold text-white focus:outline-none focus:border-[#D9FF00]"
            />
          </div>
        </div>

        {/* Optional Circumferences */}
        <div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">
            Circumference Metrics (Optional cm)
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-white/40 block mb-1">Chest (cm)</label>
              <input
                type="number"
                placeholder="e.g. 98"
                value={chestCm}
                onChange={(e) => setChestCm(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D9FF00]"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1">Waist (cm)</label>
              <input
                type="number"
                placeholder="e.g. 82"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D9FF00]"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1">Arms / Biceps (cm)</label>
              <input
                type="number"
                placeholder="e.g. 36"
                value={armsCm}
                onChange={(e) => setArmsCm(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D9FF00]"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 block mb-1">Body Fat % (Optional)</label>
              <input
                type="number"
                placeholder="e.g. 15.5"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D9FF00]"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-bold text-white/60 block mb-1">Session Notes & Reflections</label>
          <textarea
            rows={2}
            placeholder="High vitality, hit personal best on squats, sustained clean caloric intake..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#181818] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D9FF00] resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,255,0,0.3)] transition-all disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>{isSubmitting ? 'Saving Entry...' : 'Save Biometric Entry'}</span>
        </button>
      </form>
    </Modal>
  );
};
