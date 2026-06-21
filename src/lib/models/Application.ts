import mongoose, { Document, Schema } from "mongoose";
import { ApplicationQuestionType } from "./Club";

export enum ApplicationStatus {
  SUBMITTED = "submitted",
  IN_REVIEW = "in_review",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export interface ApplicationResponse {
  questionId: string;
  label: string;
  type: ApplicationQuestionType;
  textAnswer?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  clubName: string;
  applicantNetid: string;
  applicantEmail: string;
  applicantName?: string;
  status: ApplicationStatus;
  responses: ApplicationResponse[];
  reviewerEmail?: string;
  reviewerNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationResponseSchema = new Schema<ApplicationResponse>(
  {
    questionId: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: Object.values(ApplicationQuestionType), required: true },
    textAnswer: { type: String },
    fileUrl: { type: String },
    fileName: { type: String },
  },
  { _id: false },
);

const ApplicationSchema = new Schema<IApplication>(
  {
    clubId: { type: Schema.Types.ObjectId, ref: "Club", required: true, index: true },
    clubName: { type: String, required: true },
    applicantNetid: { type: String, required: true, index: true },
    applicantEmail: { type: String, required: true },
    applicantName: { type: String },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      required: true,
      default: ApplicationStatus.SUBMITTED,
      index: true,
    },
    responses: { type: [ApplicationResponseSchema], required: true, default: [] },
    reviewerEmail: { type: String },
    reviewerNote: { type: String },
  },
  { timestamps: true },
);

const Application = mongoose.models?.Application || mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;
