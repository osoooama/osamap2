import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import VerificationCode from '../models/VerificationCode.model';
import { generateCode } from '../utils/helpers';
import { sendVerificationEmail } from '../services/email.service';

export async function register(req: Request, res: Response) {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username';
      return res.status(400).json({ error: `${field} already registered` });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, username, password: hashed, is_verified: false });

    const code = generateCode(6);
    await VerificationCode.create({ email, code, expires_at: new Date(Date.now() + 10 * 60 * 1000) });

    let emailSent = false;
    try {
      await sendVerificationEmail(email, username, code);
      emailSent = true;
    } catch {
      // Don't auto-verify on email failure — user must retry
    }

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.status(201).json({
      message: emailSent
        ? 'تم التسجيل. يرجى التحقق من بريدك الإلكتروني.'
        : 'تم التسجيل. فشل إرسال البريد، يرجى طلب إعادة الإرسال.',
      token,
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch {
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email first' });
    }

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { email, code } = req.body;
    const record = await VerificationCode.findOne({ email, code });
    if (!record || record.expires_at < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    await User.findOneAndUpdate({ email }, { is_verified: true });
    await VerificationCode.deleteOne({ _id: record._id });

    res.json({ message: 'Email verified' });
  } catch {
    res.status(500).json({ error: 'Verification failed' });
  }
}

export async function resendVerification(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.is_verified) return res.json({ message: 'Already verified' });

    await VerificationCode.deleteMany({ email });

    const code = generateCode(6);
    await VerificationCode.create({ email, code, expires_at: new Date(Date.now() + 10 * 60 * 1000) });

    await sendVerificationEmail(email, user.username, code);

    res.json({ message: 'New code sent to your email' });
  } catch {
    res.status(500).json({ error: 'Resend failed' });
  }
}
