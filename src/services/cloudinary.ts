import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { IMedia, Media } from '../models/Media';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  original_filename: string;
  folder?: string; // ← AGREGAR ESTA PROPIEDAD
}

export class CloudinaryService {
  static async uploadImage(file: Express.Multer.File, folder: string = 'uploads'): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as UploadResult);
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  static async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  static async getImageInfo(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.api.resource(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  static async saveMediaToDB(cloudinaryResult: UploadResult, alt?: string, caption?: string): Promise<IMedia> {
    try {
      const mediaData = {
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.url,
        secure_url: cloudinaryResult.secure_url,
        format: cloudinaryResult.format,
        bytes: cloudinaryResult.bytes,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        alt: alt,
        caption: caption,
        folder: cloudinaryResult.folder || 'uploads'
      };

      // Buscar si ya existe
      let media = await Media.findOne({ public_id: cloudinaryResult.public_id });
      
      if (media) {
        // Actualizar existente
        media = await Media.findOneAndUpdate(
          { public_id: cloudinaryResult.public_id },
          mediaData,
          { new: true }
        );
      } else {
        // Crear nuevo
        media = await Media.create(mediaData);
      }

      // ✅ CORREGIR: Asegurar que no sea null
      if (!media) {
        throw new Error('Failed to create or update media');
      }

      return media;
    } catch (error) {
      console.error('Error saving media to DB:', error);
      throw error;
    }
  }

  static async uploadAndSaveImage(
    file: Express.Multer.File, 
    folder: string = 'uploads',
    alt?: string,
    caption?: string
  ): Promise<{ cloudinary: UploadResult; mongo: IMedia }> {
    try {
      // Subir a Cloudinary
      const cloudinaryResult = await this.uploadImage(file, folder);
      
      // Guardar en MongoDB
      const mongoMedia = await this.saveMediaToDB(cloudinaryResult, alt, caption);

      return {
        cloudinary: cloudinaryResult,
        mongo: mongoMedia
      };
    } catch (error) {
      console.error('Error in uploadAndSaveImage:', error);
      throw error;
    }
  }

  static async deleteImageCompletely(publicId: string): Promise<void> {
    try {
      // Eliminar de Cloudinary
      await this.deleteImage(publicId);
      
      // Eliminar de MongoDB
      await Media.findOneAndDelete({ public_id: publicId });
      
    } catch (error) {
      console.error('Error deleting image completely:', error);
      throw error;
    }
  }
}