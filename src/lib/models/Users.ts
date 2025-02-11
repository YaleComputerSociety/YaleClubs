import { Schema, Document, model, models } from "mongoose";

export enum Role {
  Admin = "Admin",
  User = "User",
}

export interface IUsers extends Document {
  netid: string;
  followedClubs: string[];
  role: Role;
}

const UsersSchema = new Schema<IUsers>({
  netid: { type: String, required: true, unique: true },
  followedClubs: [{ type: Schema.Types.ObjectId, ref: "Club" }],
  role: { type: String, enum: Object.values(Role), default: Role.User },
});

const Users = models.Users || model<IUsers>("Users", UsersSchema);

export default Users;
