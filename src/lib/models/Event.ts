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

export enum EventSource {
  YaleClubs = "yaleclubs",
  YaleConnect = "yaleconnect",
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

  // Fields for events imported from an external source (e.g. YaleConnect)
  source?: EventSource;
  externalId?: string;
  end?: Date;
  externalLink?: string;
  /** True when the source hides the real location (e.g. YaleConnect's "Private Location"). */
  locationHidden?: boolean;
  topics?: string[];
  lastSyncedAt?: Date;
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
    source: { type: String, enum: Object.values(EventSource), default: EventSource.YaleClubs },
    externalId: { type: String, required: false },
    end: { type: Date, required: false },
    externalLink: { type: String, required: false },
    locationHidden: { type: Boolean, required: false },
    topics: { type: [String], default: undefined },
    lastSyncedAt: { type: Date, required: false },
  },
  { timestamps: true },
);

// One document per external event, so re-running a sync updates instead of duplicating.
eventSchema.index(
  { source: 1, externalId: 1 },
  { unique: true, partialFilterExpression: { externalId: { $type: "string" } } },
);

const Event = mongoose.models?.Event || mongoose.model<IEvent>("Event", eventSchema);
export default Event;
