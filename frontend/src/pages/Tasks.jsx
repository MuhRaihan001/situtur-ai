import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Layout from '../components/Layout';
import { 
  Plus, 
  Edit, 
  Download, 
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  FileIcon,
  Trash2,
  X
} from 'lucide-react';

// --- Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
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

const Tasks = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // CRUD States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirmWorkerName, setDeleteConfirmWorkerName] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    deadline: '',
    status: 'pending',
    progress: 0
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/works/list');
      if (response.data.success) {
        const works = response.data.works || [];
        setData({
          projectName: 'Overview Tugas Proyek',
          projectProgress: works.length > 0 ? Math.round(works.reduce((acc, curr) => acc + curr.progress, 0) / works.length) : 0,
          daysLeft: 0,
          teamSize: new Set(works.filter(w => w.assignee_name).map(w => w.assignee_name)).size,
          tasks: works.map(w => ({
            id: w.id,
            name: w.work_name,
            section: "Status: " + w.status,
            priority: w.status === 'completed' ? 'Done' : (w.progress > 50 ? 'Med' : 'High'),
            status: w.status === 'completed' ? 'Completed' : (w.status === 'in_progress' ? 'In Progress' : 'Pending'),
            assignee_name: w.assignee_name || 'Unassigned',
            deadline: w.deadline || 'TBD',
            raw_deadline: w.raw_deadline,
            progress: w.progress,
            rawStatus: w.status
          })),
          attachments: [],
          overview: [
            { name: 'Completion Rate', progress: works.length > 0 ? Math.round((works.filter(w => w.status === 'completed').length / works.length) * 100) : 0, color: 'bg-emerald-500' },
            { name: 'In Progress Rate', progress: works.length > 0 ? Math.round((works.filter(w => w.status === 'in_progress' || w.status === 'pending').length / works.length) * 100) : 0, color: 'bg-[#0DEDF2]' },
          ]
        });
      } else {
        setError(response.data.message || 'Gagal mengambil daftar tugas');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedTask(null);
    setFormData({ name: '', deadline: '', status: 'pending', progress: 0 });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setFormData({ 
      name: task.name, 
      deadline: task.raw_deadline ? new Date(task.raw_deadline).toISOString().split('T')[0] : '',
      status: task.rawStatus,
      progress: task.progress
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (task) => {
    setSelectedTask(task);
    setDeleteConfirmWorkerName('');
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        work_name: formData.name,
        deadline: new Date(formData.deadline).getTime(),
        status: formData.status,
        progress: parseInt(formData.progress)
      };

      let response;
      if (selectedTask) {
        response = await axios.put('/works/update', {
          id: selectedTask.id,
          ...payload
        });
      } else {
        response = await axios.post('/works/add', payload);
      }

      if (response.data.success) {
        setIsFormModalOpen(false);
        fetchTasks();
      } else {
        alert(response.data.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      console.error('Form error:', err);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (deleteConfirmWorkerName !== selectedTask.assignee_name) {
      setDeleteError(`Nama tidak sesuai. Silakan ketik nama pekerja yang mengerjakan tugas ini: ${selectedTask.assignee_name}`);
      return;
    }

    setFormLoading(true);
    try {
      const response = await axios.delete('/works/delete', {
        data: { work_id: selectedTask.id }
      });

      if (response.data.success) {
        setIsDeleteModalOpen(false);
        fetchTasks();
      } else {
        setDeleteError(response.data.message || 'Gagal menghapus tugas');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setDeleteError('Terjadi kesalahan saat menghapus data');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading && !data) return (
    <Layout>
      <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-[#0BBDC7]" /></div>
    </Layout>
  );

  if (error && !data) return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900">Gagal Memuat Data</h2>
        <p className="text-gray-500">{error}</p>
        <button 
          onClick={fetchTasks}
          className="px-4 py-2 bg-[#0DEDF2] text-[#134E4A] text-xs font-bold rounded-xl hover:bg-[#0BBDC7]"
        >
          Coba Lagi
        </button>
      </div>
    </Layout>
  );

  if (!data) return null;

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Project Header Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase">Active</span>
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Due Dec 2024</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{data.projectName}</h1>
              <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                Manajemen tugas konstruksi dan pemantauan progres harian untuk proyek pembangunan terowongan dan stasiun MRT Jakarta fase 2.
              </p>
            </div>
            <div className="flex items-center gap-6">
               <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle className="text-gray-50" strokeWidth="6" stroke="currentColor" fill="transparent" r="34" cx="40" cy="40" />
                    <circle className="text-[#0DEDF2]" strokeWidth="6" strokeDasharray={213} strokeDashoffset={213 * (1 - data.projectProgress/100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="34" cx="40" cy="40" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{data.projectProgress}%</span>
               </div>
               <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0DEDF2] text-[#134E4A] text-xs font-bold rounded-xl hover:bg-[#0BBDC7] transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Task
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline Overview */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-gray-900">Timeline Overview</h2>
               </div>
               <div className="space-y-6">
                  {data.overview.map((item, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-500">{item.name}</span>
                          <span className="text-gray-900">{item.progress}%</span>
                       </div>
                       <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.progress}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Current Tasks */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-bold text-gray-900">Current Tasks</h2>
                  <select className="text-xs font-bold text-gray-500 bg-transparent border-none focus:ring-0 cursor-pointer">
                    <option>All Tasks</option>
                  </select>
               </div>
               <div className="divide-y divide-gray-50">
                  {data.tasks.map((task) => (
                    <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center gap-4 group">
                       <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200'}`}>
                          {task.status === 'Completed' && <CheckCircle className="w-4 h-4 text-white" />}
                       </div>
                       <div className="flex-1">
                          <h3 className={`text-sm font-semibold ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.name}</h3>
                          <p className="text-[11px] text-gray-400 mt-1 font-medium">{task.section}</p>
                       </div>
                       <div className="flex items-center gap-6">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            task.priority === 'High' ? 'bg-red-50 text-red-500' :
                            task.priority === 'Done' ? 'bg-gray-100 text-gray-500' :
                            task.priority === 'Med' ? 'bg-orange-50 text-orange-500' :
                            'bg-blue-50 text-blue-500'
                          }`}>{task.priority}</span>
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-[#0DEDF2]/10 flex items-center justify-center text-[10px] font-bold text-[#134E4A]" title={task.assignee_name}>
                              {task.assignee_name.charAt(0)}
                            </div>
                            <span className="text-[9px] text-gray-400 mt-0.5 truncate max-w-[60px]">{task.assignee_name}</span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-medium w-24 text-right">{task.deadline}</span>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenEditModal(task)}
                              className="p-1.5 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleOpenDeleteModal(task)}
                              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               <button 
                onClick={handleOpenAddModal}
                className="w-full p-4 text-xs font-bold text-[#0BBDC7] hover:bg-gray-50 transition-colors border-t border-gray-50 flex items-center justify-center gap-2"
               >
                  <Plus className="w-3 h-3" /> Add New Task
               </button>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center space-y-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Days Left</p>
                   <p className="text-3xl font-bold text-gray-900">{data.daysLeft}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center space-y-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team Size</p>
                   <p className="text-3xl font-bold text-gray-900">{data.teamSize}</p>
                </div>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="font-bold text-gray-900">Attachments</h2>
                   <Download className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-4 text-center py-4">
                  <FileIcon className="w-12 h-12 text-gray-100 mx-auto" />
                  <p className="text-xs text-gray-400 font-medium">No attachments found</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Form Modal (Add/Edit) */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        title={selectedTask ? 'Edit Task' : 'Add New Task'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tugas</label>
            <input 
              type="text"
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0DEDF2]/20 focus:border-[#0DEDF2] outline-none transition-all"
              placeholder="Contoh: Pemasangan Beton"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input 
              type="date"
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0DEDF2]/20 focus:border-[#0DEDF2] outline-none transition-all"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0DEDF2]/20 focus:border-[#0DEDF2] outline-none transition-all"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progres (%)</label>
              <input 
                type="number"
                min="0"
                max="100"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0DEDF2]/20 focus:border-[#0DEDF2] outline-none transition-all"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
              />
            </div>
          </div>
          <div className="pt-2">
            <button 
              type="submit"
              disabled={formLoading}
              className="w-full bg-[#0DEDF2] hover:bg-[#0BBDC7] text-[#134E4A] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : selectedTask ? 'Update Task' : 'Tambah Tugas'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Konfirmasi Hapus Tugas"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-600 text-sm">
            Tindakan ini tidak dapat dibatalkan. Silakan ketik nama pekerja yang mengerjakan tugas ini: <strong>{selectedTask?.assignee_name}</strong> untuk mengonfirmasi penghapusan tugas <strong>{selectedTask?.name}</strong>.
          </div>
          <form onSubmit={handleDeleteSubmit} className="space-y-4">
            <input 
              type="text"
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
              placeholder="Ketik nama pekerja di sini"
              value={deleteConfirmWorkerName}
              onChange={(e) => setDeleteConfirmWorkerName(e.target.value)}
            />
            {deleteError && <p className="text-xs text-red-600 font-medium">{deleteError}</p>}
            <button 
              type="submit"
              disabled={formLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Hapus Tugas'}
            </button>
          </form>
        </div>
      </Modal>
    </Layout>
  );
};

export default Tasks;
