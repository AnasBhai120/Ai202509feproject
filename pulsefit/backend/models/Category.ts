import mongoose, { Schema } from 'mongoose';

export interface ICategory {
  _id?: string;
  name: string;
  type: 'workout' | 'muscle' | 'equipment' | 'meal';
  icon?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['workout', 'muscle', 'equipment', 'meal'],
      default: 'workout',
    },
    icon: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

export const CategoryModel: any = mongoose.models.Category || mongoose.model('Category', CategorySchema);
