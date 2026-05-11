import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, User, LogOut } from 'lucide-react';

export default function AdminSidebar() {
  const navigate = useNavigate();

  const menus = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/produk', label: 'Produk', icon: Package },
    { to: '/admin/review-klaim', label: 'Review Klaim', icon: ClipboardList },
    { to: '/admin/pengguna', label: 'Pengguna', icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#1B3A5C] text-white flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-white/10">
        <h1 className="text-2xl font-bold">InsurTech</h1>
        <p className="text-sm text-white/60 mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menus.map(menu => (
          <NavLink
            key={menu.to}
            to={menu.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <menu.icon size={18} />
            <span>{menu.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition"
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}