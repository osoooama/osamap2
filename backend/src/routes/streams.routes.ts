import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getStreamsByTmdb, getAllStreams, checkStreamHealth } from '../controllers/streams.controller';

const router = Router();

const generalLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

router.get('/streams/:tmdb_id', generalLimiter, getStreamsByTmdb);
router.get('/streams', generalLimiter, getAllStreams);
router.get('/streams/:tmdb_id/health', generalLimiter, checkStreamHealth);

export default router;
