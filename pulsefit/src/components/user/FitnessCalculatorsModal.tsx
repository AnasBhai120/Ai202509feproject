import React, { useState } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Calculator, Flame, Droplets, Target, Activity, HeartPulse } from 'lucide-react';

export const FitnessCalculatorsModal: React.FC = () => {
  const { isCalculatorModalOpen, setIsCalculatorModalOpen } = useFitness();
  const { user } = useAuth();

  const [activeCalc, setActiveCalc] = useState<'bmi' | 'bmr_tdee' | 'ideal_weight' | 'water'>('bmi');

  // Input states
  const [weightKg, setWeightKg] = useState<number>(user?.weight || 74);
  const [heightCm, setHeightCm] = useState<number>(user?.height || 178);
  const [age, setAge] = useState<number>(user?.age || 26);
  const [gender, setGender] = useState<'Male' | 'Female'>(user?.gender === 'Female' ? 'Female' : 'Male');
  const [activity, setActivity] = useState<number>(1.55);

  // BMI Calculation
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? Number((weightKg / (heightM * heightM)).toFixed(1)) : 22.0;

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { name: 'Underweight', color: 'text-cyan-400', desc: 'Slightly below standard weight range.' };
    if (val < 24.9) return { name: 'Optimal / Healthy', color: 'text-[#D9FF00]', desc: 'Within healthy, optimal biometric range.' };
    if (val < 29.9) return { name: 'Overweight', color: 'text-amber-400', desc: 'Higher than optimal weight for height.' };
    return { name: 'Obese', color: 'text-red-400', desc: 'Significantly elevated weight range.' };
  };

  const bmiCat = getBmiCategory(bmi);

  // BMR (Mifflin-St Jeor)
  const bmr = Math.round(
    gender === 'Male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  );

  // TDEE = BMR × Activity Factor
  const tdee = Math.round(bmr * activity);
  const weightLossTarget = tdee - 500;
  const muscleGainTarget = tdee + 350;

  // Ideal Body Weight (Devine Formula)
  const inchesOver5Ft = Math.max(0, (heightCm - 152.4) / 2.54);
  const idealWeight = Math.round(gender === 'Male' ? 50 + 2.3 * inchesOver5Ft : 45.5 + 2.3 * inchesOver5Ft);

  // Daily Water Intake (35ml per kg)
  const waterLiters = Number(((weightKg * 35) / 1000).toFixed(1));
  const waterGlasses = Math.round(waterLiters / 0.25);

  return (
    <Modal
      isOpen={isCalculatorModalOpen}
      onClose={() => setIsCalculatorModalOpen(false)}
      title="Biometric & Performance Calculators"
      subtitle="Interactive tools for BMI, BMR, TDEE, and macro calorie expenditure"
      maxWidth="xl"
    >
      <div className="space-y-4 -m-1">
        {/* Calculator Tabs */}
        <div className="grid grid-cols-4 gap-1.5 bg-[#050505] p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveCalc('bmi')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
              activeCalc === 'bmi' ? 'bg-[#D9FF00] text-black shadow-md' : 'text-white/40 hover:text-white'
            }`}
          >
            BMI Index
          </button>
          <button
            onClick={() => setActiveCalc('bmr_tdee')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
              activeCalc === 'bmr_tdee' ? 'bg-[#D9FF00] text-black shadow-md' : 'text-white/40 hover:text-white'
            }`}
          >
            BMR & TDEE
          </button>
          <button
            onClick={() => setActiveCalc('ideal_weight')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
              activeCalc === 'ideal_weight' ? 'bg-[#D9FF00] text-black shadow-md' : 'text-white/40 hover:text-white'
            }`}
          >
            Ideal Weight
          </button>
          <button
            onClick={() => setActiveCalc('water')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
              activeCalc === 'water' ? 'bg-[#D9FF00] text-black shadow-md' : 'text-white/40 hover:text-white'
            }`}
          >
            Hydration
          </button>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#181818] border border-white/5 p-3.5 rounded-2xl">
          <div>
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full bg-[#111111] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold font-mono focus:border-[#D9FF00] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Height (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full bg-[#111111] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold font-mono focus:border-[#D9FF00] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Age (yrs)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full bg-[#111111] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold font-mono focus:border-[#D9FF00] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full bg-[#111111] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white font-bold focus:border-[#D9FF00] focus:outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {/* Tab 1: BMI Calculator */}
        {activeCalc === 'bmi' && (
          <div className="space-y-4">
            <div className="bg-[#181818] border border-white/5 p-6 rounded-3xl text-center">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Body Mass Index</span>
              <div className="text-4xl sm:text-5xl font-bold text-white my-2 font-mono">{bmi}</div>
              <span className={`text-xs font-black uppercase tracking-wider ${bmiCat.color}`}>{bmiCat.name}</span>
              <p className="text-xs text-white/40 mt-1">{bmiCat.desc}</p>

              {/* Graphical Scale */}
              <div className="mt-5 pt-4 border-t border-white/5">
                <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-[#D9FF00] via-amber-400 to-red-400 relative overflow-hidden" />
                <div className="flex justify-between text-[10px] text-white/40 mt-2 font-mono">
                  <span>&lt;18.5 Under</span>
                  <span>18.5-24.9 Optimal</span>
                  <span>25-29.9 Over</span>
                  <span>30+ Obese</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: BMR & TDEE */}
        {activeCalc === 'bmr_tdee' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-white/60 block mb-1">Physical Activity Multiplier</label>
              <select
                value={activity}
                onChange={(e) => setActivity(Number(e.target.value))}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
              >
                <option value={1.2}>Sedentary (Little or no exercise)</option>
                <option value={1.375}>Lightly Active (Exercise 1-3 times/week)</option>
                <option value={1.55}>Moderately Active (Exercise 3-5 times/week)</option>
                <option value={1.725}>Very Active (Intense training 6-7 times/week)</option>
                <option value={1.9}>Extra Active (Physical job or 2x training/day)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#181818] border border-white/5 p-4 rounded-2xl text-center">
                <Flame className="w-4 h-4 text-[#D9FF00] mx-auto mb-1" />
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Basal Metabolic Rate</span>
                <span className="text-xl font-bold text-white font-mono mt-1 block">{bmr}</span>
                <span className="text-[10px] text-white/40 block">kcal at rest</span>
              </div>

              <div className="bg-[#181818] border border-white/5 p-4 rounded-2xl text-center">
                <Activity className="w-4 h-4 text-[#D9FF00] mx-auto mb-1" />
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Maintenance TDEE</span>
                <span className="text-xl font-bold text-[#D9FF00] font-mono mt-1 block">{tdee}</span>
                <span className="text-[10px] text-white/40 block">kcal / day target</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#181818] border border-white/5 p-4 rounded-2xl text-center">
                <span className="text-[11px] text-white font-bold block">🔥 Weight Loss Target (-500 kcal)</span>
                <span className="text-lg font-bold text-[#D9FF00] font-mono mt-1 block">{weightLossTarget}</span>
                <span className="text-[10px] text-white/40 block">kcal/day (~0.5 kg loss/wk)</span>
              </div>

              <div className="bg-[#181818] border border-white/5 p-4 rounded-2xl text-center">
                <span className="text-[11px] text-white font-bold block">💪 Muscle Building (+350 kcal)</span>
                <span className="text-lg font-bold text-[#D9FF00] font-mono mt-1 block">{muscleGainTarget}</span>
                <span className="text-[10px] text-white/40 block">kcal/day (Lean Surplus)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Ideal Body Weight */}
        {activeCalc === 'ideal_weight' && (
          <div className="bg-[#181818] border border-white/5 p-6 rounded-3xl text-center space-y-2">
            <Target className="w-6 h-6 text-[#D9FF00] mx-auto" />
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block">Estimated Ideal Target Range</span>
            <div className="text-3xl sm:text-4xl font-bold text-white font-mono">
              {idealWeight - 3} - {idealWeight + 3} kg
            </div>
            <p className="text-xs text-white/40 max-w-sm mx-auto">
              Based on the Devine clinical formula for a {gender.toLowerCase()} of {heightCm} cm.
            </p>
          </div>
        )}

        {/* Tab 4: Water */}
        {activeCalc === 'water' && (
          <div className="bg-[#181818] border border-white/5 p-6 rounded-3xl text-center space-y-2">
            <Droplets className="w-6 h-6 text-cyan-400 mx-auto" />
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block">Hydration Target</span>
            <div className="text-3xl sm:text-4xl font-bold text-cyan-300 font-mono">
              {waterLiters} Liters
            </div>
            <span className="text-xs font-bold text-white/60 block">
              Equal to approximately <span className="text-cyan-400">{waterGlasses} glasses</span> (250ml) daily.
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
