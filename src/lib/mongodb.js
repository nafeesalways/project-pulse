import { MongoClient } from "mongodb";

let client = null;
let clientPromise = null;

async function connectToDatabase() {
  if (clientPromise) {
    return clientPromise;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'Invalid/Missing environment variable: "MONGODB_URI"'
    );
  }

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000, // Increased to 10 seconds
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    w: 'majority',
  };

  try {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
    
    // Test connection
    const connected = await clientPromise;
    await connected.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB connected successfully");
    
    return clientPromise;
  } catch (e) {
    console.error("❌ MongoDB connection failed:", e);
    clientPromise = null; // Reset on failure
    throw e;
  }
}

export default connectToDatabase;
