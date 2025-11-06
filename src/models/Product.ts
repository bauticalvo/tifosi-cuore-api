import { Schema, model, Document, Types } from 'mongoose';
import { IMedia, IColor, ITeam, ILeague, ICountry } from '.';

export interface ProductVariant {
  size: 'xs' | 's' | 'm' | 'l' | 'xl';
  stock: number;
  sku?: string;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  category: 'camiseta' | 'short' | 'buzo';
  description?: string;
  price: number;
  discount?: number;
  color: Types.ObjectId[] | IColor[];
  images: Types.ObjectId[] | IMedia[];
  variants: ProductVariant[];
  is_featured: boolean;
  season: {
    from: number;
    to: number;
  };
  team?: Types.ObjectId | ITeam;
  league?: Types.ObjectId | ILeague;
  country?: Types.ObjectId | ICountry;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  created_at: Date;
  updated_at: Date;
}

const productSchema = new Schema<IProduct>({
  name: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['camiseta', 'short', 'buzo'] 
  },
  description: { 
    type: String 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  discount: { 
    type: Number, 
    min: 0, 
    max: 100 
  },
  color: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Color' 
  }],
  images: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Media' 
  }],
  variants: [{
    size: { 
      type: String, 
      required: true,
      enum: ['xs', 's', 'm', 'l', 'xl'] 
    },
    stock: { 
      type: Number, 
      required: true, 
      min: 0,
      default: 0 
    },
    sku: { 
      type: String 
    }
  }],
  is_featured: { 
    type: Boolean, 
    default: false 
  },
  season: {
    from: { 
      type: Number, 
      required: true 
    },
    to: { 
      type: Number, 
      required: true 
    }
  },
  team: { 
    type: Schema.Types.ObjectId, 
    ref: 'Team' 
  },
  league: { 
    type: Schema.Types.ObjectId, 
    ref: 'League' 
  },
  country: { 
    type: Schema.Types.ObjectId, 
    ref: 'Country' 
  },
  tags: [{ 
    type: String 
  }],
  meta_title: { 
    type: String 
  },
  meta_description: { 
    type: String 
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Índices para búsquedas y filtros
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ team: 1 });
productSchema.index({ league: 1 });
productSchema.index({ country: 1 });
productSchema.index({ 'season.from': 1, 'season.to': 1 });
productSchema.index({ is_featured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ created_at: -1 });

// Virtual para precio con descuento
productSchema.virtual('discounted_price').get(function() {
  return this.discount ? this.price * (1 - this.discount / 100) : this.price;
});

// Asegurar que los virtuals se incluyan en JSON
productSchema.set('toJSON', { virtuals: true });

export const Product = model<IProduct>('Product', productSchema);