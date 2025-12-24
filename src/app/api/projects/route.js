// src/app/api/projects/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: Fetch all projects (For Admin Dashboard)
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Fetch all projects sorted by creation date (newest first)
    const projects = await db.collection("projects").find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new project (Admin Only)
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // 1. Get data from request body
    const body = await request.json();
    const { name, description, startDate, endDate, clientId, employeeIds } = body;

    // 2. Validate required fields
    if (!name || !startDate || !endDate || !clientId) {
      return NextResponse.json(
        { message: "Missing required fields (name, dates, client)" },
        { status: 400 }
      );
    }

    // 3. Create project object
    const newProject = {
      name,
      description: description || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "On Track", // Default status
      healthScore: 100, // Initial perfect score
      clientId: new ObjectId(clientId), // Convert string ID to ObjectId
      assignedEmployees: employeeIds.map(id => new ObjectId(id)), // Convert array of strings to ObjectIds
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 4. Insert into database
    const result = await db.collection("projects").insertOne(newProject);

    return NextResponse.json(
      { message: "Project created successfully", projectId: result.insertedId },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
