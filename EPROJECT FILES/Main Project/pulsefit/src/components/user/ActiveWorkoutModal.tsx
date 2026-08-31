import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CheckCircle2,
  X,
  Timer,
  Flame,
  Dumbbell,
  Clock,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ActiveWorkoutModal: React.FC = () => {
  const {
    activeWorkoutState,
    pauseWorkout,
    resumeWorkout,
    completeCurrentSet,
    skipRest,
    nextExercise,
    previousExercise,
    finishWorkout,
    cancelWorkout,
  } = useFitness();

  if (!activeWorkoutState || !activeWorkoutState.workout) return null;

  const {
    workout,
    currentExerciseIndex,
    currentSet,
    elapsedSeconds,
    isPaused,
    isResting,
    restRemainingSeconds,
  } = activeWorkoutState;

  const currentEx = workout.exercises[currentExerciseIndex];
  const totalExercises = workout.exercises.length;
  const totalSets = currentEx?.sets || 3;
  const restTimeTotal = currentEx?.restTimeSeconds || 45;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const estimatedCalories = Math.round((elapsedSeconds / 60) * 9.2);

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col text-white overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D9FF00]/10 border border-[#D9FF00]/30 flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#D9FF00]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white leading-tight truncate max-w-[200px] sm:max-w-md">
              {workout.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
              <span>Movement {currentExerciseIndex + 1} of {totalExercises}</span>
              <span>•</span>
              <span className="text-[#D9FF00] font-semibold">{workout.category}</span>
            </div>
          </div>
        </div>

        {/* Live Counters & Close */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111111] border border-white/10 px-3.5 py-1.5 rounded-full">
            <Timer className="w-4 h-4 text-[#D9FF00] animate-pulse" />
            <span className="font-mono text-sm font-bold text-white">{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to exit and cancel this workout session?')) {
                cancelWorkout();
              }
            }}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Active Workout Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-2xl mx-auto w-full flex flex-col justify-between">
        {/* Exercise Card */}
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden aspect-video max-h-72 w-full bg-[#111111] border border-white/5">
            <img
              src={currentEx?.image || workout.coverImage}
              alt={currentEx?.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent" />

            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
              <div>
                <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#D9FF00] text-black uppercase tracking-wider">
                  CURRENT DRILL
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-1.5">{currentEx?.name}</h1>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-white/40 block uppercase tracking-widest font-bold">Target Reps</span>
                <span className="text-xl sm:text-2xl font-bold text-[#D9FF00] font-mono">{currentEx?.reps}</span>
              </div>
            </div>
          </div>

          {/* Exercise Notes or instructions */}
          {currentEx?.notes && (
            <div className="bg-[#111111] border border-white/5 p-4 rounded-2xl text-xs text-white/60 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#D9FF00] shrink-0 mt-0.5" />
              <span>{currentEx.notes}</span>
            </div>
          )}

          {/* Set Progression Badges */}
          <div className="bg-[#111111] border border-white/5 p-5 rounded-3xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Set Tracker</span>
              <span className="text-xs font-bold text-[#D9FF00]">
                Set {currentSet} of {totalSets}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalSets }).map((_, idx) => {
                const setNum = idx + 1;
                const isCompleted = setNum < currentSet;
                const isCurrent = setNum === currentSet;

                return (
                  <div
                    key={idx}
                    className={`py-3 px-2 rounded-2xl text-center border transition-all ${
                      isCompleted
                        ? 'bg-[#D9FF00]/10 border-[#D9FF00]/40 text-[#D9FF00] font-bold'
                        : isCurrent
                        ? 'bg-[#D9FF00] text-black border-[#D9FF00] font-black shadow-[0_0_15px_rgba(217,255,0,0.35)] scale-105'
                        : 'bg-white/5 border-white/5 text-white/30'
                    }`}
                  >
                    <span className="text-xs block font-bold">Set {setNum}</span>
                    <span className="text-[10px] font-mono opacity-80">{currentEx?.reps} reps</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rest Countdown Timer Overlay */}
          <AnimatePresence>
            {isResting && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#111111] border border-[#D9FF00]/40 p-6 rounded-3xl text-center relative overflow-hidden shadow-2xl"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#D9FF00] uppercase tracking-widest mb-1">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Active Recovery Interval</span>
                  </div>
                  <div className="text-4xl sm:text-6xl font-bold font-mono text-white my-2 tracking-tight">
                    {restRemainingSeconds}s
                  </div>
                  <p className="text-xs text-white/40">Oxygenate muscles & prepare for the next set</p>

                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={skipRest}
                      className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                    >
                      Skip Recovery →
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5">
                  <div
                    className="h-full bg-[#D9FF00] transition-all duration-1000 shadow-[0_0_8px_rgba(217,255,0,0.5)]"
                    style={{ width: `${(restRemainingSeconds / restTimeTotal) * 100}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls & Navigation */}
        <div className="pt-6 space-y-3">
          {/* Main Action Button */}
          {!isResting ? (
            <button
              onClick={completeCurrentSet}
              className="w-full py-4 px-6 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(217,255,0,0.3)] transition-all"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>Complete Set {currentSet} ({currentEx?.reps} Reps)</span>
            </button>
          ) : (
            <button
              onClick={skipRest}
              className="w-full py-4 px-6 rounded-full bg-[#D9FF00] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-[#D9FF00]/20"
            >
              <SkipForward className="w-5 h-5" />
              <span>Start Next Set Now</span>
            </button>
          )}

          {/* Sub Navigation controls */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={previousExercise}
              disabled={currentExerciseIndex === 0}
              className="py-3 rounded-full bg-[#111111] border border-white/5 text-xs font-semibold text-white/60 hover:text-white disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center gap-1"
            >
              <SkipBack className="w-4 h-4" />
              <span>Prev</span>
            </button>

            <button
              onClick={isPaused ? resumeWorkout : pauseWorkout}
              className="col-span-2 py-3 rounded-full bg-[#111111] border border-white/5 text-xs font-semibold text-white hover:text-white flex items-center justify-center gap-1.5"
            >
              {isPaused ? <Play className="w-4 h-4 text-[#D9FF00] fill-[#D9FF00]" /> : <Pause className="w-4 h-4 text-[#D9FF00]" />}
              <span>{isPaused ? 'Resume Session' : 'Pause Session'}</span>
            </button>

            <button
              onClick={nextExercise}
              disabled={currentExerciseIndex === totalExercises - 1}
              className="py-3 rounded-full bg-[#111111] border border-white/5 text-xs font-semibold text-white/60 hover:text-white disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center gap-1"
            >
              <span>Next</span>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Finish workout early */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                if (window.confirm('Finish workout now and save logged sets?')) {
                  finishWorkout();
                }
              }}
              className="text-xs text-white/40 hover:text-[#D9FF00] font-semibold transition-colors"
            >
              Finish & Save Workout Early
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
