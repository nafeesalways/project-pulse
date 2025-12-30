import { verifyToken } from "@/lib/jwt-edge";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ["/", "/login"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // API auth routes
  if (pathname === "/api/auth/login" || pathname === "/api/auth/logout") {
    return NextResponse.next();
  }

  // Dashboard protection
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      console.log("⚠️ No token found");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decoded = await verifyToken(token);
      console.log("Token valid:", decoded.email);

      // Role-based access
      if (pathname.startsWith("/dashboard/admin") && decoded.role !== "admin") {
        console.log("Not admin");
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (pathname.startsWith("/dashboard/employee") && decoded.role !== "employee") {
        console.log("Not employee");
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (pathname.startsWith("/dashboard/client") && decoded.role !== "client") {
        console.log("Not client");
        return NextResponse.redirect(new URL("/login", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.log("Token verification failed:", error.message);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  // API routes protection
  if (pathname.startsWith("/api/")) {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    try {
      await verifyToken(token);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { message: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
