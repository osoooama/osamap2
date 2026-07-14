import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, verifyEmail, resendVerification } from '../controllers/auth.controller';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify', authLimiter, verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);

export default router;
