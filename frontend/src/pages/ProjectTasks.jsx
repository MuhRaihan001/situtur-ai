import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { 
  Calendar, 
  Plus, 
  Edit2, 
  MoreVertical, 
  Download,
  FileText,
  Image as ImageIcon,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ChevronDown,
  User
} from 'lucide-react';
import PropTypes from 'prop-types';

// Progress Circle Component
const ProgressCircle = ({ progress, size = 80 }) => {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#0BBDC7"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <span className="absolute text-lg font-bold text-gray-900">{progress}%</span>
    </div>
  );
};

ProgressCircle.propTypes = {
  progress: PropTypes.number.isRequired,
  size: PropTypes.number,
};

const AttachmentItem = ({ attachment }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'dwg': return <FileCode className="w-5 h-5 text-blue-500" />;
      case 'xls': return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      case 'png': return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'pdf': return 'bg-red-50';
      case 'dwg': return 'bg-blue-50';
      case 'xls': return 'bg-green-50';
      case 'png': return 'bg-emerald-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${getBgColor(attachment.type)}`}>
          {getIcon(attachment.type)}
        </div>
        <div>
          <h5 className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">{attachment.name}</h5>
          <p className="text-[10px] text-gray-500">{attachment.size} • {attachment.date}</p>
        </div>
      </div>
      <button className="p-1.5 text-gray-400 hover:text-[#0BBDC7] opacity-0 group-hover:opacity-100 transition-opacity">
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
};

AttachmentItem.propTypes = {
  attachment: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
};

const TaskItem = ({ task }) => {
  const getStatusColor = (status, progress, priority) => {
    if (progress === 100) return 'bg-green-100 text-green-700';
    if (priority === 'High') return 'bg-red-100 text-red-700';
    if (priority === 'Medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 group">
      <div className="flex items-start gap-4">
        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.progress === 100 ? 'bg-[#0BBDC7] border-[#0BBDC7]' : 'border-gray-300'}`}>
          {task.progress === 100 && <CheckCircle2 className="w-4 h-4 text-white" />}
        </div>
        <div>
          <h4 className={`text-sm font-semibold ${task.progress === 100 ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {task.work_name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-gray-500">{task.current_worker || 'Unassigned'}</p>
            {task.category && (
              <>
                <span className="text-gray-300 text-[10px]">•</span>
                <span className="text-[10px] text-gray-400 font-medium">{task.category}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(task.status, task.progress, task.priority)}`}>
          {task.progress === 100 ? 'Done' : (task.status || 'Active')}
        </span>
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
            <User className="w-3 h-3 text-gray-500" />
          </div>
        </div>
        <span className="text-[10px] text-gray-400 min-w-[60px] text-right">
          {task.deadline ? task.deadline.split(' ')[0] : 'No Date'}
        </span>
      </div>
    </div>
  );
};

TaskItem.propTypes = {
  task: PropTypes.object.isRequired,
};

const ProjectTasks = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/user/works/list', {
          headers: { 'Accept': 'application/json' }
        });
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching project tasks:', err);
        setError('Gagal memuat data tugas proyek');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  if (error || !data) {
    return (
      <Layout>
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">
          {error || 'Data tidak ditemukan'}
        </div>
      </Layout>
    );
  }

  const { project, tasks, overallProgress, stats } = data;

  return (
    <Layout>
      <div className="max-w-[1200px] mx-auto pb-10">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-['Inter']">Tugas Setiap Projek</h1>
        </div>

        {/* Main Project Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                project.Status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                project.Status === 'On Hold' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                'bg-blue-50 text-blue-600 border-blue-100'
              }`}>{project.Status || 'Active'}</span>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">
                  {project.Tanggal_Selesai ? `Due ${new Date(project.Tanggal_Selesai).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}` : 'No Deadline'}
                </span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-['Inter']">{project.Nama_Proyek}</h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl font-['Inter']">
              {project.Deskripsi || 'No description available for this project.'}
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <ProgressCircle progress={overallProgress} size={100} />
            <div className="flex flex-col gap-2 w-full">
              <button className="flex items-center justify-center gap-2 bg-[#0BBDC7] hover:bg-[#0AA8B1] text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm shadow-cyan-100 text-sm">
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
              <button className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all border border-gray-200 text-sm">
                <Edit2 className="w-4 h-4" />
                <span>Edit Details</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline Overview */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-gray-900 font-['Inter']">Timeline Overview</h3>
                <button className="text-xs font-bold text-[#0BBDC7] hover:underline">View Full Details</button>
              </div>
              <div className="space-y-6">
                {tasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-gray-700">{task.work_name}</span>
                      <span className="text-gray-900">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          task.progress === 100 ? 'bg-emerald-500' : 
                          task.progress > 50 ? 'bg-cyan-500' : 'bg-blue-400'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Tasks */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-base font-bold text-gray-900 font-['Inter']">Current Tasks</h3>
                <button className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <span>All Tasks</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Stats Circle */}
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                      <circle cx="48" cy="48" r="40" stroke="#0BBDC7" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="100" strokeLinecap="round" fill="transparent" />
                      <circle cx="48" cy="48" r="40" stroke="#10B981" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="180" strokeLinecap="round" fill="transparent" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-bold text-gray-900">{tasks.length}</span>
                      <span className="text-[8px] uppercase tracking-wider text-gray-400 font-bold">Tasks</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-gray-500">Done</span>
                      <span className="text-[10px] font-bold text-gray-900 ml-auto">36%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-500" />
                      <span className="text-[10px] font-bold text-gray-500">In Progress</span>
                      <span className="text-[10px] font-bold text-gray-900 ml-auto">36%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <span className="text-[10px] font-bold text-gray-500">Review</span>
                      <span className="text-[10px] font-bold text-gray-900 ml-auto">20%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-[10px] font-bold text-gray-500">On Hold</span>
                      <span className="text-[10px] font-bold text-gray-900 ml-auto">8%</span>
                    </div>
                  </div>
                </div>

                {/* Latest Evidence Card */}
                <div className="bg-[#F8FAFC] rounded-2xl p-4 flex gap-4 border border-gray-50">
                  <img 
                    src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=400&h=400&fit=crop" 
                    alt="Evidence" 
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Latest Evidence</span>
                      <span className="text-[8px] font-bold text-[#0BBDC7]">Just now</span>
                    </div>
                    <h5 className="text-[10px] font-bold text-gray-900 mb-1 leading-tight">Rebar installation verification for Zone 3, Pillar 4A</h5>
                    <span className="px-1.5 py-0.5 rounded-[4px] bg-blue-50 text-blue-600 text-[8px] font-bold">In Progress</span>
                    <div className="flex items-center gap-1 mt-2 text-gray-400">
                      <ImageIcon className="w-2.5 h-2.5" />
                      <span className="text-[8px] font-medium">Uploaded by Agus</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                {tasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>

              <button className="w-full mt-6 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-100 rounded-xl text-emerald-500 hover:bg-emerald-50 transition-colors font-bold text-xs">
                <Plus className="w-4 h-4" />
                <span>Add New Task</span>
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Days Left</p>
                <h4 className="text-3xl font-black text-gray-900">{stats.daysLeft}</h4>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Team Size</p>
                <h4 className="text-3xl font-black text-gray-900">{stats.teamSize}</h4>
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-gray-900 font-['Inter']">Attachments</h3>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {stats.attachments.map((file, idx) => (
                  <AttachmentItem key={idx} attachment={file} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectTasks;
