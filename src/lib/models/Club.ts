import mongoose, { Document, Schema } from "mongoose";

// these are just examples, we will change these later
export enum ClubCategory {
  SPORTS = "Sports",
  ARTS = "Arts",
  TECHNOLOGY = "Technology",
  MUSIC = "Music",
}

export interface ClubLeader {
  email: string;
  name?: string;
  year?: number;
  role?: string;
  netId?: string;
  profilePicture?: string;
}

const ClubLeaderSchema = new Schema({
  email: { type: String, required: true },
  name: { type: String },
  year: { type: Number },
  role: { type: String },
  netId: { type: String },
  profilePicture: { type: String },
});

export interface Meeting {
  day?: string;
  time?: string;
  location?: string;
}

const MeetingSchema = new Schema({
  day: { type: String },
  time: { type: String },
  location: { type: String },
});

// Use this when creating/updating a club
export interface IClubInput {
  name: string;
  description?: string;
  categories: ClubCategory[];
  leaders: ClubLeader[];
  logo?: string;
  backgroundImage?: string;
  numMembers?: number;
  website?: string;
  email?: string;
  instagram?: string;
  phone?: string;
  applyForm?: string;
  mailingListForm?: string;
  meeting?: Meeting;
  calendarLink?: string;
  affiliation?: string;
}

// Use this when fetching a club
export interface IClub extends Document {
  _id: string;
  name: string;
  description?: string;
  categories: ClubCategory[];
  leaders: ClubLeader[];
  logo?: string;
  backgroundImage?: string;
  numMembers?: number;
  website?: string;
  email?: string;
  instagram?: string;
  phone?: string;
  applyForm?: string;
  mailingListForm?: string;
  meeting?: Meeting;
  calendarLink?: string;
  affiliation?: string;
}

// Club Schema
const clubSchema = new Schema<IClub>({
  name: { type: String, required: true },
  description: { type: String },
  categories: { type: [String], enum: Object.values(ClubCategory), required: true },
  leaders: { type: [ClubLeaderSchema], required: true },
  logo: { type: String },
  backgroundImage: { type: String },
  numMembers: { type: Number },
  website: { type: String },
  email: { type: String },
  instagram: { type: String },
  phone: { type: String },
  applyForm: { type: String },
  mailingListForm: { type: String },
  meeting: MeetingSchema,
  calendarLink: { type: String },
  affiliation: { type: String },
});

const Club = mongoose.models.Club || mongoose.model<IClub>("Club", clubSchema);
export default Club;
