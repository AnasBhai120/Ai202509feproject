import mongoose, { Schema } from 'mongoose';

export interface IExercise {
  _id?: string;
  name: string;
  description: string;
  muscleGroup: string;
  secondaryMuscles?: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exerciseType: 'Strength' | 'Cardio' | 'Flexibility' | 'Plyometrics';
  instructions: string[];
  image: string;
  videoUrl?: string;
  defaultSets: number;
  defaultReps: number;
  caloriesPerHour?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExerciseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    muscleGroup: { type: String, required: true },
    secondaryMuscles: [{ type: String }],
    equipment: { type: String, required: true },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    exerciseType: {
      type: String,
      enum: ['Strength', 'Cardio', 'Flexibility', 'Plyometrics'],
      default: 'Strength',
    },
    instructions: [{ type: String }],
    image: { type: String, required: true },
    videoUrl: { type: String },
    defaultSets: { type: Number, default: 3 },
    defaultReps: { type: Number, default: 12 },
    caloriesPerHour: { type: Number, default: 300 },
  },
  {
    timestamps: true,
  }
);

export const ExerciseModel: any = mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema);
