import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for A/B Test Assignment document
export interface IABTestAssignment extends Document {
  userId: string; // Can be netid or a generated UUID for anonymous users
  testName: string;
  variation: string;
  assignedAt: Date;
}

// Interface for A/B Test Event document
export interface IABTestEvent extends Document {
  userId: string;
  testName: string;
  variation: string;
  eventType: string; // e.g., "view", "click", "conversion"
  eventData?: Record<string, any>; // Optional additional data
  timestamp: Date;
}

// Schema for A/B Test Assignments
const ABTestAssignmentSchema = new Schema<IABTestAssignment>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    testName: {
      type: String,
      required: true,
      index: true,
    },
    variation: {
      type: String,
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "abtestassignments",
  },
);

// Compound index to ensure one assignment per user per test
ABTestAssignmentSchema.index({ userId: 1, testName: 1 }, { unique: true });

// Schema for A/B Test Events
const ABTestEventSchema = new Schema<IABTestEvent>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    testName: {
      type: String,
      required: true,
      index: true,
    },
    variation: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    eventData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: "abtestevents",
  },
);

// Create indexes for efficient querying
ABTestEventSchema.index({ testName: 1, variation: 1, eventType: 1 });
ABTestEventSchema.index({ timestamp: -1 });

// Create or retrieve models
const ABTestAssignment: Model<IABTestAssignment> =
  mongoose.models.ABTestAssignment || mongoose.model<IABTestAssignment>("ABTestAssignment", ABTestAssignmentSchema);

const ABTestEvent: Model<IABTestEvent> =
  mongoose.models.ABTestEvent || mongoose.model<IABTestEvent>("ABTestEvent", ABTestEventSchema);

export { ABTestAssignment, ABTestEvent };
