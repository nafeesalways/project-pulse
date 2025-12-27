// src/app/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

  useEffect(() => {
    // Automatically redirect to login page
    router.push("/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">ProjectPulse</h1>
        <p className="text-gray-500">Redirecting to login...</p>
      </div>
    </div>
  );
}
