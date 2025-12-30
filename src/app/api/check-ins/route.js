import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/jwt";

function getTokenFromRequest(request) {
  const authHeader = request.headers.get("Authorization");
  return authHeader?.replace("Bearer ", "");
}

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const client = await clientPromise;
    const db = client.db();

    let query = {};
    if (projectId) {
      query.projectId = new ObjectId(projectId);
    }

    const checkIns = await db
      .collection("checkIns")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error("Check-ins GET error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    console.log("Check-in API authenticated:", decoded.email);

    // Only employees can submit check-ins
    if (decoded.role !== "employee") {
      return NextResponse.json(
        { message: "Only employees can submit check-ins" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { projectId, progress, achievements, challenges, nextSteps } = body;

    // Validation
    if (!projectId || progress === undefined) {
      return NextResponse.json(
        { message: "Project ID and progress are required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { message: "Invalid project ID" },
        { status: 400 }
      );
    }

    if (progress < 0 || progress > 100) {
      return NextResponse.json(
        { message: "Progress must be between 0 and 100" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if project exists
    const project = await db
      .collection("projects")
      .findOne({ _id: new ObjectId(projectId) });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Check if user is assigned to this project
    const isAssigned = project.employeeIds?.some(
      id => id.toString() === decoded.userId
    );

    if (!isAssigned) {
      return NextResponse.json(
        { message: "You are not assigned to this project" },
        { status: 403 }
      );
    }

    // Create check-in
    const checkIn = {
      projectId: new ObjectId(projectId),
      employeeId: decoded.userId,
      progress,
      achievements: achievements || "",
      challenges: challenges || "",
      nextSteps: nextSteps || "",
      createdAt: new Date(),
    };

    const result = await db.collection("checkIns").insertOne(checkIn);

    console.log("Check-in created:", result.insertedId);

    // Update project progress
    await db.collection("projects").updateOne(
      { _id: new ObjectId(projectId) },
      { $set: { lastCheckInDate: new Date() } }
    );

    return NextResponse.json({
      message: "Check-in submitted successfully",
      checkInId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Check-in POST error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to submit check-in" },
      { status: error.message === "Invalid token" ? 401 : 500 }
    );
  }
}
