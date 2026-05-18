import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function AdminPengguna() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [verifikasiData, setVerifikasiData] = useState([]);
  const [penggunaData, setPenggunaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Ambil daftar verifikasi pending
        const verifRes = await fetch('/api/admin/verifikasi-pending', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!verifRes.ok) throw new Error('Gagal mengambil data verifikasi');
        const verifData = await verifRes.json();
        setVerifikasiData(verifData);

        // Ambil daftar pengguna
        const userRes = await fetch('/api/admin/pengguna', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!userRes.ok) throw new Error('Gagal mengambil data pengguna');
        const userData = await userRes.json();
        setPenggunaData(userData);
      } catch (err) {
        console.error('Error fetching admin pengguna:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPengguna = penggunaData.filter(user =>
    user.nama.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6 text-center">Memuat data pengguna...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <h1 className="text-base font-bold text-gray-600">MANAJEMEN PENGGUNA</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola semua pengguna yang terdaftar</p>
      </div>

      {/* Verifikasi Pending */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-bold text-gray-800">Verifikasi Dokumen Pending</h2>
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">
            {verifikasiData.length} Pending
          </span>
        </div>
        <div className="space-y-3">
          {verifikasiData.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                <FaUser />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{item.nama}</p>
                <p className="text-xs text-orange-600 font-medium mt-0.5">{item.pending}</p>
              </div>
              <button
                onClick={() => navigate('/admin-verifikasi-dokumen', { state: { userData: item } })}
                className="bg-[#1B3A5C] hover:bg-sky-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                Verifikasi
              </button>
            </div>
          ))}
          {verifikasiData.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">Tidak ada dokumen pending.</div>
          )}
        </div>
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">Data Pengguna</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {['NAMA', 'EMAIL', 'POLIS', 'KLAIM', 'KTP', 'KK'].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPengguna.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 text-sky-700 font-semibold">{item.nama}</td>
                  <td className="px-5 py-3.5 text-gray-600">{item.email}</td>
                  <td className="px-5 py-3.5 text-gray-800 font-medium">{item.polis}</td>
                  <td className="px-5 py-3.5 text-gray-800 font-medium">{item.klaim}</td>
                  <td className="px-5 py-3.5">
                    {item.ktp ? <FaCheckCircle className="text-green-500 text-lg" /> : <FaExclamationTriangle className="text-orange-400 text-lg" />}
                  </td>
                  <td className="px-5 py-3.5">
                    {item.kk ? <FaCheckCircle className="text-green-500 text-lg" /> : <FaExclamationTriangle className="text-orange-400 text-lg" />}
                  </td>
                </tr>
              ))}
              {filteredPengguna.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">Tidak ada data pengguna.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Menampilkan {filteredPengguna.length} dari {penggunaData.length} Pengguna
          </p>
          <div className="flex gap-1">
            <button className="w-7 h-7 border border-gray-300 rounded text-xs hover:bg-gray-50">‹</button>
            <button className="w-7 h-7 border border-gray-300 rounded text-xs hover:bg-gray-50">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}