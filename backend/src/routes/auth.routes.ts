import { Router } from 'express';
import { register, login, verifyEmail, resendVerification } from '../controllers/auth.controller';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/verify', verifyEmail);
router.post('/resend-verification', resendVerification);

export default router;
