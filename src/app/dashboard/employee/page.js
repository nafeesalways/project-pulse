// src/app/dashboard/employee/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EmployeeDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!token || storedUser?.role !== "employee") {
      toast.error("Access Denied");
      router.push("/login");
      return;
    }
    setUser(storedUser);
    fetchMyProjects(storedUser._id);
  }, [router]);

  const fetchMyProjects = async (userId) => {
    try {
      const res = await fetch(`/api/projects/my-projects?userId=${userId}`);
      if (res.ok) {
        setProjects(await res.json());
      } else {
        toast.error("Failed to load projects");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ProjectPulse</h1>
          <p className="text-xs text-gray-500">Employee Portal</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800 transition font-medium"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">My Projects</h2>
          <p className="text-gray-500 mt-1">
            Manage your active projects and weekly check-ins.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-700">
              No Projects Assigned
            </h3>
            <p className="text-gray-500 mt-2">
              You have not been assigned to any active projects yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800">
                      {project.name}
                    </h3>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {project.description || "No description provided."}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-6 grow space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">
                        Health Score
                      </span>
                      <span className="font-bold text-gray-900">
                        {project.healthScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          project.healthScore >= 80
                            ? "bg-green-500"
                            : project.healthScore >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${project.healthScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-500 pt-2">
                    <span>Deadline</span>
                    <span className="font-medium text-gray-700">
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                  <button
                    onClick={() =>
                      router.push(`/projects/${project._id}/check-in`)
                    }
                    className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition duration-150 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  >
                    Submit Weekly Check-in
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

// Helper component for status colors
function StatusBadge({ status }) {
  const styles = {
    "On Track": "bg-green-100 text-green-700",
    "At Risk": "bg-yellow-100 text-yellow-800",
    Critical: "bg-red-100 text-red-700",
    Completed: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}
