// src/app/login/page.js
"use client"; // This is a client-side component

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Send POST request to our Login API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // 2. Store the JWT token and user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 3. Redirect based on user role (Admin, Employee, or Client)
      // We will create these dashboard routes in the next step
      if (data.user.role === "admin") {
        router.push("/dashboard/admin");
      } else if (data.user.role === "employee") {
        router.push("/dashboard/employee");
      } else if (data.user.role === "client") {
        router.push("/dashboard/client");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ProjectPulse</h1>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="admin@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-xs text-center text-gray-400">
          <p>Demo Credentials:</p>
          <p>Admin: admin@test.com / admin123</p>
          <p>Employee: emp1@test.com / 123</p>
        </div>
      </div>
    </div>
  );
}
