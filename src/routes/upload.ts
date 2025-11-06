import { Router, Request, Response } from 'express'; // ← Agregar Request y Response
import { UploadController } from '../controllers/uploadController';
import { upload, handleUploadError } from '../middleware/upload';
import { CloudinaryService } from '../services/cloudinary';

const router = Router();

// Upload single image
router.post(
  '/single',
  upload.single('image'),
  handleUploadError,
  UploadController.uploadImage
);

// Upload multiple images
router.post(
  '/multiple',
  upload.array('images', 10), // máximo 10 archivos
  handleUploadError,
  async (req: Request, res: Response) => { // ← AGREGAR TIPOS EXPLÍCITOS
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files provided'
        });
      }

      // Aquí implementarías la lógica para múltiples archivos
      // Por ahora solo respondemos que el endpoint funciona
      res.json({ 
        success: true,
        message: 'Multiple upload endpoint - implementar lógica',
        filesCount: req.files.length 
      });
    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading multiple images',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// routes/upload.js
router.post(
  '/upload-images',
  upload.array('images', 10),
  handleUploadError,
  async (req: Request, res: Response) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'No images uploaded' 
        });
      }

      const files = req.files as Express.Multer.File[];
      const folder = req.body.folder || 'products';

      // 1. Subir imágenes a Cloudinary y guardar en MongoDB
      const uploadPromises = files.map(async (file, index) => {
        try {
          const result = await CloudinaryService.uploadAndSaveImage(
            file,
            folder,
            file.originalname.replace(/\.[^/.]+$/, ""), 
            `Image ${index + 1} for product`
          );
          
          return { 
            success: true, 
            data: result 
          };
        } catch (error) {
          return { 
            success: false, 
            filename: file.originalname,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // Separar resultados exitosos y fallidos
      const successfulUploads = uploadResults.filter(result => result.success);
      const failedUploads = uploadResults.filter(result => !result.success);

      // 2. Obtener las URLs de Cloudinary
      const imageUrls = successfulUploads.map(result => 
        (result as any).data.mongo.secure_url || (result as any).data.mongo.url
      );

      res.json({
        success: true,
        message: `${successfulUploads.length} images uploaded successfully${failedUploads.length > 0 ? `, ${failedUploads.length} failed` : ''}`,
        data: {
          imageUrls: imageUrls,
          failed: failedUploads
        }
      });

    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error uploading images',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Delete image
router.delete('/:publicId', UploadController.deleteImage);

export default router;