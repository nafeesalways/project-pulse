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
      return NextResponse.json(
        { message: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    console.log("✅ API authenticated:", decoded.email);

    const client = await clientPromise;
    const db = client.db();

    let query = {};

    // Role-based filtering
    if (decoded.role === "employee") {
      query = { "employeeIds": decoded.userId };
    } else if (decoded.role === "client") {
      query = { clientId: decoded.userId };
    }

    const projects = await db
      .collection("projects")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // ✅ Convert ObjectId to string for frontend
    const projectsWithStringIds = projects.map(project => ({
      ...project,
      _id: project._id.toString(),
      clientId: project.clientId?.toString?.() || project.clientId,
      employeeIds: project.employeeIds?.map?.(id => 
        id?.toString?.() || id
      ) || project.employeeIds,
      createdBy: project.createdBy?.toString?.() || project.createdBy,
    }));

    console.log(`📊 Projects found: ${projectsWithStringIds.length}`);

    return NextResponse.json(projectsWithStringIds);
  } catch (error) {
    console.error("❌ Projects API error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch projects" },
      { status: error.message === "Invalid token" ? 401 : 500 }
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

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const newProject = {
      ...body,
      createdAt: new Date(),
      createdBy: decoded.userId,
    };

    const result = await db.collection("projects").insertOne(newProject);

    return NextResponse.json({
      message: "Project created successfully",
      projectId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("❌ Create project error:", error);
    return NextResponse.json(
      { message: "Failed to create project" },
      { status: 500 }
    );
  }
}
