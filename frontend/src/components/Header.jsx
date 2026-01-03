import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick, username = "User", role = "Site Manager", unreadCount = 0 }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white sticky top-0 z-30 border-b border-gray-200">
      <div className="px-4 lg:px-6 w-full max-w-[1472px] mx-auto h-full flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-[#475569]" />
          </button>
          
          <div className="relative hidden sm:block flex-1 max-w-md">
            <input 
              type="text" 
              placeholder="Cari Proyek, Tasks, atau Pekerja..."
              className="w-full h-[38px] pl-10 pr-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0BBDC7] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button 
            onClick={() => navigate('/user/notifications')}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-6 h-6 text-[#64748B]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-[#0DEDF2] text-[#134E4A] text-[10px] font-bold rounded-full ring-2 ring-white flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="text-right">
              <div className="text-sm font-semibold text-[#111827]">{username}</div>
              <div className="text-xs text-[#64748B]">{role}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0BBDC7] to-[#26C6DA] border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
