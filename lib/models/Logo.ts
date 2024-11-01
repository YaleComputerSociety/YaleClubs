import mongoose, { Document, Schema } from 'mongoose';

// Interface for Logo Schema
export interface ILogo extends Document {
  imageUrl: string;
  altText: string;
}

// Logo Schema
const logoSchema = new Schema<ILogo>({
  imageUrl: { type: String, required: true },
  altText: { type: String }
});

const Logo = mongoose.models.Logo || mongoose.model<ILogo>('Logo', logoSchema);
export default Logo;
