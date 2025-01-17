import mongoose, { Document, Schema } from "mongoose";

export enum Category {
  ACappella = "A Cappella",
  Academic = "Academic",
  Administrative = "Administrative",
  AdvocacySocialJusticeGlobalAffairs = "Advocacy, Social Justice, Global Affairs",
  AdvocacyPolicy = "Advocacy/Policy",
  BusinessandEntrepreneurship = "Business and Entrepreneurship",
  Comedy = "Comedy",
  CommunityOutreach = "Community Outreach",
  Consulting = "Consulting",
  Cultural = "Cultural",
  Dance = "Dance",
  EntrepreneurialBusiness = "Entrepreneurial/Business",
  EnvironmentSustainability = "Environment, Sustainability",
  Food = "Food",
  Games = "Games",
  GreekLife = "Greek Life",
  Healthcare = "Healthcare",
  Instruments = "Instruments",
  International = "International",
  InternationalAffairs = "International Affairs",
  LGBTQ = "LGBTQ",
  Music = "Music",
  OtherArts = "Other Arts",
  Politics = "Politics",
  PreProfessional = "Pre-Professional",
  Publication = "Publication",
  ReligiousSpiritual = "Religious/Spiritual",
  ScienceTechnology = "Science/Technology",
  ServiceVolunteering = "Service/Volunteering",
  Singing = "Singing",
  SpeechDebate = "Speech/Debate",
  SportsOutdoors = "Sports/Outdoors",
  StudentGovernment = "Student Government",
  Theater = "Theater",
  VeteranMilitary = "Veteran/Military",
  VisualArts = "Visual Arts",
  Wellness = "Wellness",
}

export enum School {
  COLLEGE = "Yale College",
  LAW = "Law School",
  DRAMA = "School of Drama",
  MEDICINE = "School of Medicine",
  ENVIRONMENT = "School of the Environment",
  ARCHITECTURE = "School of Architecture",
  MANAGEMENT = "School of Management",
  GSAS = "Graduate School of Arts & Sciences",
  HEALTH = "School of Public Health",
  JACKSON = "Jackson School of Global Affairs",
  NURSING = "School of Nursing",
  MUSIC = "School of Music",
  DIVINITY = "Divinity School",
  POSTDOC = "Postdoctoral",
}

export enum Affiliation {
  AACC = "AACC",
  AFAM = "AfAm",
  NACC = "NACC",
  TSAI = "Tsai City",
  CASA = "La Casa",
}

export enum Intensity {
  CASUAL = "Casual",
  MODERATE = "Moderate Commitment",
  HIGH = "High Commitment",
  Intense = "Intense Commitment",
}

export enum RecruitmentStatus {
  NOSELECTION = "No Selection",
  APPCLOSED = "Closed",
  APPENDS = "Open",
  APPOPENS = "Opens on...",
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
  subheader?: string | undefined;
  description?: string | undefined;
  categories?: Category[] | undefined;
  leaders: ClubLeader[];
  affiliations?: Affiliation[] | undefined;
  school?: School | undefined;
  logo?: string | undefined;
  backgroundImage?: string | undefined;
  numMembers?: number | undefined;
  website?: string | undefined;
  email?: string | undefined;
  instagram?: string | undefined;
  applyForm?: string | undefined;
  mailingListForm?: string | undefined;
  meeting?: string | undefined;
  calendarLink?: string | undefined;
  yaleConnectId?: number | undefined;
  intensity?: Intensity | undefined;
  howToJoin?: string | undefined;
  scraped?: boolean | undefined;
  inactive?: boolean | undefined;
  applicationStatus?: string | undefined;
  followersCount?: number | undefined;
  recruitmentStatus?: RecruitmentStatus | undefined;
  recruitmentStartDate?: Date | undefined;
  recruitmentEndDate?: Date | undefined;
  aliases?: string[];
}

// Use this when fetching a club
export interface IClub extends Document {
  _id: string;
  createdAt: string;
  updatedAt: string;

  name: string;
  subheader?: string;
  description?: string;
  categories?: Category[];
  leaders: ClubLeader[];
  affiliations?: Affiliation[];
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
  intensity?: string;
  howToJoin?: string;
  scraped?: boolean;
  inactive?: boolean;
  applicationStatus?: string;
  followersCount?: number;
  recruitmentStatus?: RecruitmentStatus;
  recruitmentStartDate?: Date;
  recruitmentEndDate?: Date;
  followers: number;
  aliases?: string[];
}

// Club Schema
const clubSchema = new Schema<IClub>(
  {
    name: { type: String, required: true },
    description: { type: String },
    subheader: { type: String },
    categories: { type: [String], enum: Object.values(Category), default: [] },
    leaders: { type: [ClubLeaderSchema], required: true },
    affiliations: { type: [String], enum: Object.values(Affiliation), default: [] },
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
    applicationStatus: { type: String },
    followersCount: { type: Number },
    recruitmentStatus: { type: String, enum: Object.values(RecruitmentStatus) },
    recruitmentStartDate: { type: Date },
    recruitmentEndDate: { type: Date },
    followers: { type: Number, required: true, default: 0 },
    aliases: { type: [String], default: [] },
  },
  { timestamps: true },
);

const Club = mongoose.models?.Club || mongoose.model<IClub>("Club", clubSchema);
export default Club;
