import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { 
  Bell, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Filter,
  Settings
} from 'lucide-react';
import PropTypes from 'prop-types';

const NotificationItem = ({ notification }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'project_update': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'system_alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'mention': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'task_assignment': return <Bell className="w-5 h-5 text-[#0BBDC7]" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'project_update': return 'bg-blue-50';
      case 'system_alert': return 'bg-red-50';
      case 'mention': return 'bg-green-50';
      case 'task_assignment': return 'bg-cyan-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className={`flex items-start gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-cyan-50/30' : ''}`}>
      <div className={`p-2.5 rounded-full ${getBgColor(notification.type)}`}>
        {getIcon(notification.type)}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className={`text-sm ${!notification.is_read ? 'font-bold' : 'font-medium'} text-gray-900`}>
            {notification.sender_name} {notification.action_text} {notification.target_name}
          </h4>
          <span className="text-[10px] text-gray-400">{notification.created_at}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.content}</p>
        {notification.project_name && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0BBDC7]" />
            <span className="text-[10px] font-bold text-[#0BBDC7] uppercase">{notification.project_name}</span>
          </div>
        )}
      </div>
      {!notification.is_read && (
        <div className="w-2 h-2 rounded-full bg-[#0BBDC7] mt-2" />
      )}
    </div>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.object.isRequired,
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Fallback to mock data if API fails
        const mockData = [
          {
            id: 1,
            type: 'project_update',
            sender_name: 'Agus Pertamina',
            action_text: 'mengupdate progress',
            target_name: 'Pondasi MRT',
            content: 'Pekerjaan pondasi untuk sektor A telah mencapai 100%.',
            project_name: 'MRT Phase 2A',
            is_read: false,
            created_at: '2 jam yang lalu'
          },
          {
            id: 2,
            type: 'system_alert',
            sender_name: 'Sistem',
            action_text: 'memberikan peringatan',
            target_name: 'Deadline',
            content: 'Deadline untuk Tunnel Boring Machine 2 tersisa 3 hari lagi.',
            project_name: 'MRT Phase 2A',
            is_read: true,
            created_at: 'Kemarin'
          }
        ];
        
        try {
          const response = await axios.get('/user/notifications', {
            headers: { 'Accept': 'application/json' }
          });
          if (response.data.success) {
            setNotifications(response.data.data);
          } else {
            setNotifications(mockData);
          }
        } catch (e) {
          setNotifications(mockData);
        }
      } catch (err) {
        setError('Gagal memuat notifikasi');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
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

  return (
    <Layout>
      <div className="max-w-[1000px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-['Inter']">Notifikasi</h1>
            <p className="text-gray-500 text-sm mt-1">Pantau semua pembaruan dan aktivitas proyek Anda</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button className="px-4 py-2 bg-[#0BBDC7] text-white rounded-lg text-sm font-medium hover:bg-[#0AA8B1] transition-all">
              Mark all as read
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {['all', 'unread', 'project', 'system'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-4 text-sm font-semibold capitalize whitespace-nowrap transition-all border-b-2 ${
                  filter === tab 
                    ? 'text-[#0BBDC7] border-[#0BBDC7]' 
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab === 'all' ? 'Semua' : tab === 'unread' ? 'Belum Dibaca' : tab === 'project' ? 'Proyek' : 'Sistem'}
              </button>
            ))}
          </div>

          <div className="divide-y divide-gray-50">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-bold">Tidak ada notifikasi</h3>
                <p className="text-gray-500 text-sm mt-1">Anda akan melihat pembaruan di sini saat aktivitas terjadi.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
