"use client";

import { apiRequest } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    clientId: "",
    employeeId: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log("🔍 Checking auth...");
    console.log("Token exists:", !!token);
    console.log("User exists:", !!storedUser);

    if (!token || !storedUser) {
      console.log("No auth, redirecting to login...");
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    console.log("User role:", parsedUser.role);

    if (parsedUser.role !== "admin") {
      console.log("Not admin, redirecting...");
      toast.error("Unauthorized! Admin access only");
      router.push("/login");
      return;
    }

    console.log("Auth successful");
    setUser(parsedUser);
    fetchProjects();
    fetchUsers();
  }, [router]);

  const fetchProjects = async () => {
    try {
      const data = await apiRequest("/api/projects");
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch clients
      const clientsData = await apiRequest("/api/users?role=client");
      setClients(clientsData);

      // Fetch employees
      const employeesData = await apiRequest("/api/users?role=employee");
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.clientId) {
      toast.error("Please select a client");
      setLoading(false);
      return;
    }

    if (!formData.employeeId) {
      toast.error("Please select an employee");
      setLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      clientId: formData.clientId,
      employeeIds: [formData.employeeId],
      status: "On Track",
      healthScore: 100,
    };

    try {
      await apiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Project Created Successfully!");
      setShowModal(false);
      fetchProjects();
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        clientId: "",
        employeeId: "",
      });
    } catch (error) {
      console.error("Create project error:", error);
      toast.error(error.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookie
      await fetch("/api/auth/logout", { method: "POST" });

      // Clear localStorage
      localStorage.clear();

      // Show message
      toast.success("Logged out successfully");

      // Redirect to login
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Toaster position="top-right" />

      {/* Navbar */}
      <nav className="bg-white shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-10 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-blue-600 flex items-center gap-2">
            ⚡ ProjectPulse
          </h1>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome, <strong>{user.name}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="text-red-500 font-medium hover:bg-red-50 px-4 py-2 rounded transition text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Dashboard Overview
            </h2>
            <p className="text-gray-500 text-sm">
              Manage your projects and team health.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-medium"
          >
            + Create New Project
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Projects</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {projects.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Clients</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {clients.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Team Members</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {employees.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👨‍💻</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">All Projects</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Project Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Health Score
                  </th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Deadline
                  </th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-10 text-gray-500 text-sm"
                    >
                      No projects found. Start by creating one! 🚀
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr
                      key={project._id}
                      className="hover:bg-blue-50 transition duration-150"
                    >
                      <td className="py-3 px-4 font-medium text-gray-800 text-sm">
                        {project.name}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                            project.status === "On Track"
                              ? "bg-green-100 text-green-700"
                              : project.status === "Critical"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="font-bold text-xs sm:text-sm min-w-8.75">
                            {project.healthScore}%
                          </span>
                          <div className="w-16 sm:w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
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
                      </td>
                      <td className="py-3 px-4 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                        {new Date(project.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            router.push(`/projects/${project._id}/timeline`)
                          }
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline whitespace-nowrap"
                        >
                          View Timeline
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8 overflow-hidden">
            <div className="p-4 sm:p-6 border-b bg-gray-50">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                Launch New Project
              </h3>
            </div>

            <form
              onSubmit={handleCreateProject}
              className="p-4 sm:p-6 space-y-4 sm:space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Website Redesign"
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-900 bg-white"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Brief project description..."
                  rows="3"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-900 bg-white"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-gray-300 p-2 rounded-lg text-sm text-gray-900 bg-white"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-gray-300 p-2 rounded-lg text-sm text-gray-900 bg-white"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Client *
                  </label>
                  <select
                    className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-sm text-gray-900"
                    required
                    value={formData.clientId}
                    onChange={(e) =>
                      setFormData({ ...formData, clientId: e.target.value })
                    }
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Developer *
                  </label>
                  <select
                    className="w-full border border-gray-300 p-2.5 rounded-lg bg-white text-sm text-gray-900"
                    required
                    value={formData.employeeId}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeId: e.target.value })
                    }
                  >
                    <option value="">-- Select Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400 flex items-center justify-center gap-2 text-sm"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {loading ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
