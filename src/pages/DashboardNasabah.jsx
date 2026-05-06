import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHistory, FaClipboardList, FaFileInvoice, FaWallet, FaUser, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { Shield } from 'lucide-react';

export default function DashboardNasabah() {
  
  const user = { name: 'Gendis' };
  const stats = {
    polisAktif: 3,
    totalPolis: 3,
    totalKlaim: 2,
    tunggakan: 0
  };

  const aktivitas = [
    {
      id: 1,
      type: 'premi',
      title: 'Pembayaran Premi Berhasil',
      amount: 'Rp 150k',
      date: '15 Okt 2025',
      product: 'Asuransi Kesehatan',
      icon: <FaCheckCircle className="text-green-500" />,
    },
    {
      id: 2,
      type: 'klaim',
      title: 'Klaim Sedang Diproses',
      amount: null,
      date: '12 Okt 2025',
      product: 'Asuransi Kendaraan',
      icon: <FaSpinner className="text-yellow-500" />,
    },
  ];

  const featureMenus = [
    { label: 'Beli Produk', path: '/produk', icon: FaShoppingCart, color: 'bg-blue-500' },
    { label: 'Riwayat Transaksi', path: '/riwayat-transaksi', icon: FaHistory, color: 'bg-green-500' },
    { label: 'Status Klaim', path: '/status-klaim', icon: FaClipboardList, color: 'bg-purple-500' },
    { label: 'Polis Saya', path: '/polis-saya', icon: FaFileInvoice, color: 'bg-orange-500' },
    { label: 'Keuangan', path: '/laporan-keuangan', icon: FaWallet, color: 'bg-pink-500' },
    { label: 'Profil', path: '/profil', icon: FaUser, color: 'bg-indigo-500' },
  ];

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
          {[
            { value: stats.totalPolis, label: 'Polis' },
            { value: stats.totalKlaim, label: 'Klaim' },
            { value: stats.tunggakan, label: 'Tunggakan' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/15 rounded-xl px-3 py-3">
              <p className="text-white text-2xl font-bold">{value}</p>
              <p className="text-white/70 text-xs mt-1">{label}</p>
            </div>
          ))}
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
              <div className="text-xl">{item.icon}</div>
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