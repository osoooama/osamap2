import mongoose, { Document } from 'mongoose';

interface IMovie extends Document {
  tmdb_id: string;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  media_type: 'movie' | 'tv';
  category: 'foreign' | 'arabic' | 'turkish' | 'anime' | 'animation';
  images: { tmdb: string; shahid: string; disney: string };
  embed_urls: string[];
  subtitles: string[];
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  created_at: Date;
  updated_at: Date;
}

const MovieSchema = new mongoose.Schema<IMovie>({
  tmdb_id: { type: String, unique: true, index: true },
  title: String,
  overview: String,
  poster_path: String,
  backdrop_path: String,
  media_type: { type: String, enum: ['movie', 'tv'], default: 'movie' },
  category: { type: String, enum: ['foreign', 'arabic', 'turkish', 'anime', 'animation'] },
  images: {
    tmdb: { type: String, default: '' },
    shahid: { type: String, default: '' },
    disney: { type: String, default: '' },
  },
  embed_urls: [String],
  subtitles: [String],
  vote_average: { type: Number, default: 0 },
  release_date: { type: String, default: '' },
  genre_ids: { type: [Number], default: [] },
  original_language: { type: String, default: '' },
  popularity: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

MovieSchema.index({ title: 'text' });
MovieSchema.index({ category: 1, popularity: -1 });
MovieSchema.index({ media_type: 1, category: 1 });

export default mongoose.model<IMovie>('Movie', MovieSchema);
