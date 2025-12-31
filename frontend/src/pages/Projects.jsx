import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { 
  FolderOpen, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Loader2,
  Settings2,
  CheckCircle2
} from 'lucide-react';

const Projects = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/user/List_Projek');
        if (response.data.success) {
          setData({
            projects: response.data.projects,
            stats: {
              total: response.data.projects.length,
              inProgress: response.data.projects.filter(p => p.status === 'On Track').length,
              completed: response.data.projects.filter(p => p.status === 'Completed').length,
              growth: '+0%'
            }
          });
        } else {
          setError('Gagal mengambil data proyek');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Terjadi kesalahan koneksi ke server');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-10 h-10 text-[#0BBDC7] animate-spin" />
        </div>
      </Layout>
    );
  }

  const { stats, projects } = data;

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-[#111827]">Projects Overview</h1>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Filter</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0DEDF2] text-[#134E4A] font-bold rounded-xl hover:bg-[#0BBDC7] transition-all shadow-sm active:scale-95">
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Projects</p>
                <p className="text-3xl font-bold text-[#111827] mt-1">{stats.total}</p>
                <p className="text-xs text-emerald-600 font-medium mt-2">↑ {stats.growth} from last month</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <FolderOpen className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-3xl font-bold text-[#111827] mt-1">{stats.inProgress}</p>
                <p className="text-xs text-gray-400 mt-2">Active construction sites</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
                <Settings2 className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-[#111827] mt-1">{stats.completed}</p>
                <p className="text-xs text-gray-400 mt-2">This fiscal year</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search projects by name or ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0DEDF2]/20 focus:border-[#0DEDF2]"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Project Name</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Team</th>
                  <th className="px-6 py-4 text-right">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{project.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">ID: {project.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{project.location}</p>
                      <p className="text-xs text-gray-400 mt-0.5">DKI Jakarta</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                          <svg className="w-10 h-10 transform -rotate-90">
                            <circle className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="transparent" r="16" cx="20" cy="20" />
                            <circle className="text-[#0DEDF2]" strokeWidth="3" strokeDasharray={100} strokeDashoffset={100 - project.progress} strokeLinecap="round" stroke="currentColor" fill="transparent" r="16" cx="20" cy="20" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{project.progress}%</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium italic">Done</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        project.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                        project.status === 'Delayed' ? 'bg-red-50 text-red-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {(project.team || []).map((avatar, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                             <span className="text-[10px] font-bold text-gray-500">U{i}</span>
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-gray-400">+{(project.team_count || 5)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-600">{project.dueDate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
             <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-900">1</span> to <span className="font-semibold text-gray-900">5</span> of <span className="font-semibold text-gray-900">24</span> results</p>
             <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-200 rounded-md bg-white text-xs disabled:opacity-50" disabled>&lt;</button>
                <button className="px-3 py-1 bg-[#0DEDF2] text-[#134E4A] rounded-md text-xs font-bold">1</button>
                <button className="px-3 py-1 border border-gray-200 rounded-md bg-white text-xs">2</button>
                <button className="px-3 py-1 border border-gray-200 rounded-md bg-white text-xs">3</button>
                <button className="px-3 py-1 border border-gray-200 rounded-md bg-white text-xs">...</button>
                <button className="px-3 py-1 border border-gray-200 rounded-md bg-white text-xs">&gt;</button>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
