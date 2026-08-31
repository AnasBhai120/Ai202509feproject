import mongoose, { Schema } from 'mongoose';

export interface INotification {
  _id?: string;
  userId?: string;
  title: string;
  message: string;
  type: 'announcement' | 'workout' | 'nutrition' | 'reminder';
  isRead: boolean;
  targetRole: 'all' | 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema(
  {
    userId: { type: String },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['announcement', 'workout', 'nutrition', 'reminder'],
      default: 'announcement',
    },
    isRead: { type: Boolean, default: false },
    targetRole: {
      type: String,
      enum: ['all', 'user', 'admin'],
      default: 'all',
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel: any =
  mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
