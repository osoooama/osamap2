import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import movieRoutes from './routes/movie.routes';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', movieRoutes);

mongoose.connect(process.env.MONGODB_URI!).then(() => {
  console.log('✅ MongoDB connected');
  app.listen(5000, () => console.log('🚀 Backend on http://localhost:5000'));
}).catch(err => console.log('❌ DB Error:', err));
