"use client";

import { apiRequest } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log("Client auth check...");

    if (!token || !storedUser) {
      console.log("❌ No auth");
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role !== "client") {
      console.log("❌ Not client");
      toast.error("Access Denied - Client only");
      router.push("/login");
      return;
    }

    console.log("Client authenticated");
    setUser(parsedUser);
    fetchClientProjects();
  }, [router]);

  const fetchClientProjects = async () => {
    try {
      const data = await apiRequest("/api/projects");
      setProjects(data);
      console.log("Projects loaded:", data.length);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.clear();
      toast.success("Logged out successfully");
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Toaster position="top-right" />

      {/* Navbar */}
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-indigo-600">
               ProjectPulse
            </h1>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-medium">
              Client
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              👤 {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-red-500 font-medium text-sm hover:bg-red-50 px-3 py-1.5 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Your Active Projects
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Monitor progress and provide feedback on your projects
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Projects
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {projects.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Healthy</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {
                    projects.filter(
                      (p) => (p.healthScore || 100) >= 80
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Needs Attention
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {
                    projects.filter(
                      (p) => (p.healthScore || 100) < 80
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Projects Yet
            </h3>
            <p className="text-gray-500">
              Your assigned projects will appear here once created by the admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="p-5 sm:p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-1">
                      {project.name}
                    </h3>
                    <span
                      className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap shrink-0 ${
                        project.status === "On Track" || !project.status
                          ? "bg-green-100 text-green-700"
                          : project.status === "Critical"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {project.status || "On Track"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {project.description || "No description available"}
                  </p>

                  {/* Health Score */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500">
                      Health:
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            (project.healthScore || 100) >= 80
                              ? "bg-green-500"
                              : (project.healthScore || 100) >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${project.healthScore || 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 min-w-10 text-right">
                        {project.healthScore || 100}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body - Timeline Info */}
                <div className="p-4 sm:p-5 bg-gray-50 space-y-3 grow">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">📅 Start Date</span>
                    <span className="font-medium text-gray-700">
                      {new Date(project.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">🎯 Deadline</span>
                    <span className="font-medium text-gray-700">
                      {new Date(project.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Card Footer - Action Buttons */}
                <div className="p-4 sm:p-5 bg-white border-t border-gray-200 space-y-2">
                  <button
                    onClick={() =>
                      router.push(`/projects/${project._id}/timeline`)
                    }
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2"
                  >
                    View Timeline
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/projects/${project._id}/feedback`)
                    }
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition text-sm flex items-center justify-center gap-2"
                  >
                    Give Feedback
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
