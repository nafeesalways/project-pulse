import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request) {
  console.log('Login API called'); // Add this
  
  try {
    const { email, password } = await request.json();
    console.log(' Login attempt for:', email); // Add this

    if (!email || !password) {
      console.log('Missing credentials'); // Add this
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log('Connecting to MongoDB...'); // Add this
    const { db } = await connectToDatabase();
    console.log(' MongoDB connected'); // Add this
    
    const user = await db.collection("users").findOne({ email });
    console.log('User found:', !!user); // Add this

    if (!user) {
      console.log('User not found'); // Add this
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isValid); // Add this

    if (!isValid) {
      console.log('Invalid password'); // Add this
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    console.log('Login successful for:', user.email); // Add this

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message, error.stack); // Add this
    return NextResponse.json(
      { 
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
