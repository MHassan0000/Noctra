import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;
// Use environment variable or default to "Noctra" (capitalized) to match existing database
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "Noctra";

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URL) {
    throw new Error("Please define the MONGODB_URL environment variable inside .env.local");
  }

  // Extract database name from connection string if present
  const urlParts = MONGODB_URL.split('/');
  const urlDbName = urlParts.length > 3 ? urlParts[3].split('?')[0] : null;

  const connectionOptions: mongoose.ConnectOptions = {
    bufferCommands: false,
  };

  // Use database name from connection string if present, otherwise use configured name
  // This ensures we use the correct case-sensitive database name
  if (urlDbName && urlDbName.trim()) {
    // Database name is already in the connection string, don't override
    // Mongoose will use the database from the connection string
  } else {
    // No database name in connection string, use the configured one
    connectionOptions.dbName = MONGODB_DB_NAME;
  }

  cached.promise = cached.promise || mongoose.connect(MONGODB_URL, connectionOptions);
  cached.conn = await cached.promise;
  return cached.conn;
}





