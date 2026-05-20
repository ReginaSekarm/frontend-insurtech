import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHistory, FaClipboardList, FaFileInvoice, FaWallet, FaUser, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { Shield } from 'lucide-react';
import { api } from '../lib/api'; // 1. IMPORT API HELPER DI SINI

export default function DashboardNasabah() {
  const [user, setUser] = useState({ name: 'Nasabah' });
  const [stats, setStats] = useState({
    polisAktif: 0,
    totalPolis: 0,
    totalKlaim: 0,
    tunggakan: 0
  });
  const [aktivitas, setAktivitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Ambil data user dari localStorage (disimpan saat login)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({ name: userData.name || 'Nasabah' });
      } catch (e) {
        console.error('Parse user error', e);
      }
    }

    const fetchDashboardData = async () => {
      try {
        // 2. AMBIL TOKEN
        const token = localStorage.getItem('token');
        
        // 3. GUNAKAN FUNGSI API (Bukan fetch biasa)
        // Note: Pastikan path endpoint di bawah ini sesuai dengan backend kamu. 
        // Jika backendmu butuh prefix '/api', ubah menjadi '/api/nasabah/dashboard'
        const { data } = await api('/nasabah/dashboard', 'GET', null, token);
        
        setStats({
          polisAktif: data.polisAktif || 0,
          totalPolis: data.totalPolis || 0,
          totalKlaim: data.totalKlaim || 0,
          tunggakan: data.tunggakan || 0
        });
        setAktivitas(data.aktivitas || []);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError(err.message || 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Tentukan ikon berdasarkan tipe aktivitas 
  const getIconByType = (type) => {
    if (type === 'premi') return <FaCheckCircle className="text-green-500" />;
    if (type === 'klaim') return <FaSpinner className="text-yellow-500" />;
    return null;
  };

  const featureMenus = [
    { label: 'Beli Produk', path: '/produk', icon: FaShoppingCart, color: 'bg-blue-500' },
    { label: 'Riwayat Transaksi', path: '/riwayat-transaksi', icon: FaHistory, color: 'bg-green-500' },
    { label: 'Status Klaim', path: '/status-klaim', icon: FaClipboardList, color: 'bg-purple-500' },
    { label: 'Polis Saya', path: '/polis-saya', icon: FaFileInvoice, color: 'bg-orange-500' },
    { label: 'Keuangan', path: '/laporan-keuangan', icon: FaWallet, color: 'bg-pink-500' },
    { label: 'Profil', path: '/profil', icon: FaUser, color: 'bg-indigo-500' },
  ];

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6 text-center">Memuat dashboard...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-6 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Selamat Datang */}
      <div className="bg-gradient-to-r from-sky-950 to-sky-800 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">SELAMAT DATANG,</h1>
        <p className="text-3xl font-extrabold mt-1">{user.name}</p>
      </div>

      {/* Polis Aktif */}
      <div className="bg-sky-900 rounded-2xl p-6 w-full shadow-lg">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 p-2 rounded-xl">
            <Shield className="text-blue-300 w-6 h-6" strokeWidth={1.5} />
          </div>
          <span className="bg-[#6ec6f0] text-[#0a3d62] text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
            ACTIVE
          </span>
        </div>

        {/* Title */}
        <h2 className="text-white text-2xl font-bold mb-4">
          {stats.polisAktif} Polis Aktif
        </h2>

        {/* Divider */}
        <hr className="border-white/20 mb-4" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/15 rounded-xl px-3 py-3">
            <p className="text-white text-2xl font-bold">{stats.totalPolis}</p>
            <p className="text-white/70 text-xs mt-1">Polis</p>
          </div>
          <div className="bg-white/15 rounded-xl px-3 py-3">
            <p className="text-white text-2xl font-bold">{stats.totalKlaim}</p>
            <p className="text-white/70 text-xs mt-1">Klaim</p>
          </div>
          <Link to="/tunggakan" className="block">
            <div className="bg-white/15 rounded-xl px-3 py-3 hover:bg-white/25 transition cursor-pointer">
              <p className="text-white text-2xl font-bold">{stats.tunggakan}</p>
              <p className="text-white/70 text-xs mt-1">Tunggakan</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Fitur */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Fitur fitur</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {featureMenus.map((menu) => (
            <Link
              key={menu.label}
              to={menu.path}
              className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition group"
            >
              <div className={`${menu.color} p-3 rounded-full text-white mb-2 group-hover:scale-105 transition`}>
                <menu.icon size={20} />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">{menu.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Aktivitas Terbaru */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h2>
          <Link to="/riwayat-transaksi" className="text-sky-800 text-sm font-medium hover:underline">
            LIHAT SEMUA
          </Link>
        </div>
        <div className="space-y-3">
          {aktivitas.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="text-xl">{getIconByType(item.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.product}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                  </div>
                  {item.amount && (
                    <p className="text-sm font-bold text-sky-900">{item.amount}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}