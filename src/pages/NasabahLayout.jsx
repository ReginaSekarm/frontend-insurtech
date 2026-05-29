import { useState } from 'react';
import { FaBars, FaBell, FaHome, FaShoppingCart, FaHandHoldingUsd, FaUser, FaTimes, FaClipboardList } from 'react-icons/fa';
import { Link, useNavigate, useLocation, NavLink, Outlet } from 'react-router-dom'; 

// 1. KOMPONEN SIDEBAR (Internal)
function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { to: '/dashboard', label: 'Beranda', icon: FaHome },
    { to: '/polis-saya', label: 'Polis Saya', icon: FaClipboardList },
    { to: '/produk', label: 'Beli Produk', icon: FaShoppingCart },
    { to: '/status-klaim', label: 'Klaim', icon: FaHandHoldingUsd },
    { to: '/profil', label: 'Profil', icon: FaUser },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-sky-950">Menu</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={20} />
          </button>
        </div>
        <nav className="py-4">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-blue-50 ${isActive ? 'bg-blue-100 text-blue-800 border-r-4 border-sky-900' : ''}`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

// 2. KOMPONEN NAVBAR (Internal)
function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const showBellPaths = [
    '/dashboard',
    '/produk-asuransi',
    '/polis-saya',
    '/status-klaim',
    '/laporan-keuangan',
    '/riwayat-transaksi',
    '/profil'
  ];

  const showBell = showBellPaths.includes(location.pathname);

  return (
    <>
      <nav className="bg-sky-950 text-white shadow-md px-4 py-3 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="text-gray-300 hover:text-white">
            <FaBars size={24} />
          </button>
          <h1 className="text-xl font-bold">InsurTech</h1>
        </div>

        <div className="flex items-center gap-4">
          {showBell && (
            <Link to="/notifikasi" className="relative text-gray-300 hover:text-white transition">
              <FaBell size={22} />
            </Link>
          )}
        </div>
      </nav>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

// 3. KOMPONEN LAYOUT UTAMA 
export default function NasabahLayout() {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Navbar sudah mencakup Sidebar di dalamnya */}
      <Navbar />
      
      {/* Outlet adalah tempat bergantinya konten halaman */}
      <main className="p-6 ml-0 md:ml-0 transition-all">
        <Outlet />
      </main>
    </div>
  );
}