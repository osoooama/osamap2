import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
  tmdb_id: { type: String, unique: true, index: true },
  title: String,
  overview: String,
  poster_path: String,
  category: { type: String, enum: ['foreign','arabic','turkish','anime','animation'] },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Movie', MovieSchema);
