import { Router } from 'express';
import { CountryController } from '../controllers/countryController';

const router = Router();

router.get('/', CountryController.getAllCountries);
router.get('/:id', CountryController.getCountryById);
router.post('/', CountryController.createCountry);

export default router;