import { Schema, model, Document, Types } from 'mongoose';
import { IMedia, ICountry } from './';

export interface ILeague extends Document {
  _id: Types.ObjectId;
  name: string;
  image: Types.ObjectId | IMedia;
  country: Types.ObjectId | ICountry;
  created_at: Date;
  updated_at: Date;
}

const leagueSchema = new Schema<ILeague>({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  image: { 
    type: Schema.Types.ObjectId, 
    ref: 'Media', 
    required: true 
  },
  country: { 
    type: Schema.Types.ObjectId, 
    ref: 'Country', 
    required: true 
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

leagueSchema.index({ country: 1 });
leagueSchema.index({ name: 1 });

export const League = model<ILeague>('League', leagueSchema);