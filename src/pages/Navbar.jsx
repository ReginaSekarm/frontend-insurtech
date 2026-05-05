import { useState } from 'react';
import { FaBars, FaBell } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom'; 
import Sidebar from './Sidebar';

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
          {/* Ikon notifikasi sebagai Link */}
          <Link to="/notifikasi" className="relative text-gray-300 hover:text-white transition">
            <FaBell size={22} />
            {/* Opsional badge */}
            {/* <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">3</span> */}
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}