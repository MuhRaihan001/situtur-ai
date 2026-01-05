import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { decodeId } from '../utils/masking';
import { formatDate } from '../utils/dateFormatter';
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
  X,
  ArrowLeft,
  MoreVertical,
  ChevronLeft,
  ChevronRight
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
  const { id } = useParams(); // Ambil parameter id dari URL
  const navigate = useNavigate(); // Untuk navigasi kembali
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [idProyek, setIdProyek] = useState(sessionStorage.getItem('selected_project_id'));

  // CRUD States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskActions, setSelectedTaskActions] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirmTaskName, setDeleteConfirmTaskName] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    deadline: '',
    progress: 0
  });

  const fetchTasks = async () => {
    // 1. Prioritaskan ID dari URL (id)
    // 2. Jika tidak ada, baru gunakan idProyek dari sessionStorage
    let activeId = null;
    
    if (id) {
      activeId = decodeId(id);
      // Jika ada ID di URL tapi gagal decode dan bukan angka murni, anggap error
      if (!activeId) {
        setError('ID Proyek tidak valid.');
        setLoading(false);
        return;
      }
    } else if (idProyek) {
      activeId = idProyek;
    }

    if (!activeId) {
      setError('Tidak ada proyek yang dipilih. Silakan pilih proyek terlebih dahulu.');
      setLoading(false);
      return;
    }

    const currentId = activeId;

    try {
      setLoading(true);

      // Fetch project details jika ada id
      let projectData = null;
      try {
        const projectResponse = await axios.get(`/user/List_Projek?id=${currentId}`);
        if (projectResponse.data.success) {
          projectData = projectResponse.data.project || projectResponse.data.projects?.[0];
        }
      } catch (err) {
        console.error('Error fetching project:', err);
      }

      // Fetch works/tasks - Gunakan id_proyek sesuai backend
      const response = await axios.get(`/works/list?id_proyek=${currentId}`);
      console.log('Full Works Response:', response.data);

      if (response.data.success) {
        const works = response.data.works || [];
        const backendTeamSize = response.data.team_size || 0;
        const project = response.data.project || {};
        
        // Calculate task stats for summary
        const totalTasks = works.length;
        const completedCount = works.filter(w => w.status === 'completed').length;
        const inProgressCount = works.filter(w => w.status === 'in_progress').length;
        const pendingCount = works.filter(w => w.status === 'pending').length;

        const taskStats = {
          total: totalTasks,
          done: totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0,
          inProgress: totalTasks > 0 ? Math.round((inProgressCount / totalTasks) * 100) : 0,
          pending: totalTasks > 0 ? Math.round((pendingCount / totalTasks) * 100) : 0,
        };
        
        // Calculate project-level metrics
        const projectDeadline = project.project_deadline || (works.length > 0 ? works[0].project_deadline : null);
        let daysLeft = 0;
        if (projectDeadline) {
          const deadlineDate = new Date(projectDeadline);
          const today = new Date();
          
          // Reset hours for date comparison
          deadlineDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          
          const diffTime = deadlineDate - today;
          daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (daysLeft < 0) daysLeft = 0;
        }

        const finalProjectId = currentId;

        const finalProjectName = projectData?.name || project.Nama_Proyek || (works.length > 0 && works[0].Nama_Proyek) || `Project #${currentId}`;
        
        setData({
          projectName: finalProjectName,
          projectProgress: totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0,
          projectDeadline: formatDate(projectDeadline),
          daysLeft: daysLeft,
          teamSize: backendTeamSize || new Set(works.filter(w => w.assignee_name).map(w => w.assignee_name)).size,
          taskStats, // Add taskStats here
          tasks: works.map(w => ({
            id: w.id,
            name: w.work_name,
            section: "Status: " + w.status,
            priority: w.status === 'completed' ? 'Done' : (w.priority === 'high' ? 'High' : (w.priority === 'medium' ? 'Med' : 'Low')),
            status: w.status === 'completed' ? 'Completed' : (w.status === 'in_progress' ? 'In Progress' : (w.status === 'pending' ? 'Pending' : 'Failed')),
            assignee_name: w.assignee_name || 'Unassigned',
            deadline: formatDate(w.deadline),
            raw_deadline: w.raw_deadline,
            progress: w.progress,
            rawStatus: w.status
          })),
          attachments: [
          ],
          overview: works.slice(0, 3).map(w => ({
            name: w.work_name,
            progress: w.progress,
            color: w.status === 'completed' ? 'bg-emerald-500' : 'bg-[#0DEDF2]'
          }))
        });
        setError(null);
      } else {
        setError(response.data.message || 'Gagal mengambil daftar tugas');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 403) {
        setError('Anda tidak memiliki akses ke proyek ini atau proyek tidak ditemukan.');
      } else {
        setError(err.response?.data?.message || 'Terjadi kesalahan koneksi ke server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [id, idProyek]);

  const handleOpenAddModal = () => {
    setSelectedTask(null);
    setFormData({ name: '', deadline: '', progress: 0 });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      name: task.name,
      deadline: task.raw_deadline ? new Date(task.raw_deadline).toISOString().split('T')[0] : '',
      progress: task.progress
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (task) => {
    setSelectedTask(task);
    setDeleteConfirmTaskName('');
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let response;
      const activeProjectId = id ? decodeId(id) : idProyek;
      
      const payload = {
        work_name: formData.name,
        deadline: formData.deadline,
        id_proyek: activeProjectId,
        progress: formData.progress || 0
      };

      if (selectedTask) {
        response = await axios.put('/works/update', {
          id: selectedTask.id,
          work_name: formData.name,
          deadline: formData.deadline,
          progress: formData.progress || 0
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
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Terjadi kesalahan saat menyimpan data';
      alert(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (deleteConfirmTaskName !== selectedTask.name) {
      setDeleteError(`Nama tidak sesuai. Silakan ketik nama tugas ini: ${selectedTask.name}`);
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
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-6 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-red-50 p-6 rounded-full">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900">Akses Dibatasi</h2>
          <p className="text-gray-500 leading-relaxed">
            {error}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            to="/user/projects"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Proyek
          </Link>
          <button 
            onClick={fetchTasks}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0DEDF2] text-[#134E4A] font-bold rounded-xl hover:bg-[#0BBDC7] transition-all shadow-sm active:scale-95"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    </Layout>
  );

  if (!data) return null;

  const totalPages = Math.ceil(data.tasks.length / itemsPerPage);
  const paginatedTasks = data.tasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Back Button */}
        {id && (
          <button
            onClick={() => navigate('/user/projects')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Projects
          </button>
        )}

        {/* Project Header Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase">Active</span>
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Due {data.projectDeadline}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{data.projectName}</h1>
              <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                {data.tasks.length} tugas dalam proyek ini
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle className="text-gray-50" strokeWidth="6" stroke="currentColor" fill="transparent" r="34" cx="40" cy="40" />
                  <circle className="text-[#0DEDF2]" strokeWidth="6" strokeDasharray={213} strokeDashoffset={213 * (1 - data.projectProgress / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="34" cx="40" cy="40" />
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
                  <Link 
                    to="/user/projects"
                    className="text-[10px] font-bold text-[#0BBDC7] hover:underline"
                  >
                    View Full Detail
                  </Link>
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

               {/* Task Stats Header - New Section */}
               <div className="p-6 bg-white flex flex-col md:flex-row gap-8 border-b border-gray-50">
                  <div className="flex items-center gap-12 flex-1">
                     {/* Circular Count */}
                     <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                           <circle className="text-gray-50" strokeWidth="8" stroke="currentColor" fill="transparent" r="56" cx="64" cy="64" />
                           <circle className="text-[#0DEDF2]" strokeWidth="8" strokeDasharray={351} strokeDashoffset={351 * (1 - (data.taskStats.done + data.taskStats.inProgress) / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="56" cx="64" cy="64" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-3xl font-bold text-gray-900">{data.taskStats.total}</span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tasks</span>
                        </div>
                     </div>

                     {/* Stats Legend */}
                     <div className="space-y-4 flex-1 max-w-[200px]">
                        <div className="flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                              <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Done</span>
                           </div>
                           <span className="text-xs font-bold text-gray-900">{data.taskStats.done}%</span>
                        </div>
                        <div className="flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                              <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">In Progress</span>
                           </div>
                           <span className="text-xs font-bold text-gray-900">{data.taskStats.inProgress}%</span>
                        </div>
                        <div className="flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                              <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Pending</span>
                           </div>
                           <span className="text-xs font-bold text-gray-900">{data.taskStats.pending}%</span>
                        </div>
                     </div>
                  </div>

                  {/* Latest Evidence Card */}
                  <div className="bg-gray-50/50 rounded-2xl p-4 flex gap-4 min-w-[320px] border border-gray-100/50">
                     <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                        <img 
                          src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=200&q=80" 
                          alt="Evidence" 
                          className="w-full h-full object-cover"
                        />
                     </div>
                     <div className="space-y-2 flex-1"> 
                        <h4 className="text-[11px] font-bold text-gray-900 leading-tight">
                          {data.tasks.length > 0 ? data.tasks[0].name : "No recent activity"}
                        </h4>
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 bg-blue-50 text-blue-500 text-[9px] font-bold rounded-lg uppercase tracking-wider">In Progress</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                           <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                           <span className="text-[9px] font-medium italic">Uploaded by {data.tasks.length > 0 ? data.tasks[0].assignee_name : "System"}</span>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="divide-y divide-gray-50">
                  {paginatedTasks.map((task) => (
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
                          <div className="relative flex items-center gap-2">
                            {/* Desktop Actions */}
                            <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

                            {/* Mobile Actions */}
                            <div className="md:hidden">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTaskActions(selectedTaskActions === task.id ? null : task.id);
                                }}
                                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {selectedTaskActions === task.id && (
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[120px] z-20 animate-in fade-in zoom-in-95 duration-200">
                                  <button 
                                    onClick={() => {
                                      handleOpenEditModal(task);
                                      setSelectedTaskActions(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2 transition-colors"
                                  >
                                    <Edit className="w-3.5 h-3.5" /> Edit
                                  </button>
                                  <button 
                                    onClick={() => {
                                      handleOpenDeleteModal(task);
                                      setSelectedTaskActions(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

               {/* Pagination Controls */}
               {totalPages > 1 && (
                 <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-white">
                    <p className="text-[11px] text-gray-400 font-medium">
                      Showing <span className="text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, data.tasks.length)}</span> of <span className="text-gray-900">{data.tasks.length}</span> tasks
                    </p>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all ${
                              currentPage === i + 1 
                                ? 'bg-[#0DEDF2] text-[#134E4A]' 
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                 </div>
               )}

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
                <div className="space-y-4">
                  {data.attachments.length > 0 ? (
                    data.attachments.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                              <FileText className="w-4 h-4 text-[#0BBDC7]" />
                           </div>
                           <div className="overflow-hidden">
                              <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{file.size} • {file.date}</p>
                           </div>
                        </div>
                        <Download className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#0BBDC7] transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <FileIcon className="w-12 h-12 text-gray-100 mx-auto" />
                      <p className="text-xs text-gray-400 font-medium">No attachments found</p>
                    </div>
                  )}
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
            Tindakan ini tidak dapat dibatalkan. Silakan ketik nama tugas ini: <strong>{selectedTask?.name}</strong> untuk mengonfirmasi penghapusan.
          </div>
          <form onSubmit={handleDeleteSubmit} className="space-y-4">
            <input
              type="text"
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
              placeholder="Ketik nama tugas di sini"
              value={deleteConfirmTaskName}
              onChange={(e) => setDeleteConfirmTaskName(e.target.value)}
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