"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    console.log("🔵 Login attempt:", formData.email);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        // Save to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        console.log("Saved to localStorage");

        // Show success toast
        toast.success("Login successful!");

        // Determine redirect URL
        const redirectUrl =
          data.user.role === "admin"
            ? "/dashboard/admin"
            : data.user.role === "employee"
            ? "/dashboard/employee"
            : "/dashboard/client";

        console.log("Redirecting to:", redirectUrl);

        // Hard redirect
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 800);
      } else {
        toast.error(data.message || "Invalid credentials");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Connection error. Please try again.");
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Toaster position="top-right" />

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ProjectPulse
          </h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Demo Accounts:
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fillDemo("admin@test.com", "admin123")}
              className="w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:underline py-1"
            >
              👤 <strong>Admin:</strong> admin@test.com / admin123
            </button>
            <button
              type="button"
              onClick={() => fillDemo("emp1@test.com", "123")}
              className="w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:underline py-1"
            >
              👤 <strong>Employee:</strong> emp1@test.com / 123
            </button>
            <button
              type="button"
              onClick={() => fillDemo("client1@test.com", "123")}
              className="w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:underline py-1"
            >
              👤 <strong>Client:</strong> client1@test.com / 123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
