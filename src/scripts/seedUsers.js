// src/scripts/seedUsers.js
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = "mongodb://127.0.0.1:27017/projectpulse";

async function seedUsers() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();
    const usersCollection = db.collection("users");

    // Clear existing users (optional)
    await usersCollection.deleteMany({});
    console.log("Cleared existing users");

    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 10);
    const empPassword = await bcrypt.hash("123", 10);
    const clientPassword = await bcrypt.hash("123", 10);

    // Insert users
    const users = [
      {
        name: "Admin User",
        email: "admin@test.com",
        password: adminPassword,
        role: "admin",
        createdAt: new Date(),
      },
      {
        name: "John Doe",
        email: "emp1@test.com",
        password: empPassword,
        role: "employee",
        createdAt: new Date(),
      },
      {
        name: "Jane Smith",
        email: "emp2@test.com",
        password: empPassword,
        role: "employee",
        createdAt: new Date(),
      },
      {
        name: "Client A",
        email: "client1@test.com",
        password: clientPassword,
        role: "client",
        createdAt: new Date(),
      },
      {
        name: "Client B",
        email: "client2@test.com",
        password: clientPassword,
        role: "client",
        createdAt: new Date(),
      },
    ];

    const result = await usersCollection.insertMany(users);
    console.log(`Inserted ${result.insertedCount} users`);

    // Show inserted users (without passwords)
    const insertedUsers = await usersCollection
      .find({})
      .project({ password: 0 })
      .toArray();

    console.log("\n📋 Users created:");
    insertedUsers.forEach((user) => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    console.log("\n🎉 Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seedUsers();
