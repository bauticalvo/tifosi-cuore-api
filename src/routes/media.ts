import { Router } from 'express';

const router = Router();

// Get media info
router.get('/:publicId', async (req, res) => {
  // Implementar obtención de información de media
  res.json({ message: 'Media info endpoint' });
});

// List media (si necesitas paginación, etc.)
router.get('/', async (req, res) => {
  // Implementar listado de media
  res.json({ message: 'Media list endpoint' });
});

export default router;