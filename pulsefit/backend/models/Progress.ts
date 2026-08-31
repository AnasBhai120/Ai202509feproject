import mongoose, { Schema } from 'mongoose';

export interface IProgress {
  _id?: string;
  userId: string;
  date: string;
  weightKg: number;
  heightCm?: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  hipsCm?: number;
  thighsCm?: number;
  bmi: number;
  bodyFatPercentage?: number;
  notes?: string;
  photoUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProgressSchema = new Schema(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true },
    weightKg: { type: Number, required: true },
    heightCm: { type: Number },
    chestCm: { type: Number },
    waistCm: { type: Number },
    armsCm: { type: Number },
    hipsCm: { type: Number },
    thighsCm: { type: Number },
    bmi: { type: Number, required: true },
    bodyFatPercentage: { type: Number },
    notes: { type: String },
    photoUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export const ProgressModel: any = mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);
