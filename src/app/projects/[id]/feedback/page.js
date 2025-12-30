"use client";

import { apiRequest } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function FeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  const [project, setProject] = useState(null);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== "client") {
      toast.error("Only clients can submit feedback");
      router.push("/login");
      return;
    }

    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const data = await apiRequest(`/api/projects/${projectId}/timeline`);
      setProject(data.project);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setSubmitting(true);

    try {
      await apiRequest("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          message,
          rating,
        }),
      });

      toast.success("Feedback submitted successfully!");
      setMessage("");
      setRating(5);

      // Redirect after 1 second
      setTimeout(() => {
        router.push("/dashboard/client");
      }, 1000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(error.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Project Not Found
          </h2>
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:underline"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-800 font-medium mb-3 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              💬 Submit Feedback
            </h1>
            <p className="text-gray-600 mt-1">
              Share your thoughts on project progress
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Project Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {project.name}
          </h2>
          <p className="text-sm text-gray-600">{project.description}</p>
          <div className="mt-4 flex items-center gap-4">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                project.status === "On Track"
                  ? "bg-green-100 text-green-700"
                  : project.status === "Critical"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {project.status || "On Track"}
            </span>
            <span className="text-sm text-gray-600">
              Health: <strong>{project.healthScore || 100}%</strong>
            </span>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Project Progress (1-5)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition ${
                      star <= rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </button>
                ))}
                <span className="ml-3 text-gray-600 font-medium">
                  {rating} / 5
                </span>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows="6"
                placeholder="Share your thoughts, concerns, or suggestions..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:bg-indigo-400 flex items-center justify-center gap-2"
              >
                {submitting && (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
