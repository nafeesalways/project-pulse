// src/app/api/check-ins/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const body = await request.json();
    const { projectId, progress, confidence, blockers, risks } = body;

    if (!projectId || !progress || !confidence) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 1. Insert Check-in Data
    const checkIn = {
      projectId: new ObjectId(projectId),
      progress: parseInt(progress), // 0-100
      confidence: parseInt(confidence), // 1-5
      blockers: blockers || "",
      week: getWeekNumber(new Date()), // Helper function to get current week number
      submittedAt: new Date(),
    };

    await db.collection("checkIns").insertOne(checkIn);

    // 2. Insert Risks if any
    if (risks && risks.length > 0) {
      const riskDocs = risks.map(r => ({
        projectId: new ObjectId(projectId),
        title: r.title,
        severity: r.severity, // Low, Medium, High
        status: "Open",
        createdAt: new Date()
      }));
      await db.collection("risks").insertMany(riskDocs);
    }

    // 3. 🧠 RECALCULATE HEALTH SCORE LOGIC 🧠
    // Fetch latest data to update score
    const allCheckIns = await db.collection("checkIns")
      .find({ projectId: new ObjectId(projectId) })
      .sort({ submittedAt: -1 })
      .limit(1) // Get only the latest check-in
      .toArray();
      
    const latestCheckIn = allCheckIns[0];

    const openRisks = await db.collection("risks").countDocuments({
      projectId: new ObjectId(projectId),
      status: "Open",
      severity: "High" // Only high severity risks impact score heavily
    });

    // --- SCORING ALGORITHM ---
    // Base Score: 100
    // Confidence Impact: (5 - Confidence) * 10 points penalty
    // Progress Gap: If progress is significantly behind (simple logic for now)
    // Risk Penalty: 15 points per High Risk
    
    let newHealthScore = 100;

    // Penalty for low confidence
    if (latestCheckIn) {
      const confidencePenalty = (5 - latestCheckIn.confidence) * 10; 
      newHealthScore -= confidencePenalty;
    }

    // Penalty for risks
    const riskPenalty = openRisks * 15;
    newHealthScore -= riskPenalty;

    // Cap score between 0 and 100
    newHealthScore = Math.max(0, Math.min(100, newHealthScore));

    // Determine Status based on Score
    let newStatus = "On Track";
    if (newHealthScore < 60) newStatus = "Critical";
    else if (newHealthScore < 80) newStatus = "At Risk";

    // 4. Update Project with new Score and Status
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

    return NextResponse.json({ 
      message: "Check-in submitted & Health Score updated!", 
      newHealthScore,
      newStatus 
    });

  } catch (error) {
    console.error("Check-in Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Helper to get week number
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}
