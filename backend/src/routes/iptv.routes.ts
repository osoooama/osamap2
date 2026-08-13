import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getChannels, getChannelCategories, getChannelById, refreshChannels, getChannelStatsController } from '../controllers/iptv.controller';

const router = Router();
const iptvLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

router.get('/channels', iptvLimiter, getChannels);
router.get('/channels/categories', iptvLimiter, getChannelCategories);
router.get('/channels/stats', iptvLimiter, getChannelStatsController);
router.post('/channels/refresh', iptvLimiter, refreshChannels);
router.get('/channels/:id', iptvLimiter, getChannelById);

export default router;
