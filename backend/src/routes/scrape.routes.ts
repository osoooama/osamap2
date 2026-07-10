import { Router } from 'express';
import { triggerScrape, getStatus } from '../controllers/scrape.controller';

const router = Router();
router.post('/trigger', triggerScrape);
router.get('/status', getStatus);

export default router;
