import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Package, ClipboardList, User, LogOut, Search, Menu } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menus = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin-dashboard' },
    { id: 'produk', label: 'Produk', icon: <Package size={18} />, path: '/admin-produk' },
    { id: 'review-klaim', label: 'Review Klaim', icon: <ClipboardList size={18} />, badge: 5, path: '/admin-review-klaim' },
    { id: 'pengguna', label: 'Pengguna', icon: <User size={18} />, path: '/admin-pengguna' },
  ];

  const pageTitles = {
    '/admin-dashboard': 'Dashboard',
    '/admin-tambah-produk': 'Tambah Produk',
    '/admin-produk': 'Manajemen Produk',
    '/admin-review-klaim': 'Review Klaim',
    '/admin-pengguna': 'Pengguna',
    '/admin-verifikasi-dokumen': 'Verifikasi Dokumen',
  };
  const currentTitle = pageTitles[location.pathname] || 'Pengguna';

  // Hide Navbar di halaman Review Klaim
  const hideSearch = location.pathname === '/admin-review-klaim' || location.pathname === '/admin-tambah-produk' || location.pathname === '/admin-pengguna' || location.pathname === '/admin-verifikasi-dokumen';
  
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'} transition-all duration-300 min-h-screen bg-[#1B3A5C] flex flex-col flex-shrink-0`}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Shield size={20} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">InsurTech</p>
              <p className="text-white/50 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menus.map((menu) => {
            const isActive = location.pathname.startsWith(menu.path);
            return (
              <button
                key={menu.id}
                onClick={() => navigate(menu.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-white/20 text-white border-l-4 border-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {menu.icon}
                <span>{menu.label}</span>
                {menu.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {menu.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            <div className="bg-white/20 p-1.5 rounded-lg flex-shrink-0">
              <LogOut size={16} className="text-white/60" />
            </div>
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-800">{currentTitle}</h1>
          {!hideSearch && (
            <div className="relative ml-8">
              <input
                type="text"
                placeholder="Cari....."
                className="pl-4 pr-9 py-1.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 w-[550px]"
              />
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          )}
          <div className="ml-auto">
            <div className="w-9 h-9 rounded-full bg-[#1B3A5C] flex items-center justify-center text-white text-sm font-bold">
              AD
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}