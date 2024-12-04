import mongoose, { Document, Schema } from "mongoose";

export enum Category {
  ACappella = "A Cappella",
  Academic = "Academic",
  Administrative = "Administrative",
  AdvocacySocialJusticeGlobalAffairs = "Advocacy, Social Justice, Global Affairs",
  AdvocacyPolicy = "Advocacy/Policy",
  ArtsPerformanceComedy = "Arts, Performance, Comedy",
  ArtsOther = "Arts: Other",
  ArtsVisualArts = "Arts: Visual Arts",
  BusinessAndEntrepreneurship = "Business and Entrepreneurship",
  CommunityOutreach = "Community Outreach",
  Cultural = "Cultural",
  CulturalMixedRace = "Cultural: Mixed Race",
  Dance = "Dance",
  EntrepreneurialBusiness = "Entrepreneurial/Business",
  EnvironmentSustainability = "Environment, Sustainability",
  FoodCulinary = "Food/Culinary",
  Funding = "Funding",
  GamesGaming = "Games/Gaming",
  GreekLetterOrganizations = "Greek-Letter Organizations",
  HealthWellness = "Health, Wellness",
  HealthWellnessAlt = "Health/Wellness",
  International = "International",
  InternationalAffairs = "International Affairs",
  LGBTQ = "LGBTQ",
  Leadership = "Leadership",
  MediaTechnology = "Media/Technology",
  MedicalNursingPublicHealth = "Medical/Nursing/Public Health",
  Music = "Music",
  Outdoors = "Outdoors",
  PerformanceComedy = "Performance: Comedy",
  PerformanceDance = "Performance: Dance",
  PerformanceInstruments = "Performance: Instruments",
  PerformanceOther = "Performance: Other",
  PerformanceSinging = "Performance: Singing",
  PerformanceTheater = "Performance: Theater",
  Political = "Political",
  PoliticsCivicEngagementDebate = "Politics, Civic Engagement, Debate",
  PreProfessional = "Pre-Professional",
  Professional = "Professional",
  Publication = "Publication",
  ReligiousSpiritual = "Religious, Spiritual",
  ReligiousSpiritualAlt = "Religious/Spiritual",
  ResidenceHalls = "Residence Halls",
  ScienceAndTechnology = "Science and Technology",
  ScienceTechnologyAlt = "Science/Technology",
  ServiceVolunteering = "Service/Volunteering",
  Social = "Social",
  SpecialInterest = "Special Interest",
  SpeechDebate = "Speech/Debate",
  Sports = "Sports",
  SportsOutdoors = "Sports/Outdoors",
  StudentGovernment = "Student Government",
  UniversityLifeOrganizations = "University Life Organizations",
  VeteranMilitary = "Veteran/Military",
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
  DWIGHT = "Dwight Hall",
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
  },
  { timestamps: true },
);

const Club = mongoose.models.Club || mongoose.model<IClub>("Club", clubSchema);
export default Club;
