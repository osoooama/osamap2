import mongoose from 'mongoose';

export interface IChannel {
  channel_id: string;
  name: string;
  stream_url: string;
  category: string;
  logo_url?: string;
  stream_type: 'live' | 'movie' | 'series';
  is_active: boolean;
  source: string;
  last_checked: Date;
  is_alive: boolean;
  check_count: number;
  last_updated: Date;
}

const channelSchema = new mongoose.Schema<IChannel>({
  channel_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  stream_url: { type: String, required: true },
  category: { type: String, default: 'General' },
  logo_url: { type: String },
  stream_type: { type: String, enum: ['live', 'movie', 'series'], default: 'live' },
  is_active: { type: Boolean, default: true },
  source: { type: String, default: 'iptv-org' },
  last_checked: { type: Date, default: Date.now },
  is_alive: { type: Boolean, default: true },
  check_count: { type: Number, default: 0 },
  last_updated: { type: Date, default: Date.now },
});

channelSchema.index({ category: 1 });
channelSchema.index({ stream_type: 1 });
channelSchema.index({ source: 1 });
channelSchema.index({ is_alive: 1 });
channelSchema.index({ name: 'text' });

export default mongoose.model<IChannel>('Channel', channelSchema);
