import mongoose, { Document } from 'mongoose';

interface IMovie extends Document {
  tmdb_id: string;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  category: 'foreign' | 'arabic' | 'turkish' | 'anime' | 'animation';
  images: { tmdb: string; shahid: string; disney: string };
  embed_urls: string[];
  subtitles: string[];
  created_at: Date;
  updated_at: Date;
}

const MovieSchema = new mongoose.Schema<IMovie>({
  tmdb_id: { type: String, unique: true, index: true },
  title: String,
  overview: String,
  poster_path: String,
  backdrop_path: String,
  category: { type: String, enum: ['foreign', 'arabic', 'turkish', 'anime', 'animation'] },
  images: {
    tmdb: { type: String, default: '' },
    shahid: { type: String, default: '' },
    disney: { type: String, default: '' },
  },
  embed_urls: [String],
  subtitles: [String],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

MovieSchema.index({ title: 'text' });

export default mongoose.model<IMovie>('Movie', MovieSchema);
