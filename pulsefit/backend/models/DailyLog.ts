import mongoose, { Schema } from 'mongoose';

export interface IDailyMealItem {
  mealId?: string;
  name: string;
  category: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  loggedAt: Date;
}

export interface IDailyLog {
  _id?: string;
  userId: string;
  date: string;
  waterGlasses: number;
  steps: number;
  caloriesBurned: number;
  calorieTarget: number;
  meals: IDailyMealItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const DailyMealItemSchema = new Schema({
  mealId: { type: String },
  name: { type: String, required: true },
  category: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  loggedAt: { type: Date, default: Date.now },
});

const DailyLogSchema = new Schema(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true },
    waterGlasses: { type: Number, default: 0 },
    steps: { type: Number, default: 0 },
    caloriesBurned: { type: Number, default: 0 },
    calorieTarget: { type: Number, default: 2200 },
    meals: [DailyMealItemSchema],
  },
  {
    timestamps: true,
  }
);

export const DailyLogModel: any = mongoose.models.DailyLog || mongoose.model('DailyLog', DailyLogSchema);
