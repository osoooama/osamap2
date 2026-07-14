import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth';
import { triggerScrape, getStatus } from '../controllers/scrape.controller';

const router = Router();
const scrapeLimiter = rateLimit({ windowMs: 60 * 1000, max: 3, standardHeaders: true, legacyHeaders: false });

router.post('/trigger', scrapeLimiter, authenticate, triggerScrape);
router.get('/status', scrapeLimiter, getStatus);

export default router;
