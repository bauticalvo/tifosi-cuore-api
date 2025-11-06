import { Router } from 'express';
import { TeamController } from '../controllers/teamController';

const router = Router();

router.get('/', TeamController.getAllTeams);
router.get('/:id', TeamController.getTeamById);
router.post('/', TeamController.createTeam);
router.put('/:id', TeamController.updateTeam);
router.delete('/:id', TeamController.deleteTeam);

export default router;