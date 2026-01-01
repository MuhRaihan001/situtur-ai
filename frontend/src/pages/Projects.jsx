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
  CheckCircle2,
  Edit2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import PropTypes from 'prop-types';

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

const Projects = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // CRUD States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  const [formData, setFormData] = useState({
    name: ''
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedProject(null);
    setFormData({ name: '' });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setSelectedProject(project);
    setFormData({ name: project.name });
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (project) => {
    setSelectedProject(project);
    setDeleteConfirmName('');
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let response;
      if (selectedProject) {
        response = await axios.put('/user/List_Projek', {
          id: selectedProject.id,
          name: formData.name
        });
      } else {
        response = await axios.post('/user/List_Projek', {
          name: formData.name
        });
      }

      if (response.data.success) {
        setIsFormModalOpen(false);
        fetchProjects();
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
    if (deleteConfirmName !== selectedProject.name) {
      setDeleteError(`Nama tidak sesuai. Silakan ketik nama proyek dengan benar: ${selectedProject.name}`);
      return;
    }

    setFormLoading(true);
    try {
      const response = await axios.delete('/user/List_Projek', {
        data: { id: selectedProject.id }
      });

      if (response.data.success) {
        setIsDeleteModalOpen(false);
        fetchProjects();
      } else {
        setDeleteError(response.data.message || 'Gagal menghapus proyek');
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

  const { stats, projects } = data || { stats: { total: 0, inProgress: 0, completed: 0, growth: '+0%' }, projects: [] };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString().includes(searchTerm)
  );

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
            <button 
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#0DEDF2] text-[#134E4A] font-bold rounded-xl hover:bg-[#0BBDC7] transition-all shadow-sm active:scale-95"
            >
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{project.name}</p>
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
                        project.status === 'In Progres' ? 'bg-[#DBEAFE] text[#166534]' :
                        project.status === 'Completed' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                        project.status === 'Fieled' ? 'bg-[#FEE2E2] text-[#991B1B]' :
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEditModal(project)}
                          className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors shadow-sm border border-transparent hover:border-gray-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenDeleteModal(project)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 transition-colors shadow-sm border border-transparent hover:border-gray-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal (Add/Edit) */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        title={selectedProject ? 'Edit Proyek' : 'Tambah Proyek Baru'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Proyek</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0DEDF2]/20 focus:border-[#0DEDF2]"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Contoh: Pembangunan MRT Fase 2"
            />
          </div>
          <button 
            type="submit" 
            disabled={formLoading}
            className="w-full py-3 bg-[#0DEDF2] text-[#134E4A] font-bold rounded-xl hover:bg-[#0BBDC7] transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (selectedProject ? 'Simpan Perubahan' : 'Tambah Proyek')}
          </button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Hapus Proyek"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">Tindakan ini tidak bisa dibatalkan</p>
              <p className="text-xs text-red-600 mt-1">Seluruh data tugas dan progres yang terkait dengan proyek ini akan dihapus secara permanen.</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Ketik nama proyek <span className="font-bold text-gray-900">"{selectedProject?.name}"</span> untuk mengonfirmasi penghapusan.
            </p>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder="Ketik nama proyek di sini"
            />
            {deleteError && <p className="text-xs text-red-500 font-medium">{deleteError}</p>}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              Batal
            </button>
            <button 
              onClick={handleDeleteSubmit}
              disabled={formLoading || deleteConfirmName !== selectedProject?.name}
              className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Projects;
