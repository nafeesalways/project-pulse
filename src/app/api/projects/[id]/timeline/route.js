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

export async function GET(request, { params }) {
  try {
    // Verify token
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    console.log("Timeline API authenticated:", decoded.email);

    //AWAIT params - Next.js 15+
    const { id: projectId } = await params;
    
    console.log("📋 Timeline API called for project:", projectId);

    // Validate ObjectId
    if (!projectId || !ObjectId.isValid(projectId)) {
      console.log("Invalid project ID:", projectId);
      return NextResponse.json(
        { message: "Invalid project ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get project
    const project = await db
      .collection("projects")
      .findOne({ _id: new ObjectId(projectId) });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Check access rights
    const isAdmin = decoded.role === "admin";
    const isAssignedEmployee = decoded.role === "employee" && 
      project.employeeIds?.some(id => id.toString() === decoded.userId);
    const isClient = decoded.role === "client" && 
      project.clientId?.toString() === decoded.userId;

    if (!isAdmin && !isAssignedEmployee && !isClient) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    // Fetch all timeline activities
    const checkIns = await db
      .collection("checkIns")
      .find({ projectId: new ObjectId(projectId) })
      .sort({ createdAt: -1 })
      .toArray();

    const feedbacks = await db
      .collection("feedbacks")
      .find({ projectId: new ObjectId(projectId) })
      .sort({ createdAt: -1 })
      .toArray();

    const risks = await db
      .collection("risks")
      .find({ projectId: new ObjectId(projectId) })
      .sort({ createdAt: -1 })
      .toArray();

    console.log("📊 Check-ins:", checkIns.length);
    console.log("📊 Feedbacks:", feedbacks.length);
    console.log("📊 Risks:", risks.length);

    // Combine all activities with type
    const activities = [
      ...checkIns.map(item => ({ ...item, type: "check-in" })),
      ...feedbacks.map(item => ({ ...item, type: "feedback" })),
      ...risks.map(item => ({ ...item, type: "risk" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log("Total activities:", activities.length);

    return NextResponse.json({
      project: {
        ...project,
        _id: project._id.toString(),
        clientId: project.clientId?.toString(),
        employeeIds: project.employeeIds?.map(id => id.toString()),
      },
      activities,
      stats: {
        totalCheckIns: checkIns.length,
        totalFeedbacks: feedbacks.length,
        totalRisks: risks.length,
      },
    });
  } catch (error) {
    console.error("❌ Timeline API error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to load timeline" },
      { status: error.message === "Invalid token" ? 401 : 500 }
    );
  }
}
