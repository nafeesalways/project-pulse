// src/app/dashboard/client/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!token || storedUser?.role !== "client") {
      toast.error("Access Denied");
      router.push("/login");
      return;
    }
    setUser(storedUser);
    fetchClientProjects(storedUser._id);
  }, [router]);

  const fetchClientProjects = async (clientId) => {
    try {
      // We can reuse the same API logic but filter by clientId
      // Need to create a new API route or update the existing one to handle 'clientId' query
      // For simplicity, let's create a specific one or use a smart query
      const res = await fetch(`/api/projects/client-projects?clientId=${clientId}`);
      if (res.ok) {
        setProjects(await res.json());
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

  if (loading) return <div className="p-10 text-center">Loading Projects...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">ProjectPulse Client Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{user?.name}</span>
          <button onClick={handleLogout} className="text-red-500 font-medium text-sm">Logout</button>
        </div>
      </nav>

      <main className="p-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Your Active Projects</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{project.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  project.status === 'On Track' ? 'bg-green-100 text-green-700' : 
                  project.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {project.status}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => router.push(`/projects/${project._id}/feedback`)}
                  className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
                >
                  Give Weekly Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
