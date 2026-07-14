import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';

function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>"'`]/g, '').trim();
}

export async function register(req: Request, res: Response) {
  try {
    const { username: rawUsername, password } = req.body;
    const username = sanitizeString(rawUsername);
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be 3-30 characters' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed });

    const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET!, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username },
    });
  } catch {
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username: rawUsername, password } = req.body;
    const username = sanitizeString(rawUsername);
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET!, { expiresIn: '30d' });

    res.json({
      token,
      user: { id: user._id, username: user.username },
    });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function verifyToken(req: Request, res: Response) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; username: string };
    const user = await User.findById(decoded.id).select('username _id');
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user: { id: user._id, username: user.username } });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
