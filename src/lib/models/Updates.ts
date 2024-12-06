import mongoose, { Schema } from "mongoose";

const updateSchema = new Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  updatedBy: { type: String, required: true },
  changes: { type: String },
});

const UpdateLog = mongoose.models.UpdateLog || mongoose.model("UpdateLog", updateSchema);

export default UpdateLog;
