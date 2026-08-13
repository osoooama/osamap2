import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getMatches, getMatchById } from '../controllers/sports.controller';

const router = Router();
const sportsLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

router.get('/matches', sportsLimiter, getMatches);
router.get('/matches/:id', sportsLimiter, getMatchById);

export default router;
