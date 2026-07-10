import mongoose, { Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  favorites: mongoose.Types.ObjectId[];
  watch_history: mongoose.Types.ObjectId[];
  is_verified: boolean;
  verification_code: string;
  verification_code_expires: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, unique: true, required: true, lowercase: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  watch_history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  is_verified: { type: Boolean, default: false },
  verification_code: String,
  verification_code_expires: Date,
});

export default mongoose.model<IUser>('User', UserSchema);
