import mongoose, { Document, Schema } from "mongoose";

// these are just examples, we will change these later
export enum ClubCategory {
  SPORTS = "Sports",
  ARTS = "Arts",
  TECHNOLOGY = "Technology",
  MUSIC = "Music",
}

export enum ClubAffiliation {
  COLLEGE = "Yale College",
  LAW = "Law School",
  DRAMA = "School of Drama",
  MEDICINE = "School of Medicine",
  ENVIRONMENT = "School of the Environment",
  ARCHITECTURE = "School of Architecture",
  MANAGEMENT = "School of Management",
  GSAS_ADMIN = "Graduate School of Arts & Sciences (GSAS) Administration",
  GSAS = "Graduate School of Arts & Sciences (GSAS)",
}

export interface ClubLeader {
  email: string;
  name: string;
  year?: number;
  role?: string;
  netId?: string;
  profilePicture?: string;
}

const ClubLeaderSchema = new Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  year: { type: Number },
  role: { type: String },
  netId: { type: String },
  profilePicture: { type: String },
});

// Use this when creating/updating a club
export interface IClubInput {
  name: string;
  description?: string;
  categories?: ClubCategory[];
  leaders: ClubLeader[];
  logo?: string;
  backgroundImage?: string;
  numMembers?: number;
  website?: string;
  email?: string;
  instagram?: string;
  applyForm?: string;
  mailingListForm?: string;
  meeting?: string;
  calendarLink?: string;
  affiliations?: ClubAffiliation[];
}

// Use this when fetching a club
export interface IClub extends Document {
  _id: string;
  name: string;
  description?: string;
  categories?: ClubCategory[];
  leaders: ClubLeader[];
  logo?: string;
  backgroundImage?: string;
  numMembers?: number;
  website?: string;
  email?: string;
  instagram?: string;
  applyForm?: string;
  mailingListForm?: string;
  meeting?: string;
  calendarLink?: string;
  affiliations?: ClubAffiliation[];
}

// Club Schema
const clubSchema = new Schema<IClub>({
  name: { type: String, required: true },
  description: { type: String },
  categories: { type: [String], enum: Object.values(ClubCategory), default: [] },
  leaders: { type: [ClubLeaderSchema], required: true },
  logo: { type: String },
  backgroundImage: { type: String },
  numMembers: { type: Number },
  website: { type: String },
  email: { type: String },
  instagram: { type: String },
  applyForm: { type: String },
  mailingListForm: { type: String },
  meeting: { type: String },
  calendarLink: { type: String },
  affiliations: { type: [String], enum: Object.values(ClubCategory), default: [] },
});

const Club = mongoose.models.Club || mongoose.model<IClub>("Club", clubSchema);
export default Club;
