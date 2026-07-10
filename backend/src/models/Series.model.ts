import mongoose, { Document } from 'mongoose';

export interface ISeries extends Document {
  tmdb_id: string;
  title: string;
  overview: string;
  poster_path: string;
  category: 'foreign' | 'arabic' | 'turkish' | 'anime' | 'animation';
  seasons: number;
  created_at: Date;
}

const SeriesSchema = new mongoose.Schema<ISeries>({
  tmdb_id: { type: String, unique: true, index: true },
  title: String,
  overview: String,
  poster_path: String,
  category: { type: String, enum: ['foreign', 'arabic', 'turkish', 'anime', 'animation'] },
  seasons: Number,
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<ISeries>('Series', SeriesSchema);
