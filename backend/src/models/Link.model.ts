import mongoose, { Document } from 'mongoose';

interface ILink extends Document {
  tmdb_id: string;
  source: string;
  embed_url: string;
  quality: '360p' | '480p' | '720p' | '1080p' | '2K' | '4K';
  is_active: boolean;
  last_checked: Date;
}

const LinkSchema = new mongoose.Schema<ILink>({
  tmdb_id: { type: String, index: true },
  source: String,
  embed_url: String,
  quality: { type: String, enum: ['360p', '480p', '720p', '1080p', '2K', '4K'] },
  is_active: { type: Boolean, default: true },
  last_checked: { type: Date, default: Date.now },
});

export default mongoose.model<ILink>('Link', LinkSchema);
