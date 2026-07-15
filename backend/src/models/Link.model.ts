import mongoose, { Document } from 'mongoose';

interface ILink extends Document {
  tmdb_id: string;
  source: string;
  embed_url: string;
  stream_url: string;
  quality: string;
  category: string;
  platform: string;
  title: string;
  is_active: boolean;
  last_checked: Date;
}

const LinkSchema = new mongoose.Schema<ILink>({
  tmdb_id: { type: String, index: true },
  source: String,
  embed_url: String,
  stream_url: String,
  quality: { type: String, default: '720p' },
  category: { type: String, default: 'foreign' },
  platform: { type: String, default: 'netflix' },
  title: { type: String, default: '' },
  is_active: { type: Boolean, default: true },
  last_checked: { type: Date, default: Date.now },
});

export default mongoose.model<ILink>('Link', LinkSchema);
