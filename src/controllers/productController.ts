import { Request, Response } from 'express';
import { Product, Media, Color, Team, League, Country } from '../models';
import { CloudinaryService } from '../services/cloudinary';
import mongoose from 'mongoose';

export class ProductController {
  static async getAllProducts(req: Request, res: Response) {
    try {
      const { 
        category, 
        team, 
        league, 
        country, 
        page = 1, 
        limit = 12,
        sort = 'created_at',
        order = 'desc'
      } = req.query;

      const filter: any = {};
      
      if (category) filter.category = category;
      if (team) filter.team = team;
      if (league) filter.league = league;
      if (country) filter.country = country;

      const products = await Product.find(filter)
        .populate('images')
        .populate('color')
        .populate('team')
        .populate('league')
        .populate('country')
        .sort({ [sort as string]: order === 'desc' ? -1 : 1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Product.countDocuments(filter);

      res.json({
        success: true,
        data: products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getProductBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const product = await Product.findOne({ slug })
        .populate('images')
        .populate('color')
        .populate('team')
        .populate('league')
        .populate('country');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });

    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching product',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createProduct(req: Request, res: Response) {
    try {
      const productData = req.body;

      // Verificar que las imágenes existan
      if (productData.images && productData.images.length > 0) {
        const imagesExist = await Media.find({ 
          _id: { $in: productData.images } 
        });
        
        if (imagesExist.length !== productData.images.length) {
          return res.status(400).json({
            success: false,
            message: 'Some images do not exist'
          });
        }
      }

      const product = await Product.create(productData);
      const populatedProduct = await Product.findById(product._id)
        .populate('images')
        .populate('color')
        .populate('team')
        .populate('league')
        .populate('country');

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: populatedProduct
      });

    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
  
      // Validar ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID"
        });
      }
  
      // Verificar si existe
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
  
      const {
        name,
        slug,
        category,
        description,
        price,
        discount,
        color,
        images,
        variants,
        is_featured,
        season,
        team,
        league,
        country,
        tags,
        meta_title,
        meta_description,
      } = req.body;
  
      const updateData: any = {};
  
      // Campos simples
      if (name !== undefined) updateData.name = name;
      if (slug !== undefined) updateData.slug = slug;
      if (category !== undefined) updateData.category = category;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (discount !== undefined) updateData.discount = discount;
      if (meta_title !== undefined) updateData.meta_title = meta_title;
      if (meta_description !== undefined) updateData.meta_description = meta_description;
  
      // Arrays
      if (color !== undefined) updateData.color = Array.isArray(color) ? color : [color];
      if (images !== undefined) updateData.images = Array.isArray(images) ? images : [images];
      if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [tags];
  
      // Variants
      if (variants !== undefined) updateData.variants = variants;
  
      // Boolean
      if (is_featured !== undefined) updateData.is_featured = is_featured;
  
      // Season
      if (season !== undefined) {
        updateData.season = {
          from: season.from ?? existingProduct.season.from,
          to: season.to ?? existingProduct.season.to
        };
      }
  
      // Relaciones
      if (team !== undefined) updateData.team = team;
      if (league !== undefined) updateData.league = league;
      if (country !== undefined) updateData.country = country;
  
      // Actualizar producto
      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("images")
        .populate("color")
        .populate("team")
        .populate("league")
        .populate("country");
  
      return res.json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
      });
  
    } catch (error) {
      console.error("Update product error:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating product",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  

  static async createProductWithExistingImages(req: Request, res: Response) {
    try {
      const productData = req.body;
  
      // Validar datos requeridos
      if (!productData.name || !productData.price || !productData.category) {
        return res.status(400).json({
          success: false,
          message: 'Name, price and category are required'
        });
      }
  
      // Si se proporcionan imageUrls, crear registros en Media para cada una
      if (productData.imageUrls && Array.isArray(productData.imageUrls)) {
        const mediaPromises = productData.imageUrls.map(async (imageUrl: string, index: number) => {
          const mediaData = {
            public_id: `manual_${Date.now()}_${index}`,
            url: imageUrl,
            secure_url: imageUrl,
            format: this.getImageFormatFromUrl(imageUrl),
            bytes: 0,
            width: 800,
            height: 600,
            alt: `${productData.name} - Imagen ${index + 1}`,
            folder: 'manual-uploads'
          };
  
          return await Media.create(mediaData);
        });
  
        const mediaResults = await Promise.all(mediaPromises);
        productData.images = mediaResults.map(media => media._id);
      }
  
      // Generar slug automáticamente si no se proporciona
      if (!productData.slug) {
        productData.slug = this.generateSlug(productData.name);
      }
  
      const product = await Product.create(productData);
      const populatedProduct = await Product.findById(product._id)
        .populate('images')
        .populate('color')
        .populate('team')
        .populate('league')
        .populate('country');
  
      res.status(201).json({
        success: true,
        message: `Product created successfully with ${productData.images?.length || 0} images`,
        data: populatedProduct
      });
  
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Helper para detectar formato de imagen desde URL
  private static getImageFormatFromUrl(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    const formatMap: { [key: string]: string } = {
      'jpg': 'jpg',
      'jpeg': 'jpeg', 
      'png': 'png',
      'gif': 'gif',
      'webp': 'webp',
      'svg': 'svg'
    };
    return formatMap[extension || ''] || 'jpg';
  }
  
  // Helper para generar slug
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
 
}