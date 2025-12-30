// src/app/api/projects/my-projects/route.js
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId"); // Employee ID

    if (!userId) {
      return NextResponse.json({ message: "User ID required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Query: Find projects where 'assignedEmployees' array contains this userId
    // Note: We cast userId to ObjectId to match database format
    const projects = await db.collection("projects").find({
      assignedEmployees: new ObjectId(userId)
    }).toArray();

    return NextResponse.json(projects);

  } catch (error) {
    console.error("Error fetching my projects:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
