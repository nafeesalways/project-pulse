// Example: src/app/api/projects/route.js
import { verifyToken } from "@/lib/jwt";

export async function GET(request) {
  // Extract token from headers
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized - No token provided" },
      { status: 401 }
    );
  }

  try {
    // Verify token
    const decoded = verifyToken(token);
    
    // Check role
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    // Proceed with API logic
    const projects = await db.collection("projects").find().toArray();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid token" },
      { status: 401 }
    );
  }
}
