import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getChannels,
  getChannelCategories,
  getChannelById,
  refreshChannels,
  cleanupChannels,
  getChannelStatsController,
  getChannelHealth,
  getEPGController,
} from '../controllers/iptv.controller';

const router = Router();
const iptvLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

router.get('/channels', iptvLimiter, getChannels);
router.get('/channels/categories', iptvLimiter, getChannelCategories);
router.get('/channels/stats', iptvLimiter, getChannelStatsController);
router.get('/channels/health', iptvLimiter, getChannelHealth);
router.get('/channels/epg', iptvLimiter, getEPGController);
router.post('/channels/refresh', iptvLimiter, refreshChannels);
router.post('/channels/cleanup', iptvLimiter, cleanupChannels);
router.get('/channels/:id', iptvLimiter, getChannelById);

export default router;
