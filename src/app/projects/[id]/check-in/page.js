// src/app/projects/[id]/check-in/page.js
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function CheckInPage() {
  const router = useRouter();
  const params = useParams(); // Get project ID from URL
  const [loading, setLoading] = useState(false);

  // Form State
  const [progress, setProgress] = useState(50);
  const [confidence, setConfidence] = useState(5);
  const [blockers, setBlockers] = useState("");
  
  // Risk State (Simplified for demo)
  const [hasRisk, setHasRisk] = useState(false);
  const [riskTitle, setRiskTitle] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      projectId: params.id,
      progress,
      confidence,
      blockers,
      risks: hasRisk ? [{ title: riskTitle, severity: "High" }] : [] 
    };

    try {
      const res = await fetch("/api/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Check-in Submitted Successfully!");
        router.push("/dashboard/employee"); // Go back to dashboard
      } else {
        toast.error("Failed to submit check-in");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-2xl w-full rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
          📝 Weekly Project Check-in
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Progress Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Completion ({progress}%)
            </label>
            <input 
              type="range" min="0" max="100" 
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              value={progress} onChange={(e) => setProgress(e.target.value)}
            />
          </div>

          {/* Confidence Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidence Level (1-5)
            </label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setConfidence(level)}
                  className={`w-12 h-12 rounded-full font-bold transition ${
                    confidence === level 
                      ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-300" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              (1 = Panic Mode, 5 = Smooth Sailing)
            </p>
          </div>

          {/* Blockers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any Blockers or Challenges?
            </label>
            <textarea 
              rows="3"
              className="w-full border border-gray-300 rounded-lg p-3 text-black focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Describe what's slowing you down..."
              value={blockers} onChange={(e) => setBlockers(e.target.value)}
            />
          </div>

          {/* Risk Flagging (Optional) */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <input 
                type="checkbox" 
                id="risk"
                className="w-4 h-4 text-red-600 rounded"
                checked={hasRisk} onChange={(e) => setHasRisk(e.target.checked)}
              />
              <label htmlFor="risk" className="text-red-700 font-medium cursor-pointer">
                Raise a High Priority Risk?
              </label>
            </div>
            
            {hasRisk && (
              <input 
                type="text" required
                className="w-full mt-2 border border-red-200 rounded p-2 text-sm text-black"
                placeholder="Risk Title (e.g., API downtime, Requirement unclear)"
                value={riskTitle} onChange={(e) => setRiskTitle(e.target.value)}
              />
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md disabled:bg-blue-300"
            >
              {loading ? "Submitting..." : "Submit Check-in"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
