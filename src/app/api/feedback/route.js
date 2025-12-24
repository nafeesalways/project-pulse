// src/app/api/feedback/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const body = await request.json();
    const { projectId, rating, communicationRating, comments } = body;

    if (!projectId || !rating || !communicationRating) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 1. Save Feedback
    const feedback = {
      projectId: new ObjectId(projectId),
      rating: parseInt(rating), // 1-5
      communicationRating: parseInt(communicationRating), // 1-5
      comments: comments || "",
      submittedAt: new Date(),
    };

    await db.collection("feedbacks").insertOne(feedback);

    // 2. 🧠 RECALCULATE HEALTH SCORE (Simplified) 🧠
    // We fetch the project's current score and adjust it based on this new feedback
    // In a real app, you'd fetch all recent data points again. 
    // Here, we apply a direct impact.
    
    const project = await db.collection("projects").findOne({ _id: new ObjectId(projectId) });
    let currentScore = project.healthScore || 100;

    // Logic: 
    // Rating 5 -> No change or +5 (Bonus)
    // Rating 4 -> No change
    // Rating 3 -> -10 points
    // Rating 1-2 -> -20 points
    
    let adjustment = 0;
    if (rating === 5) adjustment = 5;
    else if (rating === 3) adjustment = -10;
    else if (rating < 3) adjustment = -20;

    let newHealthScore = Math.min(100, Math.max(0, currentScore + adjustment));

    // Determine Status
    let newStatus = "On Track";
    if (newHealthScore < 60) newStatus = "Critical";
    else if (newHealthScore < 80) newStatus = "At Risk";

    // 3. Update Project
    await db.collection("projects").updateOne(
      { _id: new ObjectId(projectId) },
      { 
        $set: { 
          healthScore: newHealthScore,
          status: newStatus,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ message: "Feedback submitted successfully!", newHealthScore });

  } catch (error) {
    console.error("Feedback Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
