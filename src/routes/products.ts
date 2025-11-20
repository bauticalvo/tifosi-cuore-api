import { Router } from 'express';
import { ProductController } from '../controllers/productController';

const router = Router();

router.get('/', ProductController.getAllProducts);
router.get('/:slug', ProductController.getProductBySlug);
router.post('/create', ProductController.createProductWithExistingImages); // ✅ ÚNICO ENDPOINT PARA CREAR
router.put("/:id", ProductController.updateProduct);
export default router;