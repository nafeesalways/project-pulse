import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "projectpulse-super-secret-key-2024";

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("❌ JWT verification error:", error.message);
    throw new Error("Invalid token");
  }
}
