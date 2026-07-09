import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import movieRoutes from './routes/movie.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', movieRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI!).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));
}).catch(err => console.log('DB Error:', err));
