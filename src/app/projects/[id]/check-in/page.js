"use client";

import { apiRequest } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function CheckInPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    progress: 0,
    achievements: "",
    challenges: "",
    nextSteps: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== "employee") {
      toast.error("Only employees can submit check-ins");
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

    if (formData.progress < 0 || formData.progress > 100) {
      toast.error("Progress must be between 0 and 100");
      return;
    }

    setSubmitting(true);

    try {
      await apiRequest("/api/check-ins", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          ...formData,
        }),
      });

      toast.success("Check-in submitted successfully!");

      // Redirect after 1 second
      setTimeout(() => {
        router.push("/dashboard/employee");
      }, 1000);
    } catch (error) {
      console.error("Error submitting check-in:", error);
      toast.error(error.message || "Failed to submit check-in");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
            className="text-green-600 hover:underline"
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
            className="text-green-600 hover:text-green-800 font-medium mb-3 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
               Submit Weekly Check-in
            </h1>
            <p className="text-gray-600 mt-1">
              Update your progress and share insights
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

        {/* Check-in Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Progress */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Progress (0-100%) *
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) =>
                    setFormData({ ...formData, progress: parseInt(e.target.value) })
                  }
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) =>
                    setFormData({ ...formData, progress: parseInt(e.target.value) })
                  }
                  className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center font-bold text-gray-900"
                />
                <span className="text-gray-600 font-medium">%</span>
              </div>
            </div>

            {/* Achievements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Achievements This Week
              </label>
              <textarea
                value={formData.achievements}
                onChange={(e) =>
                  setFormData({ ...formData, achievements: e.target.value })
                }
                rows="4"
                placeholder="What did you accomplish?"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900"
              />
            </div>

            {/* Challenges */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenges Faced
              </label>
              <textarea
                value={formData.challenges}
                onChange={(e) =>
                  setFormData({ ...formData, challenges: e.target.value })
                }
                rows="4"
                placeholder="Any blockers or issues?"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900"
              />
            </div>

            {/* Next Steps */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Steps
              </label>
              <textarea
                value={formData.nextSteps}
                onChange={(e) =>
                  setFormData({ ...formData, nextSteps: e.target.value })
                }
                rows="4"
                placeholder="What's planned for next week?"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900"
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
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:bg-green-400 flex items-center justify-center gap-2"
              >
                {submitting && (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {submitting ? "Submitting..." : "Submit Check-in"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
