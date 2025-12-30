export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  const client = await clientPromise;
  const db = client.db();

  const projects = await db.collection("projects").find({
    clientId: new ObjectId(clientId)
  }).toArray();

  return NextResponse.json(projects);
}
