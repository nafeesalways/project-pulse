import { MongoClient } from "mongodb";

let cachedClient = null;
let cachedDb = null;

export default async function connectToDatabase() {
  // Return cached connection if exists
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Please define MONGODB_URI environment variable');
  }

  const options = {
    // Increase timeouts for serverless environment
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 75000,
    connectTimeoutMS: 30000,
    
    // Connection pool settings
    maxPoolSize: 10,
    minPoolSize: 1,
    
    // Write concern
    retryWrites: true,
    w: 'majority',
  };

  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const client = new MongoClient(uri, options);
    await client.connect();
    
    const db = client.db('projectpulse');
    
    // Test connection
    await db.admin().ping();
    
    console.log('✅ MongoDB connected successfully');
    
    // Cache the connection
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}
