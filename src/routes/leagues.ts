import { Router } from 'express';
import { LeagueController } from '../controllers/leagueController';

const router = Router();

router.get('/', LeagueController.getAllLeagues);
router.get('/:id', LeagueController.getLeagueById);
router.post('/', LeagueController.createLeague);

export default router;