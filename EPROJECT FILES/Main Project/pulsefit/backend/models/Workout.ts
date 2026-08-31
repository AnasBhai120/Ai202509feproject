import mongoose, { Schema } from 'mongoose';

export interface IWorkoutExercise {
  exercise: string;
  name: string;
  sets: number;
  reps: number;
  restSeconds?: number;
  notes?: string;
}

export interface IWorkout {
  _id?: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  caloriesBurned: number;
  coverImage: string;
  equipment: string[];
  muscleGroups: string[];
  isFeatured: boolean;
  exercises: IWorkoutExercise[];
  instructions?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const WorkoutExerciseSchema = new Schema({
  exercise: { type: String, required: true },
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: Number, default: 10 },
  restSeconds: { type: Number, default: 60 },
  notes: { type: String },
});

const WorkoutSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    durationMinutes: { type: Number, required: true },
    caloriesBurned: { type: Number, required: true },
    coverImage: { type: String, required: true },
    equipment: [{ type: String }],
    muscleGroups: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    exercises: [WorkoutExerciseSchema],
    instructions: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const WorkoutModel: any = mongoose.models.Workout || mongoose.model('Workout', WorkoutSchema);
