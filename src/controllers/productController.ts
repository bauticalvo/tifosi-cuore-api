import { Request, Response } from 'express';
import { Product, Media } from '../models';

export class ProductController {
  
  // Helper para generar slug
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  // Helper para detectar formato de imagen desde URL
  private static getImageFormatFromUrl(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    const formatMap: { [key: string]: string } = {
      'jpg': 'jpg', 'jpeg': 'jpeg', 'png': 'png', 'gif': 'gif', 'webp': 'webp', 'svg': 'svg'
    };
    return formatMap[extension || ''] || 'jpg';
  }

  // ✅ CREAR PRODUCTO CON URLs DE IMÁGENES (Método principal)
  static async createProductWithImages(req: Request, res: Response) {
    try {
      const {
        name,
        category,
        description,
        price,
        discount,
        color,
        variants,
        is_featured,
        season,
        team,
        league,
        country,
        tags,
        images // Array de ObjectIds de Media
      } = req.body;

      // Validaciones básicas
      if (!name || !category || !price) {
        return res.status(400).json({
          success: false,
          message: 'Name, category and price are required'
        });
      }

      // Verificar que las imágenes existan en la base de datos
      if (images && images.length > 0) {
        const existingImages = await Media.find({ _id: { $in: images } });
        
        if (existingImages.length !== images.length) {
          return res.status(400).json({
            success: false,
            message: 'Some image IDs do not exist in the database'
          });
        }
      }

      // Crear el producto directamente con los ObjectIds
      const product = await Product.create({
        name,
        category,
        description,
        price: parseInt(price),
        discount: discount ? parseInt(discount) : 0,
        color: Array.isArray(color) ? color : JSON.parse(color || '[]'),
        variants: Array.isArray(variants) ? variants : JSON.parse(variants || '[]'),
        is_featured: is_featured === 'true' || is_featured === true,
        season: typeof season === 'object' ? season : JSON.parse(season || '{}'),
        team,
        league,
        country,
        tags: Array.isArray(tags) ? tags : JSON.parse(tags || '[]'),
        images: images || [], // Usar los ObjectIds directamente
        slug: ProductController.generateSlug(name)
      });

      // Populate y respuesta
      const populatedProduct = await Product.findById(product._id)
        .populate('images')
        .populate('color')
        .populate('team')
        .populate('league')
        .populate('country');

      res.status(201).json({
        success: true,
        message: `Product created successfully with ${images?.length || 0} images`,
        data: populatedProduct
      });

    } catch (error) {
      console.error('Create product with images error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ✅ OBTENER TODOS LOS PRODUCTOS (mantener)
  static async getAllProducts(req: Request, res: Response) {
    try {
      const { category, team, league, country, page = 1, limit = 12 } = req.query;
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
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Product.countDocuments(filter);

      res.json({
        success: true,
        data: products,
        pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
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

  // ✅ OBTENER PRODUCTO POR SLUG (mantener)
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
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      res.json({ success: true, data: product });

    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching product',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}