import mongoose, { Schema } from 'mongoose';

export interface IHistoryExercise {
  name: string;
  setsCompleted: number;
  repsCompleted: number;
  weightKg?: number;
}

export interface IWorkoutHistory {
  _id?: string;
  userId: string;
  workoutId?: string;
  workoutName: string;
  category?: string;
  durationMinutes: number;
  caloriesBurned: number;
  exercisesCompleted: IHistoryExercise[];
  notes?: string;
  completedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const HistoryExerciseSchema = new Schema({
  name: { type: String, required: true },
  setsCompleted: { type: Number, default: 3 },
  repsCompleted: { type: Number, default: 10 },
  weightKg: { type: Number, default: 0 },
});

const WorkoutHistorySchema = new Schema(
  {
    userId: { type: String, required: true },
    workoutId: { type: String },
    workoutName: { type: String, required: true },
    category: { type: String },
    durationMinutes: { type: Number, required: true },
    caloriesBurned: { type: Number, required: true },
    exercisesCompleted: [HistoryExerciseSchema],
    notes: { type: String },
    completedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const WorkoutHistoryModel: any =
  mongoose.models.WorkoutHistory || mongoose.model('WorkoutHistory', WorkoutHistorySchema);
