"use client";

import { apiRequest } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function TimelinePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  const [project, setProject] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    fetchTimeline();
  }, [projectId]);

  const fetchTimeline = async () => {
    try {
      const data = await apiRequest(`/api/projects/${projectId}/timeline`);
      setProject(data.project);
      setActivities(data.activities);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      toast.error("Failed to load timeline");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading timeline...</p>
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
            onClick={handleBack}
            className="text-blue-600 hover:underline"
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800 font-medium mb-3 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                 Project Activity Timeline
              </h1>
              <p className="text-gray-600 mt-1">
                Track all check-ins, feedback, and risks chronologically
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Project Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {project.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`inline-block px-3 py-1 text-xs font-medium rounded-full mt-1 ${
                  project.status === "On Track"
                    ? "bg-green-100 text-green-700"
                    : project.status === "Critical"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {project.status || "On Track"}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Health Score</p>
              <p className="text-lg font-bold text-gray-800 mt-1">
                {project.healthScore || 100}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="text-sm font-medium text-gray-800 mt-1">
                {new Date(project.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Deadline</p>
              <p className="text-sm font-medium text-gray-800 mt-1">
                {new Date(project.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Check-ins</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalCheckIns}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Feedback</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalFeedbacks}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Risks</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.totalRisks}
              </p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Activity Timeline
          </h3>

          {activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Activities Yet
              </h3>
              <p className="text-gray-500">
                Check-ins, feedback, and risks will appear here once submitted.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <ActivityCard key={index} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ActivityCard({ activity }) {
  const typeConfig = {
    "check-in": {
      icon: "✅",
      color: "blue",
      label: "Check-in",
    },
    feedback: {
      icon: "💬",
      color: "green",
      label: "Feedback",
    },
    risk: {
      icon: "⚠️",
      color: "red",
      label: "Risk",
    },
  };

  const config = typeConfig[activity.type] || typeConfig["check-in"];

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full bg-${config.color}-100 flex items-center justify-center shrink-0`}
        >
          <span className="text-xl">{config.icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded bg-${config.color}-100 text-${config.color}-700`}
            >
              {config.label}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(activity.createdAt).toLocaleString()}
            </span>
          </div>
          {activity.progress && (
            <p className="text-sm font-medium text-gray-700 mb-1">
              Progress: {activity.progress}%
            </p>
          )}
          <p className="text-sm text-gray-600">
            {activity.description || activity.message || "No description"}
          </p>
          {activity.severity && (
            <span
              className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                activity.severity === "High"
                  ? "bg-red-100 text-red-700"
                  : activity.severity === "Medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {activity.severity} Severity
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
