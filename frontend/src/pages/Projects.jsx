import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  FolderOpen, 
  Search, 
  Plus, 
  MoreVertical, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BarChart3,
  ChevronRight,
  Loader2
} from 'lucide-react';
import PropTypes from 'prop-types';

// Presentational Components
const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  colorClass: PropTypes.string.isRequired,
};

const ProjectRow = ({ project }) => (
  <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
    <td className="py-4 px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
          <FolderOpen className="w-5 h-5 text-cyan-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 font-['Inter']">{project.name}</h4>
          <p className="text-xs text-gray-500 font-['Inter']">ID: PRJ-{String(project.id).padStart(3, '0')}</p>
        </div>
      </div>
    </td>
    <td className="py-4 px-6">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs text-gray-500 mb-1 font-['Inter']">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div 
            className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>
    </td>
    <td className="py-4 px-6 text-center">
      <span className="text-sm font-medium text-gray-700 font-['Inter']">{project.completedTasks} / {project.totalTasks}</span>
      <p className="text-[10px] text-gray-400 font-['Inter']">Tasks</p>
    </td>
    <td className="py-4 px-6">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border font-['Inter'] ${
        project.statusClass === 'completed' 
          ? 'bg-green-50 text-green-700 border-green-100' 
          : project.statusClass === 'in-progress'
          ? 'bg-blue-50 text-blue-700 border-blue-100'
          : 'bg-gray-50 text-gray-700 border-gray-100'
      }`}>
        {project.status}
      </span>
    </td>
    <td className="py-4 px-6 text-right">
      <Link to={`/user/tasks?id_proyek=${project.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-cyan-600 inline-block">
        <ChevronRight className="w-5 h-5" />
      </Link>
    </td>
  </tr>
);

ProjectRow.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    progress: PropTypes.number.isRequired,
    totalTasks: PropTypes.number.isRequired,
    completedTasks: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    statusClass: PropTypes.string.isRequired,
  }).isRequired,
};

// Container Component
const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    ongoingProjects: 0,
    activeTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/user/projects', {
          headers: {
            'Accept': 'application/json'
          }
        });
        if (response.data.success) {
          setProjects(response.data.projects);
          setStats(response.data.stats);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Gagal memuat data proyek');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-10 h-10 text-[#0BBDC7] animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-['Inter']">List Projek</h1>
          <p className="text-gray-500 text-sm mt-1 font-['Inter']">Kelola dan pantau semua proyek konstruksi Anda</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-[#0BBDC7] hover:bg-[#0AA8B1] text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm shadow-cyan-100 font-['Inter']">
          <Plus className="w-5 h-5" />
          <span>Tambah Projek Baru</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={BarChart3} 
          label="Total Projek" 
          value={stats.totalProjects} 
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Projek Selesai" 
          value={stats.completedProjects} 
          colorClass="bg-green-50 text-green-600"
        />
        <StatCard 
          icon={Clock} 
          label="Sedang Berjalan" 
          value={stats.ongoingProjects} 
          colorClass="bg-orange-50 text-orange-600"
        />
        <StatCard 
          icon={AlertCircle} 
          label="Tugas Aktif" 
          value={stats.activeTasks} 
          colorClass="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search & Filter Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama proyek..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-['Inter']"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-['Inter']">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Terbaru</span>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-all">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider font-['Inter']">Nama Projek</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider font-['Inter'] w-1/4">Progress</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider font-['Inter'] text-center">Tugas</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider font-['Inter']">Status</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.length > 0 ? (
                filteredProjects.map(project => (
                  <ProjectRow key={project.id} project={project} />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FolderOpen className="w-12 h-12 text-gray-200" />
                      <p className="text-gray-500 font-['Inter']">Tidak ada proyek yang ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-['Inter']">Menampilkan {filteredProjects.length} dari {projects.length} total proyek</p>
        </div>
      </div>
    </Layout>
  );
};

export default Projects;