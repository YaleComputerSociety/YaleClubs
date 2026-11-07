import mongoose, { Schema } from "mongoose";

const optionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, maxlength: 2000 },
  },
  { _id: false },
);

const questionSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true, enum: ["short-answer", "multiple-choice"] },
    prompt: { type: String, required: true, maxlength: 2000 },
    wordLimit: {
      type: Number,
      min: 1,
      max: 5000,
      required: function (this: { type: string }) {
        return this.type === "short-answer";
      },
    },
    options: { type: [optionSchema], default: undefined },
  },
  { _id: false },
);

const applicationFormSchema = new Schema(
  {
    schemaVersion: { type: Number, required: true, default: 1 },
    clubId: { type: Schema.Types.ObjectId, ref: "Club", required: true, index: true },
    title: { type: String, required: true, maxlength: 150 },
    opensAt: { type: Date, required: true },
    closesAt: { type: Date, required: true },
    questions: { type: [questionSchema], required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, collection: "applicationforms" },
);

export default mongoose.models.ApplicationForm || mongoose.model("ApplicationForm", applicationFormSchema);
