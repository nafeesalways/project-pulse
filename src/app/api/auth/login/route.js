import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1.database connection
    const client = await clientPromise;
    const db = client.db();

    // ২. searching user
    const user = await db.collection("users").findOne({ email });

   
    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ৪. generate JWT 
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // 1 day token validity
    );

    // ৫. response successfully
    const { password: _, ...userWithoutPassword } = user; 

    return NextResponse.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
