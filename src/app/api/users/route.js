import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

function getTokenFromRequest(request) {
  const authHeader = request.headers.get("Authorization");
  return authHeader?.replace("Bearer ", "");
}

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const client = await clientPromise;
    const db = client.db();

    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await db
      .collection("users")
      .find(query)
      .project({ password: 0 }) // Don't send passwords
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error("Users API error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch users" },
      { status: error.message === "Invalid token" ? 401 : 500 }
    );
  }
}
