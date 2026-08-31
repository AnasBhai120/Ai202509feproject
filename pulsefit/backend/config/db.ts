import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/FITNESS';

let isConnected = false;

export const connectDB = async () => {
  try {
    // Attempt Mongoose connection with reasonable timeout
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error: any) {
    console.warn(`[MongoDB] Local MongoDB connection notice (${MONGO_URI}): ${error.message}. Operating with in-memory resilient storage for preview environment.`);
    isConnected = false;
  }
};

export const getDbStatus = () => ({
  connected: isConnected,
  uri: MONGO_URI,
  dbName: 'FITNESS',
});
