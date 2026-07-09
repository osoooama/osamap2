import mongoose from 'mongoose';

const LinkSchema = new mongoose.Schema({
  movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  source_site: String,
  embed_url: String,
  quality: { type: String, enum: ['720p','1080p','4K'] },
  is_active: { type: Boolean, default: true },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('Link', LinkSchema);
