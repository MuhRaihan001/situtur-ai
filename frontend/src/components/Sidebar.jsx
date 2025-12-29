import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderOpen, 
  ListChecks, 
  Users, 
  Bell, 
  ClipboardCheck, 
  Settings, 
  User, 
  QrCode 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
    { name: 'List Proyek', path: '/user/projects', icon: FolderOpen },
    { name: 'To Do List Setiap Proyek', path: '/user/tasks', icon: ListChecks },
    { name: 'List Data Worker', path: '/user/workers', icon: Users },
    { name: 'Halaman Notifikasi', path: '/user/notifications', icon: Bell },
    { name: 'Monitoring Kehadiran', path: '/user/attendance', icon: ClipboardCheck },
  ];

  const bottomItems = [
    { name: 'Pengaturan Akun', path: '/user/settings', icon: Settings },
    { name: 'Profil Akun', path: '/user/profil', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside className={`w-[256px] h-screen bg-white overflow-y-auto flex flex-col fixed left-0 top-0 z-40 border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex flex-row items-center w-full h-[50px] px-[8px] py-4 gap-[12px]">
          <img src="/images/logo.png" alt="Situtur Logo" className="w-[209px] h-auto object-contain mx-auto" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col items-start px-4 mt-6 gap-1 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-row items-center w-full h-[44px] px-[12px] py-[8px] gap-[12px] rounded-[8px] transition-colors ${
                isActive(item.path) 
                  ? 'bg-[rgba(13,231,242,0.1)] text-[#0BBDC7]' 
                  : 'text-[#475569] hover:bg-gray-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-[#0BBDC7]' : 'text-[#9CA3AF]'}`} />
              <span className="font-['Inter'] font-medium text-[14px] leading-[20px]">
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#E5E7EB] bg-white space-y-1">
          {bottomItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-row items-center w-full h-[44px] px-[12px] py-[8px] gap-[12px] rounded-[8px] transition-colors ${
                isActive(item.path) 
                  ? 'bg-[rgba(13,231,242,0.1)] text-[#0BBDC7]' 
                  : 'text-[#475569] hover:bg-gray-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-[#0BBDC7]' : 'text-[#9CA3AF]'}`} />
              <span className="font-['Inter'] font-medium text-[14px] leading-[20px]">
                {item.name}
              </span>
            </Link>
          ))}

          <div className="pt-2">
            <Link to="/user/qr" className="block">
              <button className="flex flex-row justify-center items-center w-full h-10 px-3 py-2 gap-2 bg-[#0F172A] rounded-lg hover:bg-[#1e293b] transition-colors group">
                <QrCode className="w-5 h-5 text-white" />
                <span className="font-['Inter'] font-medium text-[14px] leading-5 text-white">
                  Show QR Code
                </span>
              </button>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
