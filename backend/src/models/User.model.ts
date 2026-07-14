import mongoose, { Document } from 'mongoose';

interface IUser extends Document {
  username: string;
  password: string;
  favorites: mongoose.Types.ObjectId[];
  watch_history: mongoose.Types.ObjectId[];
}

const UserSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  watch_history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

export default mongoose.model<IUser>('User', UserSchema);
