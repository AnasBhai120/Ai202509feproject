import mongoose, { Schema } from 'mongoose';

export interface IMeal {
  _id?: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTimeMinutes: number;
  dietaryTags: string[];
  ingredients: string[];
  instructions: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const MealSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
      required: true,
    },
    image: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    prepTimeMinutes: { type: Number, default: 15 },
    dietaryTags: [{ type: String }],
    ingredients: [{ type: String }],
    instructions: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const MealModel: any = mongoose.models.Meal || mongoose.model('Meal', MealSchema);
