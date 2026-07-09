import mongoose, { Document } from 'mongoose';

interface ILink extends Document {
  movie_id: mongoose.Types.ObjectId;
  source_site: string;
  embed_url: string;
  quality: '720p' | '1080p' | '4K';
  is_active: boolean;
  updated_at: Date;
}

const LinkSchema = new mongoose.Schema<ILink>({
  movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  source_site: String,
  embed_url: String,
  quality: { type: String, enum: ['720p','1080p','4K'] },
  is_active: { type: Boolean, default: true },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model<ILink>('Link', LinkSchema);
