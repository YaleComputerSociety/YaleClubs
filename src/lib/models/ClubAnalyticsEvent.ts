import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClubAnalyticsEvent extends Document {
  clubId: mongoose.Types.ObjectId;
  eventType: string;
  userId?: string;
  timestamp: Date;
}

const ClubAnalyticsEventSchema = new Schema<IClubAnalyticsEvent>(
  {
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: "clubanalyticevents",
  },
);

ClubAnalyticsEventSchema.index({ clubId: 1, timestamp: -1 });
ClubAnalyticsEventSchema.index({ eventType: 1, clubId: 1 });

const ClubAnalyticsEvent: Model<IClubAnalyticsEvent> =
  mongoose.models.ClubAnalyticsEvent ||
  mongoose.model<IClubAnalyticsEvent>("ClubAnalyticsEvent", ClubAnalyticsEventSchema);

export { ClubAnalyticsEvent };
