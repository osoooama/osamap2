import mongoose, { Document } from 'mongoose';

export interface ISeries extends Document {
  tmdb_id: string;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  category: 'foreign' | 'arabic' | 'turkish' | 'anime' | 'animation';
  seasons: number;
  episodes: number;
  status: string;
  vote_average: number;
  first_air_date: string;
  last_air_date: string;
  genre_ids: number[];
  origin_country: string[];
  networks: string[];
  created_at: Date;
  updated_at: Date;
}

const SeriesSchema = new mongoose.Schema<ISeries>({
  tmdb_id: { type: String, unique: true, index: true },
  title: String,
  overview: String,
  poster_path: String,
  backdrop_path: String,
  category: { type: String, enum: ['foreign', 'arabic', 'turkish', 'anime', 'animation'] },
  seasons: { type: Number, default: 0 },
  episodes: { type: Number, default: 0 },
  status: { type: String, default: '' },
  vote_average: { type: Number, default: 0 },
  first_air_date: { type: String, default: '' },
  last_air_date: { type: String, default: '' },
  genre_ids: { type: [Number], default: [] },
  origin_country: { type: [String], default: [] },
  networks: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

SeriesSchema.index({ title: 'text' });
SeriesSchema.index({ category: 1 });
SeriesSchema.index({ category: 1, vote_average: -1 });

export default mongoose.model<ISeries>('Series', SeriesSchema);
