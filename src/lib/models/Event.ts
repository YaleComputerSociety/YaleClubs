import mongoose, { Document, Schema } from "mongoose";

export enum Tag {
  FeaturedEvent = "Featured Club Event",
  FreeFood = "Free Food",
  LimitedCapacity = "Limited Capacity",
  StartsPromptly = "Starts Promptly",
  RegistrationRequired = "Registration Required",
  Showcase = "Showcase",
  Performance = "Performance",
  Athletics = "Athletics",
  CommunityService = "Community Service",
  CommunityBuilding = "Community Building",
  Speaker = "Speaker",
  Social = "Social",
  Party = "Party",
  GoodForBeginners = "Good for Beginners",
  GoodForNewMembers = "Good for New Members",
  ProfessionalDevelopment = "Professional Development",
}

export interface IEventInput {
  name: string;
  description: string;
  clubs: string[];
  start: Date;
  location: string;
  registrationLink?: string;
  flyer?: string;
  flyerFile?: File;
  tags?: Tag[];
  createdBy?: string;
}

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  name: string;
  description: string;
  clubs: string[];
  start: Date;
  location: string;
  registrationLink?: string;
  flyer?: string;
  tags?: Tag[];
}

const eventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    clubs: { type: [String], required: true },
    start: { type: Date, required: true },
    location: { type: String, required: true },
    registrationLink: { type: String, required: false },
    flyer: { type: String, required: false },
    tags: { type: [String], enum: Object.values(Tag), default: [] },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

const Event = mongoose.models?.Event || mongoose.model<IEvent>("Event", eventSchema);
export default Event;
