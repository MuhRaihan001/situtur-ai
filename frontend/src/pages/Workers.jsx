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
      <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
        {change.includes('%') && (change.startsWith('+') ? '↑' : change.startsWith('-') ? '↓' : '')}
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

const WorkerRow = ({ worker, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0DEDF2]/10 flex items-center justify-center text-[#134E4A] font-bold">
            {(worker.name || 'U').charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">{worker.name || 'Unnamed'}</p>
            <p className="text-xs text-[#64748B]">{worker.joinedDate || '-'}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
          {(worker.phone_number || '').split('@')[0] || '-'}
        </span>
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
        <div className="relative flex items-center justify-end gap-2">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onEdit(worker)}
              className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-emerald-600 transition-colors shadow-sm border border-transparent hover:border-gray-100"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(worker)}
              className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-600 transition-colors shadow-sm border border-transparent hover:border-gray-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors border border-gray-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[120px] z-20 animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={() => {
                    onEdit(worker);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button 
                  onClick={() => {
                    onDelete(worker);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

WorkerRow.propTypes = {
  worker: PropTypes.shape({
    id: PropTypes.number.isRequired,
    phone_number: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    joinedDate: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    currentProject: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// --- Modal Component ---

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

// --- Container Component ---

const Workers = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // CRUD States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const workers = data?.workers || [];
  const stats = data?.stats || { totalWorkers: 0, currentlyOnSite: 0, onLeave: 0, tasksPending: 0 };

  const filteredWorkers = workers.filter(worker => {
    const s = searchTerm.toLowerCase();
    return (
      (worker.name || '').toLowerCase().includes(s) ||
      (worker.phone_number || '').toLowerCase().includes(s) ||
      (worker.role || '').toLowerCase().includes(s) ||
      (worker.currentProject || '').toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filteredWorkers.length / itemsPerPage);
  const paginatedWorkers = filteredWorkers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/workers/list', {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (response.data && response.data.success) {
        const workers = response.data.workers || [];
        setData({
          success: true,
          workers: workers.map(w => ({
            id: w.id || Math.random(),
            phone_number: (w.phone_number || '').startsWith('62') ? "+" + w.phone_number : (w.phone_number || ''),
            name: w.worker_name || 'Unnamed Worker',
            joinedDate: w.created_at ? new Date(w.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : "Jan 2025",
            role: w.current_task_name || "Worker",
            currentProject: w.current_project_name || "Unassigned",
            status: w.status || "Active"
          })),
          stats: response.data.stats || {
            totalWorkers: workers.length,
            currentlyOnSite: workers.filter(w => w.status === 'Active').length,
            onLeave: workers.filter(w => w.status === 'Not active').length,
            tasksPending: workers.filter(w => w.current_task).length,
            growth: '+0%'
          }
        });
      } else {
        setError(response.data?.message || 'Gagal mengambil data pekerja');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Terjadi kesalahan koneksi ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedWorker(null);
    setFormData({ name: '', phone: '' });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (worker) => {
    setSelectedWorker(worker);
    setFormData({ 
      name: worker.name, 
      phone: worker.phone_number.replace('+', '').replace('62', '0') 
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (worker) => {
    setSelectedWorker(worker);
    setDeleteConfirmName('');
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        worker_name: formData.name,
        phone_number: formData.phone
      };

      let response;
      if (selectedWorker) {
        // Update
        response = await axios.put('/workers/update', {
          id: selectedWorker.id,
          ...payload
        });
      } else {
        // Create
        response = await axios.post('/workers/add', payload);
      }

      if (response.data.success) {
        setIsFormModalOpen(false);
        fetchWorkers();
      } else {
        alert(response.data.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.error('Form submit error:', err);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (deleteConfirmName !== selectedWorker.name) {
      setDeleteError('Nama tidak sesuai. Silakan ketik nama pekerja dengan benar.');
      return;
    }

    setFormLoading(true);
    try {
      const response = await axios.delete('/workers/delete', {
        data: { id: selectedWorker.id }
      });

      if (response.data.success) {
        setIsDeleteModalOpen(false);
        fetchWorkers();
      } else {
        setDeleteError(response.data.message || 'Gagal menghapus pekerja');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setDeleteError('Terjadi kesalahan saat menghapus data');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-10 h-10 text-[#0BBDC7] animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error && !data) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4 text-center">
          <div className="bg-red-50 p-4 rounded-full text-red-500">
            <Users className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Gagal Memuat Data Pekerja</h2>
          <p className="text-gray-500 max-w-md">{error}</p>
          <button 
            onClick={fetchWorkers}
            className="px-6 py-2 bg-[#0DEDF2] text-[#134E4A] font-bold rounded-xl hover:bg-[#0BBDC7] transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </Layout>
    );
  }

  if (!data) return null;

  const statCards = [
    { label: 'Total Workers', value: stats.totalWorkers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', change: stats.growth || '+0%' },
    { label: 'Currently On-Site', value: stats.currentlyOnSite, icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+0%' },
    { label: 'On Leave', value: stats.onLeave, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50', change: '+0%' },
    { label: 'Tasks Pending', value: stats.tasksPending, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50', change: '+0%' },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Worker Directory</h1>
            <p className="text-[#64748B] mt-1">Manage team members, assignments, and on-site status.</p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 bg-[#0DEDF2] hover:bg-[#0BBDC7] text-[#134E4A] font-bold py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
          >
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
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Nomor Hp</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Current Project</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedWorkers.length > 0 ? (
                  paginatedWorkers.map((worker) => (
                    <WorkerRow 
                      key={worker.id} 
                      worker={worker} 
                      onEdit={handleOpenEditModal}
                      onDelete={handleOpenDeleteModal}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-8 h-8 text-gray-300" />
                        <p className="text-gray-500 font-medium">Tidak ada data pekerja yang ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-[#64748B]">
                Showing <span className="font-semibold text-[#111827]">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold text-[#111827]">{Math.min(currentPage * itemsPerPage, filteredWorkers.length)}</span> of <span className="font-semibold text-[#111827]">{filteredWorkers.length}</span> entries
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg font-bold text-sm transition-all ${
                        currentPage === i + 1 
                          ? 'bg-[#0DEDF2] text-[#134E4A] shadow-sm' 
                          : 'border border-gray-200 text-[#64748B] hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal (Add/Edit) */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        title={selectedWorker ? 'Edit Worker' : 'Add New Worker'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input 
              type="text"
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0DEDF2]/20 focus:border-[#0DEDF2] outline-none transition-all"
              placeholder="Contoh: Jane Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp</label>
            <input 
              type="text"
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0DEDF2]/20 focus:border-[#0DEDF2] outline-none transition-all"
              placeholder="Contoh: 08123456789"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="pt-2">
            <button 
              type="submit"
              disabled={formLoading}
              className="w-full bg-[#0DEDF2] hover:bg-[#0BBDC7] text-[#134E4A] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : selectedWorker ? 'Update Data' : 'Tambah Pekerja'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Konfirmasi Hapus"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-600 text-sm">
            Tindakan ini tidak dapat dibatalkan. Silakan ketik nama pekerja <strong>{selectedWorker?.name}</strong> untuk mengonfirmasi.
          </div>
          <form onSubmit={handleDeleteSubmit} className="space-y-4">
            <input 
              type="text"
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
              placeholder="Ketik nama pekerja di sini"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
            />
            {deleteError && <p className="text-xs text-red-600 font-medium">{deleteError}</p>}
            <button 
              type="submit"
              disabled={formLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Hapus Pekerja'}
            </button>
          </form>
        </div>
      </Modal>
    </Layout>
  );
};

export default Workers;