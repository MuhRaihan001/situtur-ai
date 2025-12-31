import React, { useState, useEffect } from 'react';
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
  FileIcon
} from 'lucide-react';

const Tasks = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('/works/list');
        if (response.data.success) {
          const works = response.data.works || [];
          setData({
            projectName: 'Overview Tugas Proyek',
            projectProgress: works.length > 0 ? Math.round(works.reduce((acc, curr) => acc + curr.progress, 0) / works.length) : 0,
            daysLeft: 0,
            teamSize: 0,
            tasks: works.map(w => ({
              id: w.id,
              name: w.work_name,
              section: "Status: " + w.status,
              priority: w.status === 'completed' ? 'Done' : 'High',
              status: w.status === 'completed' ? 'Completed' : 'Pending',
              assignee: '/images/a1.png',
              deadline: w.finished_at || 'TBD'
            })),
            attachments: [],
            overview: [
              { name: 'Completion Rate', progress: works.length > 0 ? Math.round((works.filter(w => w.status === 'completed').length / works.length) * 100) : 0, color: 'bg-emerald-500' },
              { name: 'In Progress Rate', progress: works.length > 0 ? Math.round((works.filter(w => w.status === 'in_progress' || w.status === 'pending').length / works.length) * 100) : 0, color: 'bg-[#0DEDF2]' },
            ]
          });
        }
      } catch (err) {
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-[#0BBDC7]" /></div>
    </Layout>
  );

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
                Construction of underground tunnels and stations connecting Bundaran HI to Kota. This phase includes the construction of Thamrin and Monas stations.
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
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#0DEDF2] text-[#134E4A] text-xs font-bold rounded-xl hover:bg-[#0BBDC7] transition-all"><Plus className="w-4 h-4" /> Add Task</button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all"><Edit className="w-4 h-4" /> Edit Details</button>
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
                  <button className="text-xs font-bold text-[#0BBDC7] hover:underline">View Full Details</button>
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
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">U</div>
                          <span className="text-[11px] text-gray-400 font-medium w-16 text-right">{task.deadline}</span>
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full p-4 text-xs font-bold text-[#0BBDC7] hover:bg-gray-50 transition-colors border-t border-gray-50 flex items-center justify-center gap-2">
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
                   {data.attachments.map((file, i) => (
                     <div key={i} className="flex items-center gap-3 group cursor-pointer">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          file.type === 'pdf' ? 'bg-red-50 text-red-500' :
                          file.type === 'dwg' ? 'bg-blue-50 text-blue-500' :
                          file.type === 'xlsx' ? 'bg-emerald-50 text-emerald-500' :
                          'bg-orange-50 text-orange-500'
                        }`}>
                           {file.type === 'pdf' ? <FileText className="w-5 h-5" /> : <FileIcon className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                           <p className="text-[10px] text-gray-400 font-medium mt-0.5">{file.size} • {file.time}</p>
                        </div>
                        <Download className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Tasks;
