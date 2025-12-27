// src/app/projects/[id]/feedback/page.js
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function FeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [commRating, setCommRating] = useState(5);
  const [comments, setComments] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: params.id,
          rating,
          communicationRating: commRating,
          comments
        }),
      });

      if (res.ok) {
        toast.success("Feedback Submitted! Thank you.");
        router.push("/dashboard/client");
      } else {
        toast.error("Failed to submit feedback");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-lg w-full rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2"> Client Feedback</h1>
        <p className="text-gray-500 mb-6 text-sm">Your feedback helps us improve project delivery.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Overall Satisfaction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Satisfaction (1-5)
            </label>
            <div className="flex gap-2 justify-between">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`flex-1 py-2 rounded-lg border font-bold transition ${
                    rating === star 
                      ? "bg-yellow-400 border-yellow-500 text-white shadow-md" 
                      : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {star} ★
                </button>
              ))}
            </div>
          </div>

          {/* Communication Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communication Clarity (1-5)
            </label>
            <input 
              type="range" min="1" max="5" 
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              value={commRating} onChange={(e) => setCommRating(e.target.value)}
            />
            <div className="text-center text-sm font-bold text-blue-600 mt-1">{commRating} / 5</div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments
            </label>
            <textarea 
              rows="3"
              className="w-full border border-gray-300 rounded-lg p-3 text-black focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Any specific issues or compliments?"
              value={comments} onChange={(e) => setComments(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-md disabled:bg-indigo-300"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
