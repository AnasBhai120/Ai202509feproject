import mongoose, { Schema } from 'mongoose';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  age: number;
  gender: string;
  height: number;
  weight: number;
  fitnessGoal: 'Weight Loss' | 'Muscle Gain' | 'Strength' | 'Endurance' | 'General Fitness';
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extra Active';
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    age: { type: Number, default: 25 },
    gender: { type: String, default: 'Not specified' },
    height: { type: Number, default: 175 },
    weight: { type: Number, default: 70 },
    fitnessGoal: {
      type: String,
      enum: ['Weight Loss', 'Muscle Gain', 'Strength', 'Endurance', 'General Fitness'],
      default: 'General Fitness',
    },
    activityLevel: {
      type: String,
      enum: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extra Active'],
      default: 'Moderately Active',
    },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel: any = mongoose.models.User || mongoose.model('User', UserSchema);
