import { useState } from 'react';

const verifikasiData = [
  { nama: 'Adinda Saraswati', pending: 'KTP Pending' },
  { nama: 'Budi Hartono', pending: 'KK Pending' },
  { nama: 'Budi Hartono', pending: 'KTP Pending' },
];

const penggunaData = [
  { nama: 'Siti Rahma', email: 'siti.rahma@gmail.com', polis: 3, klaim: 2, ktp: true, kk: true },
  { nama: 'Eko Prasetyo', email: 'eko.pras@gmail.com', polis: 1, klaim: 0, ktp: true, kk: false },
  { nama: 'Dwi Lestari', email: 'dlestari@gmail.com', polis: 2, klaim: 1, ktp: false, kk: false },
];

export default function AdminPengguna() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wide">
        <span>Admin</span>
        <span>›</span>
        <span className="text-gray-600">Manajemen Pengguna</span>
      </div>

      {/* Verifikasi Pending */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-bold text-gray-800">Verifikasi Dokumen Pending</h2>
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">
            24 Pending
          </span>
        </div>
        <div className="space-y-3">
          {verifikasiData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                👤
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{item.nama}</p>
                <p className="text-xs text-green-600 font-medium mt-0.5">+ {item.pending}</p>
              </div>
              <button className="bg-[#1B3A5C] hover:bg-sky-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
                Verifikasi
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">Klaim Perlu Ditinjau</h2>
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
              {penggunaData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 text-sky-700 font-semibold">{item.nama}</td>
                  <td className="px-5 py-3.5 text-gray-600">{item.email}</td>
                  <td className="px-5 py-3.5 text-gray-800 font-medium">{item.polis}</td>
                  <td className="px-5 py-3.5 text-gray-800 font-medium">{item.klaim}</td>
                  <td className="px-5 py-3.5">
                    {item.ktp
                      ? <span className="text-green-500 text-lg">✅</span>
                      : <span className="text-orange-400 text-lg">⚠️</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {item.kk
                      ? <span className="text-green-500 text-lg">✅</span>
                      : <span className="text-orange-400 text-lg">⚠️</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer tabel */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Menampilkan 3 dari 12 Klaim
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