"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // Import toast

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for button
  
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    clientId: "",
    employeeIds: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!token || storedUser?.role !== "admin") {
      toast.error("Unauthorized! Please login."); // Toaster notification
      router.push("/login");
      return;
    }
    setUser(storedUser);
    fetchProjects();
    fetchUsers();
  }, [router]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) setProjects(await res.json());
    } catch (e) {
      toast.error("Failed to load projects");
    }
  };

  const fetchUsers = async () => {
    try {
      const clientRes = await fetch("/api/users?role=client");
      if (clientRes.ok) setClients(await clientRes.json());

      const empRes = await fetch("/api/users?role=employee");
      if (empRes.ok) setEmployees(await empRes.json());
    } catch (e) {
      console.error("Error loading users");
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    
    const payload = {
      ...formData,
      employeeIds: formData.employeeIds.length > 0 ? formData.employeeIds : [employees[0]?._id]
    };

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Project Created Successfully! 🎉"); // Success Toast
        setShowModal(false);
        fetchProjects();
        setFormData({ name: "", description: "", startDate: "", endDate: "", clientId: "", employeeIds: [] });
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to create project"); // Error Toast
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  if (!user) return <div className="p-10 flex justify-center text-blue-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          ⚡ ProjectPulse <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Admin</span>
        </h1>
        <button onClick={handleLogout} className="text-red-500 font-medium hover:bg-red-50 px-3 py-1 rounded transition">Logout</button>
      </nav>

      <main className="p-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
             <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
             <p className="text-gray-500 text-sm">Manage your projects and team health.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center gap-2"
          >
            + Create New Project
          </button>
        </div>

        {/* Project List Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Project Name</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Health Score</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-10 text-gray-500">No projects found. Start by creating one! 🚀</td></tr>
              ) : (
                projects.map((project) => (
                  <tr key={project._id} className="hover:bg-blue-50 transition duration-150">
                    <td className="py-4 px-6 font-medium text-gray-800">{project.name}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        project.status === 'On Track' ? 'bg-green-100 text-green-700' : 
                        project.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm w-8">{project.healthScore}%</span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${project.healthScore >= 80 ? 'bg-green-500' : project.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${project.healthScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">{new Date(project.endDate).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b bg-gray-50">
               <h3 className="text-xl font-bold text-gray-800">🚀 Launch New Project</h3>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input 
                  type="text" placeholder="e.g. Website Redesign" required 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Date</label>
                  <input 
                    type="date" required 
                    className="w-full border border-gray-300 p-2 rounded-lg"
                    value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Date</label>
                  <input 
                    type="date" required 
                    className="w-full border border-gray-300 p-2 rounded-lg"
                    value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Client</label>
                  <select 
                    className="w-full border border-gray-300 p-2.5 rounded-lg bg-white" required
                    value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}
                  >
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead Developer</label>
                  <select 
                    className="w-full border border-gray-300 p-2.5 rounded-lg bg-white" required
                    onChange={e => setFormData({...formData, employeeIds: [e.target.value]})}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400 flex items-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
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
