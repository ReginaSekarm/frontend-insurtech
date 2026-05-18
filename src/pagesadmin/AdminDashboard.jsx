import { useState, useEffect } from 'react';
import { User, ShieldCheck, ClipboardClock } from 'lucide-react';
import { FaMoneyBillWave } from 'react-icons/fa';

export default function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [klaimData, setKlaimData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Ganti dengan endpoint API yang sesuai
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) {
          throw new Error('Gagal mengambil data dashboard');
        }
        const data = await response.json();
        // Asumsikan data.stats dan data.klaim sesuai format
        setStats(data.stats || []);
        setKlaimData(data.klaim || []);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fungsi untuk menentukan warna status (tetap sama)
  const getStatusColor = (status) => {
    if (status === 'Disetujui') return 'text-green-600 bg-green-50';
    if (status === 'Ditolak') return 'text-red-600 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const dokumenStyle = {
    Valid: 'bg-blue-100 text-gray-500',
    'Tidak Valid': 'bg-orange-100 text-orange-800',
  };

  if (loading) {
    return <div className="p-6 text-center">Memuat data dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.bg || 'bg-white'} rounded-xl p-4 flex items-center gap-4 shadow-sm`}>
            <div className={`p-3 rounded-full ${stat.iconBg || 'bg-gray-100'}`}>
              <div className={stat.iconColor || 'text-gray-600'}>{stat.icon}</div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-2xl font-extrabold ${stat.text || 'text-gray-800'} mt-1`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabel Klaim */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-300">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">NO. KLAIM</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">NASABAH</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">PRODUK</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">NILAI</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">DOKUMEN</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">STATUS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {klaimData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-sky-900">{item.no}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{item.nasabah}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{item.produk}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{item.nilai}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-3 py-1 rounded-sm text-xs font-semibold ${dokumenStyle[item.dokumen] || 'bg-orange-100 text-orange-800'}`}>
                      {item.dokumen}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}