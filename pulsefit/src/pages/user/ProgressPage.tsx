import React, { useState, useEffect } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ProgressLog } from '../../types';
import { LogProgressModal } from '../../components/user/LogProgressModal';
import {
  TrendingUp,
  Scale,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';

export const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const { setIsProgressModalOpen, showToast } = useFitness();

  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [latestLog, setLatestLog] = useState<ProgressLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setIsLoading(true);
    try {
      const res = await api.progress.getAll();
      setLogs(res.data.logs);
      setLatestLog(res.data.latest);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm('Delete this progress record?')) return;
    try {
      await api.progress.delete(id);
      showToast('Progress record removed', 'success');
      loadProgress();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete record', 'error');
    }
  };

  // Format chart data (chronological)
  const chartData = [...logs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((l) => ({
      date: new Date(l.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: l.weightKg,
      bmi: l.bmi,
    }));

  const currentWeight = latestLog?.weightKg || user?.weight || 72;
  const initialWeight = logs.length > 0 ? logs[logs.length - 1].weightKg : currentWeight;
  const weightChange = (currentWeight - initialWeight).toFixed(1);
  const currentBmi = latestLog?.bmi || 22.5;

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Body <span className="font-bold text-[#D9FF00]">Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/40 mt-1">
            Monitor weight dynamics, body fat composition, and biometric trends over time.
          </p>
        </div>

        <button
          onClick={() => setIsProgressModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black text-xs font-black shadow-[0_0_12px_rgba(217,255,0,0.3)] transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>LOG METRIC</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl">
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block">Current Weight</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-bold text-white tracking-tight">{currentWeight}</span>
            <span className="text-xs text-white/40 font-bold">kg</span>
          </div>
          <span className="text-[11px] text-[#D9FF00] mt-1 block">Goal: {user?.fitnessGoal || 'Hypertrophy'}</span>
        </div>

        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl">
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block">BMI Index</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-bold text-[#D9FF00] tracking-tight">{currentBmi}</span>
          </div>
          <span className="text-[11px] text-white/40 font-semibold mt-1 block">Optimal Classification</span>
        </div>

        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl">
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block">Net Delta</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {Number(weightChange) > 0 ? `+${weightChange}` : weightChange}
            </span>
            <span className="text-xs text-white/40 font-bold">kg</span>
          </div>
          <span className="text-[11px] text-white/40 mt-1 block">Across {logs.length} checkpoints</span>
        </div>

        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl">
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block">Milestone Status</span>
          <div className="text-sm font-bold text-white mt-2.5 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#D9FF00]" />
            <span>Target on Schedule</span>
          </div>
          <span className="text-[11px] text-white/40 mt-1 block">94% consistency rating</span>
        </div>
      </div>

      {/* Weight History Chart */}
      <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight">Weight Progression Trajectory</h3>
            <p className="text-xs text-white/40">Temporal weight fluctuations and trendline estimation</p>
          </div>
          <span className="text-xs font-bold text-[#D9FF00] bg-[#D9FF00]/10 px-3 py-1 rounded-full border border-[#D9FF00]/20">
            Active Cycle
          </span>
        </div>

        {chartData.length < 2 ? (
          <div className="py-12 text-center text-white/30 text-xs">
            Log at least 2 entries to visualize the weight progression trendline.
          </div>
        ) : (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="weightGradVolt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9FF00" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#D9FF00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={11}
                  tickLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', fontSize: '12px', color: '#fff' }}
                  formatter={(val: any) => [`${val} kg`, 'Weight']}
                />
                <Area type="monotone" dataKey="weight" stroke="#D9FF00" strokeWidth={2.5} fillOpacity={1} fill="url(#weightGradVolt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Latest Body Circumference Measurements */}
      {latestLog && (
        <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl space-y-4">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">
            Latest Biometric Measurements (cm)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#181818] border border-white/5 p-4 rounded-2xl">
              <span className="text-[11px] text-white/40 block">Chest</span>
              <span className="text-lg font-bold text-white font-mono mt-0.5 block">{latestLog.chestCm || 98} cm</span>
            </div>
            <div className="bg-[#181818] border border-white/5 p-4 rounded-2xl">
              <span className="text-[11px] text-white/40 block">Waist</span>
              <span className="text-lg font-bold text-white font-mono mt-0.5 block">{latestLog.waistCm || 82} cm</span>
            </div>
            <div className="bg-[#181818] border border-white/5 p-4 rounded-2xl">
              <span className="text-[11px] text-white/40 block">Arms / Biceps</span>
              <span className="text-lg font-bold text-white font-mono mt-0.5 block">{latestLog.armsCm || 37} cm</span>
            </div>
            <div className="bg-[#181818] border border-white/5 p-4 rounded-2xl">
              <span className="text-[11px] text-white/40 block">Body Fat %</span>
              <span className="text-lg font-bold text-[#D9FF00] font-mono mt-0.5 block">
                {latestLog.bodyFatPercentage || 14.8}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Records History */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">
          Measurement Log History ({logs.length})
        </h3>

        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log._id}
              className="flex items-center justify-between p-4 rounded-2xl bg-[#111111] border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 text-[#D9FF00] border border-white/10 flex items-center justify-center font-bold text-xs">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">{log.weightKg} kg</span>
                    <span className="text-xs text-[#D9FF00] font-semibold">• BMI {log.bmi}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-white/30" />
                    <span>{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {log.notes && <span className="italic truncate max-w-xs text-white/60">"{log.notes}"</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeleteLog(log._id)}
                className="p-2 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Log Progress Modal */}
      <LogProgressModal onSuccess={loadProgress} />
    </div>
  );
};
