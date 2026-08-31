import mongoose, { Schema } from 'mongoose';

export interface IFavorite {
  _id?: string;
  userId: string;
  itemType: 'workout' | 'exercise' | 'meal';
  itemId: string;
  itemData?: any;
  createdAt?: Date;
}

const FavoriteSchema = new Schema(
  {
    userId: { type: String, required: true },
    itemType: { type: String, enum: ['workout', 'exercise', 'meal'], required: true },
    itemId: { type: String, required: true },
    itemData: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

FavoriteSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

export const FavoriteModel: any = mongoose.models.Favorite || mongoose.model('Favorite', FavoriteSchema);
