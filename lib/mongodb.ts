import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

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
        cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
            return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectToDatabase;
