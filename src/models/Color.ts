import { Schema, model, Document, Types } from 'mongoose';

export interface IColor extends Document {
  _id: Types.ObjectId;
  name: string;
  hex_code?: string;
  created_at: Date;
  updated_at: Date;
}

const colorSchema = new Schema<IColor>({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  hex_code: { 
    type: String 
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

export const Color = model<IColor>('Color', colorSchema);