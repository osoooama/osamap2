import { Router } from 'express';
import { getMatches, getMatchById } from '../controllers/sports.controller';

const router = Router();

router.get('/matches', getMatches);
router.get('/matches/:id', getMatchById);

export default router;
