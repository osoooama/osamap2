import mongoose, { Document } from 'mongoose';

interface IVerificationCode extends Document {
  email: string;
  code: string;
  expires_at: Date;
}

const VerificationCodeSchema = new mongoose.Schema<IVerificationCode>({
  email: { type: String, required: true, lowercase: true },
  code: { type: String, required: true },
  expires_at: { type: Date, required: true, index: { expires: 0 } },
});

export default mongoose.model<IVerificationCode>('VerificationCode', VerificationCodeSchema);
