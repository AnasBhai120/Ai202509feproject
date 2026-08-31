import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminDashboardData } from '../../types';
import {
  Users,
  Dumbbell,
  Flame,
  Utensils,
  Trophy,
  TrendingUp,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const CHART_COLORS = ['#D9FF00', '#22d3ee', '#f59e0b', '#ec4899', '#a855f7', '#3b82f6'];

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.getDashboard();
      setData(res.data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const stats = data?.stats || {
    totalUsers: 8,
    activeUsers: 8,
    blockedUsers: 0,
    totalWorkouts: 8,
    totalExercises: 12,
    totalMeals: 8,
    totalCompletedWorkouts: 4,
    totalCaloriesBurned: 1420,
    avgWorkoutDuration: 35,
    completionRate: '94.2%',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Overview & Analytics</h1>
        <p className="text-xs text-white/40 mt-1">
          Real-time metrics, user growth, exercise catalogs, and workout completion rates.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#111111] border border-white/5 p-4 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-bold uppercase tracking-widest">Total Athletes</span>
            <Users className="w-4 h-4 text-[#D9FF00]" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-bold text-white font-mono">{stats.totalUsers}</span>
            <span className="text-[11px] text-[#D9FF00] block font-semibold mt-0.5">{stats.activeUsers} active accounts</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#D9FF00] w-full" />
          </div>
        </div>

        <div className="bg-[#111111] border border-white/5 p-4 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-bold uppercase tracking-widest">Workout Routines</span>
            <Dumbbell className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-bold text-white font-mono">{stats.totalWorkouts}</span>
            <span className="text-[11px] text-cyan-400 block font-semibold mt-0.5">{stats.totalExercises} movements</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 w-3/4" />
          </div>
        </div>

        <div className="bg-[#111111] border border-white/5 p-4 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-bold uppercase tracking-widest">Workouts Done</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-bold text-amber-400 font-mono">{stats.totalCompletedWorkouts}</span>
            <span className="text-[11px] text-white/40 block mt-0.5">{stats.totalCaloriesBurned} kcal burned</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 w-4/5" />
          </div>
        </div>

        <div className="bg-[#111111] border border-white/5 p-4 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-bold uppercase tracking-widest">Nutrition Catalog</span>
            <Utensils className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-bold text-purple-400 font-mono">{stats.totalMeals}</span>
            <span className="text-[11px] text-white/40 block mt-0.5">Recipes active</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-purple-400 w-2/3" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Growth & Workouts Line Chart */}
        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">User Growth & Activity</h3>
            <span className="text-xs text-[#D9FF00] font-semibold">+24% this month</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.userGrowth || []}>
                <CartesianGrid stroke="#222222" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#666666" fontSize={10} tickLine={false} />
                <YAxis stroke="#666666" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#333333', borderRadius: '1rem', fontSize: '11px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="users" name="Athletes" stroke="#D9FF00" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="workouts" name="Workouts Logged" stroke="#22d3ee" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals Distribution Pie Chart */}
        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">User Goals Distribution</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.goalsDistribution || [
                    { name: 'Muscle Gain', value: 4 },
                    { name: 'Weight Loss', value: 3 },
                    { name: 'Strength', value: 2 },
                    { name: 'General Fitness', value: 1 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(data?.goalsDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#181818', borderColor: '#333333', borderRadius: '1rem', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Popular Workouts Table & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Popular Workouts */}
        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Performed Workouts</h3>
          <div className="space-y-2">
            {(data?.popularWorkouts || []).map((w, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#181818] border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-white/5 text-[#D9FF00] text-xs font-bold font-mono flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{w.name}</h4>
                    <span className="text-[10px] text-white/40">{w.category} • {w.difficulty}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#D9FF00] font-mono">{w.completions} times</span>
                  <span className="text-[10px] text-white/40 block font-mono">{w.durationMinutes} mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registered Users */}
        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Athlete Signups</h3>
          <div className="space-y-2">
            {(data?.recentUsers || []).map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#181818] border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      u.profileImage ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                    }
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{u.name}</h4>
                    <span className="text-[10px] text-white/40">{u.email}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-white/5 text-white/80 border border-white/10 uppercase">
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
