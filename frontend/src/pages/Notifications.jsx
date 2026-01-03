import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { 
  Bell, 
  Search, 
  Filter, 
  Trash2, 
  MoreVertical,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings
} from 'lucide-react';

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, system

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/user/notifikation');
        if (response.data.success) {
          setNotifications(response.data.notifications);
        }
      } catch (err) {
        setError('Gagal mengambil data notifikasi');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'error': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-10 h-10 text-[#0BBDC7] animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[#111827]">Halaman Notifikasi</h1>
            <p className="text-sm text-gray-500 font-medium">Pantau seluruh aktivitas dan peringatan sistem secara real-time.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-bold text-gray-600">Pengaturan</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0DEDF2] text-[#134E4A] font-bold rounded-xl hover:bg-[#0BBDC7] transition-all shadow-sm active:scale-95">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tandai Semua Dibaca</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm w-full md:w-auto">
            {['all', 'unread', 'system'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                  filter === t 
                    ? 'bg-[#0DEDF2] text-[#134E4A]' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t === 'all' ? 'Semua' : t === 'unread' ? 'Belum Dibaca' : 'Sistem'}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari notifikasi..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0DEDF2]/20 focus:border-[#0DEDF2] text-sm"
            />
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all hover:shadow-md cursor-pointer ${
                notification.isRead ? 'bg-white border-gray-100' : 'bg-[#0DEDF2]/5 border-[#0DEDF2]/20'
              }`}
            >
              <div className={`mt-1 p-2.5 rounded-xl border ${getTypeStyles(notification.type)}`}>
                {getTypeIcon(notification.type)}
              </div>
              
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <h3 className={`text-sm font-bold truncate ${notification.isRead ? 'text-gray-900' : 'text-[#134E4A]'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {notification.time}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                  {notification.message}
                </p>
                {!notification.isRead && (
                  <div className="flex gap-4 mt-3">
                    <button className="text-[11px] font-bold text-[#0BBDC7] hover:underline">Tandai sudah dibaca</button>
                    <button className="text-[11px] font-bold text-gray-400 hover:text-red-500">Hapus</button>
                  </div>
                )}
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (Optional) */}
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-6 bg-gray-50 rounded-full">
              <Bell className="w-12 h-12 text-gray-300" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900">Tidak ada notifikasi</h3>
              <p className="text-sm text-gray-400">Semua aktivitas sistem akan muncul di sini.</p>
            </div>
          </div>
        )}

        {/* Pagination/Load More */}
        <div className="flex justify-center pt-4">
          <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            Muat Lebih Banyak
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
