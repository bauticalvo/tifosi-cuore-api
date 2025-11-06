import { Router } from 'express';
import { ColorController } from '../controllers/colorController';

const router = Router();

router.get('/', ColorController.getAllColors);
router.get('/:id', ColorController.getColorById);
router.post('/', ColorController.createColor);
router.put('/:id', ColorController.updateColor);

export default router;