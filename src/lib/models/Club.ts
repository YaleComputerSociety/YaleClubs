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
  netId?: string;
  profilePicture?: string;
}

export interface Meeting {
  day: string;
  time?: string;
  location?: string;
}

// Use this when creating/updating a club
export interface IClubInput {
  name: string;
  description: string;
  categories: ClubCategory[];
  clubLeaders: ClubLeader[];
  logo?: string;
  backgroundImage?: string;
  numMembers?: number;
  website?: string;
  email?: string;
  instagram?: string;
  phone?: string;
  applyForm?: string;
  mailingForm?: string;
  meeting?: Meeting;
  calendarLink?: string;
}

// Use this when fetching a club
export interface IClub extends Document {
  _id: string;
  name: string;
  description: string;
  categories: ClubCategory[];
  clubLeaders: ClubLeader[];
  logo?: string;
  backgroundImage?: string;
  numMembers?: number;
  website?: string;
  email?: string;
  instagram?: string;
  phone?: string;
  applyForm?: string;
  mailingForm?: string;
  meeting?: Meeting;
  calendarLink?: string;
}

// Club Schema
const clubSchema = new Schema<IClub>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  categories: { type: [String], enum: Object.values(ClubCategory), required: true },
  clubLeaders: [
    {
      type: {
        name: { type: String, required: true },
        role: { type: String },
      },
      required: true,
    },
  ],
  logo: { type: String },
  backgroundImage: { type: String },
  numMembers: { type: Number },
  website: { type: String },
  email: { type: String },
  instagram: { type: String },
  phone: { type: String },
  applyForm: { type: String },
  mailingForm: { type: String },
  meeting: {
    type: {
      location: { type: String },
      time: { type: String },
    },
  },
  calendarLink: { type: String },
});

const Club = mongoose.models.Club || mongoose.model<IClub>("Club", clubSchema);
export default Club;
