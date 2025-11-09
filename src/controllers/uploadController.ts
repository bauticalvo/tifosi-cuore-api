import { Request, Response } from 'express';
import { CloudinaryService } from '../services/cloudinary';
import { Media } from '../models/Media';

export class UploadController {

  static async getAllMedia(req: Request, res: Response) {
    try {
      const media = await Media.find().sort({ name: 1 });

      res.json({
        success: true,
        data: media
      });

    } catch (error) {
      console.error('Get media error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching media',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  static async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided'
        });
      }

      const folder = req.body.folder || 'uploads';
      const alt = req.body.alt;
      const caption = req.body.caption;

      const result = await CloudinaryService.uploadAndSaveImage(
        req.file, 
        folder, 
        alt, 
        caption
      );

      // Populate para obtener datos completos
      const mediaWithDetails = await Media.findById(result.mongo._id);

      res.status(201).json({
        success: true,
        message: 'Image uploaded and saved successfully',
        data: mediaWithDetails
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error uploading image',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteImage(req: Request, res: Response) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Public ID is required'
        });
      }

      await CloudinaryService.deleteImageCompletely(publicId);

      res.json({
        success: true,
        message: 'Image deleted successfully from Cloudinary and database'
      });

    } catch (error) {
      console.error('Delete error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error deleting image',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}