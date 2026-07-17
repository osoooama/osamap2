import mongoose from 'mongoose';

export interface IChannel {
  channel_id: string;
  name: string;
  stream_url: string;
  category: string;
  logo_url?: string;
  stream_type: 'live' | 'movie' | 'series';
  is_active: boolean;
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
  last_updated: { type: Date, default: Date.now },
});

channelSchema.index({ category: 1 });
channelSchema.index({ stream_type: 1 });
channelSchema.index({ name: 'text' });

export default mongoose.model<IChannel>('Channel', channelSchema);
