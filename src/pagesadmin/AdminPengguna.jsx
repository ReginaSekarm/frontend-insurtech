import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCheckCircle, FaExclamationTriangle} from 'react-icons/fa';

// Data verifikasi dokumen (ditambahkan id dan jenisDokumen)
const verifikasiData = [
  { id: 1, nama: 'Adinda Saraswati', pending: 'KTP Pending KK Pending', jenisDokumen: 'KTP' },
  { id: 2, nama: 'Budi Hartono', pending: 'KTP Pending KK Pending', jenisDokumen: 'Kartu Keluarga' },
  { id: 3, nama: 'Budi Hartono', pending: 'KTP Pending KK Pending', jenisDokumen: 'KTP' },
];

// Data pengguna (contoh)
const penggunaData = [
  { nama: 'Siti Rahma', email: 'siti.rahma@gmail.com', polis: 3, klaim: 2, ktp: true, kk: true },
  { nama: 'Eko Prasetyo', email: 'eko.pras@gmail.com', polis: 1, klaim: 0, ktp: true, kk: false },
  { nama: 'Dwi Lestari', email: 'dlestari@gmail.com', polis: 2, klaim: 1, ktp: false, kk: false },
];

export default function AdminPengguna() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

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
        </div>
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">Data Pengguna</h2>
          {/* Search input optional */}
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
              {penggunaData
                .filter(user => user.nama.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()))
                .map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 text-sky-700 font-semibold">{item.nama}</td>
                  <td className="px-5 py-3.5 text-gray-600">{item.email}</td>
                  <td className="px-5 py-3.5 text-gray-800 font-medium">{item.polis}</td>
                  <td className="px-5 py-3.5 text-gray-800 font-medium">{item.klaim}</td>
                  <td className="px-5 py-3.5">
                    {item.ktp ? <span className="text-green-500 text-lg"><FaCheckCircle /></span> : <span className="text-orange-400 text-lg"><FaExclamationTriangle /></span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {item.kk ? <span className="text-green-500 text-lg"><FaCheckCircle /></span> : <span className="text-orange-400 text-lg"><FaExclamationTriangle /></span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer tabel */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Menampilkan {penggunaData.filter(user => user.nama.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase())).length} dari {penggunaData.length} Pengguna
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