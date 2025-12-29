import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Layout from '../components/Layout';
import { 
  Users, 
  MapPin, 
  Calendar, 
  ClipboardList, 
  Plus, 
  Search, 
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// --- Presentational Components ---

const StatCard = ({ label, value, icon: Icon, color, bg, change }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className={`${bg} ${color} p-3 rounded-xl`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
        {change}
      </span>
    </div>
    <div className="mt-4">
      <p className="text-sm font-medium text-[#64748B]">{label}</p>
      <p className="text-2xl font-bold text-[#111827] mt-1">{value}</p>
    </div>
  </div>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired,
  bg: PropTypes.string.isRequired,
  change: PropTypes.string.isRequired,
};

const WorkerRow = ({ worker }) => (
  <tr className="hover:bg-gray-50 transition-colors group">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0DEDF2]/10 flex items-center justify-center text-[#134E4A] font-bold">
          {worker.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111827]">{worker.name}</p>
          <p className="text-xs text-[#64748B]">{worker.joinedDate}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{worker.id}</span>
    </td>
    <td className="px-6 py-4 text-sm text-[#475569]">{worker.role}</td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${worker.currentProject !== 'Unassigned' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
        <span className="text-sm text-[#475569]">{worker.currentProject}</span>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
        worker.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
        worker.status === 'On Leave' ? 'bg-orange-50 text-orange-600' : 
        'bg-gray-100 text-gray-500'
      }`}>
        {worker.status}
      </span>
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-blue-600 transition-colors shadow-sm border border-transparent hover:border-gray-100">
          <Eye className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-emerald-600 transition-colors shadow-sm border border-transparent hover:border-gray-100">
          <Edit2 className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-600 transition-colors shadow-sm border border-transparent hover:border-gray-100">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <button className="p-2 text-gray-400 group-hover:hidden">
        <MoreVertical className="w-4 h-4" />
      </button>
    </td>
  </tr>
);

WorkerRow.propTypes = {
  worker: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    joinedDate: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    currentProject: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
};

// --- Container Component ---

const Workers = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await axios.get('/user/workers/list', {
          headers: {
            'Accept': 'application/json'
          }
        });
        if (response.data.success) {
          setData(response.data);
        } else {
          setError('Gagal mengambil data pekerja');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Terjadi kesalahan koneksi ke server');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
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

  if (error) {
    return (
      <Layout>
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">
          {error}
        </div>
      </Layout>
    );
  }

  const { stats, workers } = data;

  const statCards = [
    { label: 'Total Workers', value: stats.totalWorkers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', change: '+2%' },
    { label: 'Currently On-Site', value: stats.currentlyOnSite, icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+15%' },
    { label: 'On Leave', value: stats.onLeave, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50', change: '-10%' },
    { label: 'Tasks Pending', value: stats.tasksPending, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50', change: '+5%' },
  ];

  const filteredWorkers = workers.filter(worker => 
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Worker Directory</h1>
            <p className="text-[#64748B] mt-1">Manage team members, assignments, and on-site status.</p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-[#0DEDF2] hover:bg-[#0BBDC7] text-[#134E4A] font-bold py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95">
            <Plus className="w-5 h-5" />
            Add New Worker
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Filter Section */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari dari nama, ID, atau role"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0DEDF2]/20 focus:border-[#0DEDF2] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0DEDF2]/20 transition-all cursor-pointer">
              <option>All Roles</option>
            </select>
            <select className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0DEDF2]/20 transition-all cursor-pointer">
              <option>All Projects</option>
            </select>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Employee Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Current Project</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredWorkers.map((worker) => (
                  <WorkerRow key={worker.id} worker={worker} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-[#64748B]">
              Showing <span className="font-semibold text-[#111827]">1</span> to <span className="font-semibold text-[#111827]">{filteredWorkers.length}</span> of <span className="font-semibold text-[#111827]">{workers.length}</span> entries
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-all" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-[#0DEDF2] text-[#134E4A] font-bold text-sm">1</button>
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-[#64748B] hover:bg-gray-50 text-sm">2</button>
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-[#64748B] hover:bg-gray-50 text-sm">3</button>
              <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Workers;