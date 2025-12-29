import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { 
  ClipboardList, 
  LayoutDashboard, 
  Clock, 
  TriangleAlert, 
  CheckCircle2,
  Loader2
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/user/dashboard');
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError('Gagal mengambil data dashboard');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Terjadi kesalahan koneksi ke server');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  const { username, currentDate, stats: rawStats, chartData: rawChart, monthlyData: rawMonthly, priorityTasks: rawTasks, recentUpdates } = data;

  const stats = [
    { label: 'Tasks Pending', value: rawStats.tasksPending, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50', change: 'Real-time' },
    { label: 'Ongoing Projects', value: rawStats.ongoingProjects, icon: LayoutDashboard, color: 'text-orange-600', bg: 'bg-orange-50', change: 'Active' },
    { label: 'Hours Worked', value: rawStats.hoursWorked, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', change: 'Estimated' },
    { label: 'Safety Alerts', value: rawStats.safetyAlerts, icon: TriangleAlert, color: 'text-red-600', bg: 'bg-red-50', change: 'System' },
  ];

  const barData = {
    labels: rawChart.years,
    datasets: [{
      data: rawChart.values,
      backgroundColor: (context) => context.index === 4 ? '#26C6DA' : 'rgba(13, 231, 242, 0.3)',
      borderRadius: 6,
    }]
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Completion Rate',
      data: rawMonthly,
      borderColor: '#26C6DA',
      backgroundColor: 'rgba(13, 231, 242, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#FFFFFF',
      pointBorderColor: '#26C6DA',
      pointBorderWidth: 2,
    }]
  };

  return (
    <Layout>
      <div className="max-w-[1472px] mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-[30px] font-bold text-[#111827]">
              Selamat Datang, {username}
            </h1>
            <p className="text-[#64748B] mt-1">Berikut adalah perkembangan situs Anda hari ini.</p>
          </div>
          <div className="text-sm font-medium text-[#64748B] md:text-right">
            {currentDate}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="px-2 py-1 bg-[#F5F8F8] text-[#16A34A] text-xs font-medium rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-[#111827] mb-1">{stat.value}</div>
              <div className="text-sm text-[#64748B]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#111827] mb-6">Tahun Proyek</h3>
            <div className="h-[300px]">
              <Bar 
                data={barData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } } 
                }} 
              />
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#111827] mb-6">Proyek Selesai</h3>
            <div className="h-[300px]">
              <Line 
                data={lineData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } } 
                }} 
              />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-8">
          {/* Priority Tasks */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#111827]">Priority Tasks</h3>
              <button className="text-sm font-medium text-[#0BBDC7] hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Task Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase">Project</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#64748B] uppercase">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {rawTasks.length > 0 ? (
                    rawTasks.map((task, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-[#111827]">{task.name}</div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium mt-1 ${
                            task.priorityClass === 'high' ? 'bg-red-100 text-red-700' : 
                            task.priorityClass === 'logistics' ? 'bg-blue-100 text-blue-700' :
                            task.priorityClass === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#64748B]">{task.project}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-[#111827]">{task.dueDate}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-[#64748B] text-sm italic">
                        Belum ada tugas prioritas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Updates */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#111827]">Recent Updates</h3>
              <button className="text-sm font-medium text-[#0BBDC7] hover:underline">View All</button>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {recentUpdates && recentUpdates.length > 0 ? (
                recentUpdates.map((update, idx) => (
                  <div key={idx} className="p-6 flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#111827]">{update.title}</div>
                      <div className="text-xs text-[#64748B] mt-1">{update.description}</div>
                      <div className="text-[10px] text-[#9CA3AF] mt-2">{update.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-[#64748B] text-sm italic">
                  Belum ada pembaruan terbaru.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
