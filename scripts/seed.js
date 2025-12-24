// scripts/seed.js
const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" }); //read connection string from .env.local

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Please provide MONGODB_URI in .env.local file");
  process.exit(1);
}

const client = new MongoClient(uri);

async function runSeed() {
  try {
    await client.connect();
    console.log("Connected to MongoDB for seeding...");

    const db = client.db(); 
    const usersCollection = db.collection("users");

   
    await usersCollection.deleteMany({});

    const users = [
      {
        name: "Admin User",
        email: "admin@test.com",
        password: "admin123", 
        role: "admin",
      },
      {
        name: "Employee One",
        email: "emp1@test.com",
        password: "123",
        role: "employee",
      },
      {
        name: "Client One",
        email: "client1@test.com",
        password: "123",
        role: "client",
      },
    ];

    const result = await usersCollection.insertMany(users);
    console.log(`${result.insertedCount} users inserted!`);
    console.log("Database seeded successfully! 🎉");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

runSeed();
