import { Router } from 'express';
import { ProductController } from '../controllers/productController';

const router = Router();

router.get('/', ProductController.getAllProducts);
router.get('/:slug', ProductController.getProductBySlug);
router.post('/create', ProductController.createProductWithImages); // ✅ ÚNICO ENDPOINT PARA CREAR

export default router;