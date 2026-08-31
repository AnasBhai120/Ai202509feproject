import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { WorkoutHistory } from '../../types';
import {
  History,
  Flame,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  Dumbbell,
} from 'lucide-react';

export const WorkoutHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [stats, setStats] = useState<{ totalWorkouts: number; totalMinutes: number; totalCalories: number; streak: number }>({
    totalWorkouts: 0,
    totalMinutes: 0,
    totalCalories: 0,
    streak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.history.getAll();
      setHistory(res.data.history);
      setStats(res.data.stats);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
          Workout <span className="font-bold text-[#D9FF00]">History</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/40 mt-1">
          Review all executed training sessions, completed set volumes, and caloric expenditure.
        </p>
      </div>

      {/* Stats Summary Bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Sessions</span>
            <Trophy className="w-4 h-4 text-[#D9FF00]" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight mt-2">{stats.totalWorkouts}</div>
          <span className="text-xs text-white/40 block mt-0.5">Completed workouts</span>
        </div>

        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Time Trained</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight mt-2">{stats.totalMinutes}m</div>
          <span className="text-xs text-white/40 block mt-0.5">Minutes logged</span>
        </div>

        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Burn</span>
            <Flame className="w-4 h-4 text-[#D9FF00]" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight mt-2">{stats.totalCalories}</div>
          <span className="text-xs text-white/40 block mt-0.5">kcal expended</span>
        </div>

        <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Streak</span>
            <Sparkles className="w-4 h-4 text-[#D9FF00]" />
          </div>
          <div className="text-3xl font-bold text-[#D9FF00] tracking-tight mt-2">{stats.streak} Days</div>
          <span className="text-xs text-white/40 block mt-0.5">Active momentum</span>
        </div>
      </div>

      {/* History Log List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">
          Completed Sessions ({history.length})
        </h2>

        {history.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#111111] border border-white/5 text-center text-white/40 text-xs">
            <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-30 text-white" />
            <p>No completed workouts yet. Start your first session today!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((session) => (
              <div
                key={session._id}
                className="bg-[#111111] border border-white/5 p-5 rounded-3xl space-y-4 hover:border-white/10 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D9FF00]">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">{session.workoutName}</h3>
                      <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                        <span className="text-[#D9FF00] font-semibold">{session.category || 'Workout'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-white/30" />
                          {new Date(session.completedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-base font-bold text-[#D9FF00] font-mono">{session.caloriesBurned} kcal</span>
                      <span className="text-xs text-white/40 block">{session.durationMinutes} minutes</span>
                    </div>
                  </div>
                </div>

                {/* Exercises completed breakdown */}
                {session.exercisesCompleted && session.exercisesCompleted.length > 0 && (
                  <div className="pt-3 border-t border-white/5">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">
                      Logged Movements
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {session.exercisesCompleted.map((ex, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 text-xs text-white/80"
                        >
                          <span className="truncate">{ex.name}</span>
                          <span className="text-[#D9FF00] font-mono font-bold ml-2 shrink-0">
                            {ex.setsCompleted} sets × {ex.repsCompleted}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {session.notes && (
                  <p className="text-xs text-white/40 italic bg-white/5 p-3 rounded-xl">
                    "{session.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
