import { Schema, Document, model, models } from "mongoose";

export interface IUsers extends Document {
  netid: string;
  followedClubs: string[];
  role?: string;
}

const UsersSchema = new Schema<IUsers>({
  netid: { type: String, required: true, unique: true },
  followedClubs: [{ type: Schema.Types.ObjectId, ref: "Club" }],
  role: { type: String },
});

const Users = models.Users || model<IUsers>("Users", UsersSchema);

export default Users;
