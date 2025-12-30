const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// Use Atlas URI for production, localhost for dev
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/projectpulse";

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("🔄 Seeding database...");

    const db = client.db();

    // Clear existing data
    await db.collection("users").deleteMany({});
    await db.collection("projects").deleteMany({});

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const hashedPassword123 = await bcrypt.hash("123", 10);

    // Create users
    const users = [
      {
        name: "Admin User",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
      },
      {
        name: "Employee One",
        email: "emp1@test.com",
        password: hashedPassword123,
        role: "employee",
        createdAt: new Date(),
      },
      {
        name: "Employee Two",
        email: "emp2@test.com",
        password: hashedPassword123,
        role: "employee",
        createdAt: new Date(),
      },
      {
        name: "Client One",
        email: "client1@test.com",
        password: hashedPassword123,
        role: "client",
        createdAt: new Date(),
      },
      {
        name: "Client Two",
        email: "client2@test.com",
        password: hashedPassword123,
        role: "client",
        createdAt: new Date(),
      },
    ];

    const userResult = await db.collection("users").insertMany(users);
    console.log("✅ Users created:", userResult.insertedCount);

    // Get user IDs
    const allUsers = await db.collection("users").find({}).toArray();
    const adminUser = allUsers.find((u) => u.role === "admin");
    const emp1 = allUsers.find((u) => u.email === "emp1@test.com");
    const emp2 = allUsers.find((u) => u.email === "emp2@test.com");
    const client1 = allUsers.find((u) => u.email === "client1@test.com");
    const client2 = allUsers.find((u) => u.email === "client2@test.com");

    // Create projects
    const projects = [
      {
        name: "E-Commerce Platform",
        description: "Build a modern e-commerce website",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-06-30"),
        status: "On Track",
        healthScore: 85,
        clientId: client1._id,
        employeeIds: [emp1._id],
        createdBy: adminUser._id,
        createdAt: new Date(),
      },
      {
        name: "Mobile App Development",
        description: "iOS and Android app for inventory management",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-08-31"),
        status: "At Risk",
        healthScore: 65,
        clientId: client2._id,
        employeeIds: [emp2._id],
        createdBy: adminUser._id,
        createdAt: new Date(),
      },
    ];

    const projectResult = await db.collection("projects").insertMany(projects);
    console.log("Projects created:", projectResult.insertedCount);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await client.close();
  }
}

seed();
