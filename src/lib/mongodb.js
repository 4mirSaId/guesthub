import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable.');
}

const globalForMongoose = globalThis;

if (!globalForMongoose.__mongoose) {
  globalForMongoose.__mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectToDatabase() {
  const cached = globalForMongoose.__mongoose;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
