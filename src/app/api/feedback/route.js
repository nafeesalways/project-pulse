export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


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

    const feedbacks = await db
      .collection("feedbacks")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Feedback GET error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch feedbacks" },
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
    console.log("Feedback API authenticated:", decoded.email);

    // Only clients can submit feedback
    if (decoded.role !== "client") {
      return NextResponse.json(
        { message: "Only clients can submit feedback" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { projectId, message, rating } = body;

    // Validation
    if (!projectId || !message) {
      return NextResponse.json(
        { message: "Project ID and message are required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { message: "Invalid project ID" },
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

    // Check if user is the client of this project
    if (project.clientId?.toString() !== decoded.userId) {
      return NextResponse.json(
        { message: "You can only provide feedback for your own projects" },
        { status: 403 }
      );
    }

    // Create feedback
    const feedback = {
      projectId: new ObjectId(projectId),
      clientId: decoded.userId,
      message,
      rating: rating || null,
      createdAt: new Date(),
    };

    const result = await db.collection("feedbacks").insertOne(feedback);

    console.log("Feedback created:", result.insertedId);

    return NextResponse.json({
      message: "Feedback submitted successfully",
      feedbackId: result.insertedId,
    });
  } catch (error) {
    console.error("Feedback POST error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to submit feedback" },
      { status: error.message === "Invalid token" ? 401 : 500 }
    );
  }
}
