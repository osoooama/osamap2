import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import movieRoutes from './routes/movie.routes';
import authRoutes from './routes/auth.routes';
import scrapeRoutes from './routes/scrape.routes';
import streamsRoutes from './routes/streams.routes';
import sportsRoutes from './routes/sports.routes';
import iptvRoutes from './routes/iptv.routes';
import subtitleRoutes from './routes/subtitle.routes';
import Movie from './models/Movie.model';
import { seedAllCategories } from './services/tmdb.service';
import { errorHandler } from './middleware/errorHandler';

const app = express();
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => res.json({ message: 'OSAMA/>Dev API V2', status: 'running' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/scrape', scrapeRoutes);
app.use('/api', streamsRoutes);
app.use('/api', sportsRoutes);
app.use('/api', iptvRoutes);
app.use('/api', subtitleRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function seedIfEmpty() {
  try {
    const count = await Movie.countDocuments();
    if (count > 50) {
      console.log(`📦 DB already has ${count} items, skipping seed`);
      return;
    }

    console.log('🌱 Seeding database from TMDB...');
    const allResults = await seedAllCategories();
    let totalInserted = 0;

    for (const [category, items] of Object.entries(allResults)) {
      for (const item of items) {
        await Movie.updateOne(
          { tmdb_id: item.tmdb_id },
          {
            $set: {
              ...item,
              images: {
                tmdb: item.poster_path
                  ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                  : '',
              },
              category,
            },
          },
          { upsert: true }
        );
        totalInserted++;
      }
    }

    console.log(`✅ Seed complete: ${totalInserted} items across ${Object.keys(allResults).length} categories`);
  } catch (err) {
    console.log('⚠️ Seed skipped or failed:', err instanceof Error ? err.message : err);
  }
}

mongoose.connect(process.env.MONGODB_URI!, { dbName: 'OSAMAP2_DB' }).then(async () => {
  console.log('✅ MongoDB connected');
  await seedIfEmpty();
  app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
}).catch(err => console.log('❌ DB Error:', err));
