import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({
    nama_lengkap: 'Loading...',
    role_display: '...'
  });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/user/dashboard', {
          headers: {
            'Accept': 'application/json'
          }
        });
        if (response.data.success && response.data.data.profile) {
          setUserData(response.data.data.profile);
        }
      } catch (err) {
        console.error('Failed to fetch user profile from dashboard:', err);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/user/notifikation', {
          headers: {
            'Accept': 'application/json'
          }
        });
        if (response.data.success) {
          const unread = response.data.notifications.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Failed to fetch notifications for unread count:', err);
      }
    };

    fetchUser();
    fetchNotifications();
    
    // Refresh notifications every 1 minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F8F8]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="lg:ml-[256px]">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)} 
          username={userData.nama_lengkap}
          role={userData.role_display}
          unreadCount={unreadCount}
        />
        
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
