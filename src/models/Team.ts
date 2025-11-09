import { Schema, model, Document, Types } from 'mongoose';
import { IMedia, ILeague } from './';

export interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  short_name: string;
  image: Types.ObjectId | IMedia;
  league?: Types.ObjectId | ILeague;
  type: 'club' | 'national';
  created_at: Date;
  updated_at: Date;
}

const teamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  short_name: { type: String, required: true },
  image: { type: Schema.Types.ObjectId, ref: 'Media', required: true },
  league: { type: Schema.Types.ObjectId, ref: 'League' },
  type: { 
    type: String, 
    enum: ['club', 'national'], 
    required: true 
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

teamSchema.index({ name: 1 });
teamSchema.index({ league: 1 });
teamSchema.index({ short_name: 1 });
teamSchema.index({ type: 1 });

export const Team = model<ITeam>('Team', teamSchema);
