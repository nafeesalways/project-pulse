// src/app/page.js
"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">ProjectPulse</h1>
        <p className="text-gray-600 mb-6">
          Client Feedback & Project Health Monitoring System
        </p>
        
        <div className="space-y-3">
          <Link 
            href="/login"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Login to Dashboard
          </Link>
          
          <div className="text-xs text-gray-500 pt-4 border-t">
            <p className="font-semibold mb-1">Demo Accounts:</p>
            <p>Admin: admin@test.com / admin123</p>
            <p>Employee: emp1@test.com / 123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
