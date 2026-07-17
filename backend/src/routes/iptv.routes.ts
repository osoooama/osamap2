import { Router } from 'express';
import { getChannels, getChannelCategories, getChannelById } from '../controllers/iptv.controller';

const router = Router();

router.get('/channels', getChannels);
router.get('/channels/categories', getChannelCategories);
router.get('/channels/:id', getChannelById);

export default router;
