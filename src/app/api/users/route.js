// src/app/api/users/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role"); // e.g. /api/users?role=client

    const client = await clientPromise;
    const db = client.db();

    let query = {};
    
    // If a specific role is requested, filter by it (exclude sensitive fields like password)
    if (role) {
      query.role = role;
    }

    const users = await db.collection("users")
      .find(query)
      .project({ name: 1, email: 1, role: 1 }) // Only return necessary fields
      .toArray();

    return NextResponse.json(users);

  } catch (error) {
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}
