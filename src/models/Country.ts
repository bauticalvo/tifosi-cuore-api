import { Schema, model, Document, Types } from 'mongoose';
import { IMedia } from './Media';

export interface ICountry extends Document {
  _id: Types.ObjectId;
  name: string;
  image: Types.ObjectId | IMedia;
  created_at: Date;
  updated_at: Date;
}

const countrySchema = new Schema<ICountry>({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  image: { 
    type: Schema.Types.ObjectId, 
    ref: 'Media', 
    required: true 
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

export const Country = model<ICountry>('Country', countrySchema);