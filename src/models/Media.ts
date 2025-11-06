import { Schema, model, Document, Types } from 'mongoose';

export interface IMedia extends Document {
  _id: Types.ObjectId;
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  alt?: string;
  caption?: string;
  folder?: string;
  created_at: Date;
  updated_at: Date;
}

const mediaSchema = new Schema<IMedia>({
  public_id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  url: { 
    type: String, 
    required: true 
  },
  secure_url: { 
    type: String, 
    required: true 
  },
  format: { 
    type: String, 
    required: true 
  },
  bytes: { 
    type: Number, 
    required: true 
  },
  width: { 
    type: Number, 
    required: true 
  },
  height: { 
    type: Number, 
    required: true 
  },
  alt: { 
    type: String 
  },
  caption: { 
    type: String 
  },
  folder: { 
    type: String, 
    default: 'uploads' 
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Índices para búsquedas rápidas
mediaSchema.index({ public_id: 1 });
mediaSchema.index({ folder: 1 });
mediaSchema.index({ created_at: -1 });

export const Media = model<IMedia>('Media', mediaSchema);