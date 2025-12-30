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
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
    return clientPromise;
  } catch (e) {
    console.error("Failed to connect to MongoDB:", e);
    throw e;
  }
}

// Don't connect during build - export a function instead
export default connectToDatabase;
