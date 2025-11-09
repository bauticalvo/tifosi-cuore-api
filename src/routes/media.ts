import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';

const router = Router();

// Get media info
router.get('/:publicId', async (req, res) => {
  // Implementar obtención de información de media
  res.json({ message: 'Media info endpoint' });
});

// List media (si necesitas paginación, etc.)
router.get('/',  UploadController.getAllMedia);

export default router;