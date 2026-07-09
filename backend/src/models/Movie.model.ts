import mongoose, { Document } from 'mongoose';

interface IMovie extends Document {
  tmdb_id: string;
  title: string;
  overview: string;
  poster_path: string;
  category: 'foreign' | 'arabic' | 'turkish' | 'anime' | 'animation';
  created_at: Date;
}

const MovieSchema = new mongoose.Schema<IMovie>({
  tmdb_id: { type: String, unique: true, index: true },
  title: String,
  overview: String,
  poster_path: String,
  category: { type: String, enum: ['foreign','arabic','turkish','anime','animation'] },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IMovie>('Movie', MovieSchema);
