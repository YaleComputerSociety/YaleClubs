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

export enum School {
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

export enum Intensity {
  CASUAL = "Casual",
  MODERATE = "Moderate Commitment",
  HIGH = "High Commitment",
  Intense = "Intense Commitment",
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
  subheader?: string;
  description?: string;
  categories?: ClubCategory[];
  leaders: ClubLeader[];
  affiliations?: ClubAffiliation[];
  school?: School;
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
  yaleConnectId?: number;
  intensity?: Intensity;
  howToJoin?: string;
  scraped?: boolean;
  inactive?: boolean;
}

// Use this when fetching a club
export interface IClub extends Document {
  _id: string;
  createdAt: string;
  updatedAt: string;

  name: string;
  subheader?: string;
  description?: string;
  categories?: string[];
  leaders: ClubLeader[];
  affiliations?: string[];
  school?: string;
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
  yaleConnectId?: number;
  intensity?: string;
  howToJoin?: string;
  scraped?: boolean;
  inactive?: boolean;
}

// Club Schema
const clubSchema = new Schema<IClub>(
  {
    name: { type: String, required: true },
    description: { type: String },
    subheader: { type: String },
    categories: { type: [String], enum: Object.values(ClubCategory), default: [] },
    leaders: { type: [ClubLeaderSchema], required: true },
    affiliations: { type: [String], enum: Object.values(ClubAffiliation), default: [] },
    school: { type: String, enum: Object.values(School) },
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
    yaleConnectId: { type: Number },
    intensity: { type: String, enum: Object.values(Intensity) },
    howToJoin: { type: String },
    scraped: { type: Boolean },
    inactive: { type: Boolean },
  },
  { timestamps: true },
);

const Club = mongoose.models.Club || mongoose.model<IClub>("Club", clubSchema);
export default Club;
