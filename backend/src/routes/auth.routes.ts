import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, verifyToken } from '../controllers/auth.controller';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', verifyToken);

export default router;
