import mongoose, { Document, Schema } from "mongoose";
import { ILogo } from "./Logo";

// Interface for Club Schema
export interface IClub extends Document {
  _id: string;
  clubName: string;
  description: string;
  instagram: string;
  email: string;
  phone: string;
  website: string;
  applyForm: string;
  yaleConnect: string;
  clubMembers: string[];
  clubLeaders: string[];
  logo: ILogo["_id"];
  categories: string[];
}

// Club Schema
const clubSchema = new Schema<IClub>({
  clubName: { type: String, required: true },
  description: { type: String, required: true },
  instagram: { type: String },
  email: { type: String },
  phone: { type: String },
  website: { type: String },
  applyForm: { type: String },
  yaleConnect: { type: String },
  clubMembers: { type: [String] },
  clubLeaders: { type: [String] },
  logo: { type: Schema.Types.ObjectId, ref: "Logo" },
  categories: { type: [String] },
});

const Club = mongoose.models.Club || mongoose.model<IClub>("Club", clubSchema);
export default Club;
