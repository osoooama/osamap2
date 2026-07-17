import mongoose from 'mongoose';

export interface IMatch {
  match_id: string;
  home_team: string;
  away_team: string;
  league: string;
  match_time: string;
  match_status: 'upcoming' | 'live' | 'finished';
  home_score?: number;
  away_score?: number;
  stream_url?: string;
  channel_name?: string;
  match_date: string;
  last_updated: Date;
}

const matchSchema = new mongoose.Schema<IMatch>({
  match_id: { type: String, required: true, unique: true },
  home_team: { type: String, required: true },
  away_team: { type: String, required: true },
  league: { type: String, default: '' },
  match_time: { type: String, default: '' },
  match_status: { type: String, enum: ['upcoming', 'live', 'finished'], default: 'upcoming' },
  home_score: { type: Number },
  away_score: { type: Number },
  stream_url: { type: String },
  channel_name: { type: String },
  match_date: { type: String, required: true },
  last_updated: { type: Date, default: Date.now },
});

matchSchema.index({ match_date: 1 });
matchSchema.index({ match_status: 1 });

export default mongoose.model<IMatch>('Match', matchSchema);
