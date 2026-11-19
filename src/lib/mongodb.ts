import mongoose, { Mongoose } from "mongoose";

/* eslint-disable no-var */
declare global {
  var mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null };
}
/* eslint-enable no-var */

global.mongoose = global.mongoose || { conn: null, promise: null };

const cached = global.mongoose;

async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("Please define the MONGODB_URI environment variable");
    }

    cached.promise = mongoose.connect(uri).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
