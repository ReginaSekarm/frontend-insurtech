import { useState } from 'react';
import { User, ShieldCheck, ClipboardClock } from 'lucide-react';
import {FaMoneyBillWave} from 'react-icons/fa';

export default function AdminDashboard() {
  // Data statistik (contoh)
  const stats = [
    { label: 'Pengguna', value: '1.284', icon: <User size={28} />, bg: 'bg-white', iconBg: 'bg-blue-100', iconColor: 'text-sky-900' },
    { label: 'Polis Aktif', value: '3.410', icon: <ShieldCheck size={28} />, bg: 'bg-white', iconBg: 'bg-green-100', iconColor: 'text-sky-900' },
    { label: 'Klaim Pending', value: '5', icon: <ClipboardClock size={28} />, bg: 'bg-white', iconBg: 'bg-yellow-100', iconColor: 'text-orange-600' },
    { label: 'Premi Bulan Ini', value: 'Rp 68jt', icon: <FaMoneyBillWave size={28} />, bg: 'bg-white', iconBg: 'bg-purple-100', iconColor: 'text-green-600' },
  ];

  // Data tabel klaim (contoh)
  const klaimData = [
    { no: 'KL-2026-018', nasabah: 'Gunandi D.', produk: 'Kesehatan', nilai: 'Rp 2.000.000', dokumen: 'Valid', status: 'Disetujui' },
    { no: 'KL-2026-017', nasabah: 'Rina A.', produk: 'Properti', nilai: 'Rp 5.500.000', dokumen: 'Valid', status: 'Disetujui' },
    { no: 'KL-2026-016', nasabah: 'Budi S.', produk: 'Pendidikan', nilai: 'Rp 1.200.000', dokumen: 'Tidak Valid', status: 'Ditolak' },
    { no: 'KL-2026-014', nasabah: 'Siti W.', produk: 'Kesehatan', nilai: 'Rp 500.000', dokumen: 'Valid', status: 'Disetujui' },
    { no: 'KL-2026-013', nasabah: 'Dodi K.', produk: 'Kesehatan', nilai: 'Rp 3.000.000', dokumen: 'Tidak valid', status: 'Ditolak' },
  ];

  // Fungsi untuk menentukan warna status
  const getStatusColor = (status) => {
    if (status === 'Disetujui') return 'text-green-600 bg-green-50';
    if (status === 'Ditolak') return 'text-red-600 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getDokumenColor = (dokumen) => {
    if (dokumen === 'Valid') return 'text-green-600';
    return 'text-red-600';
  };

  const dokumenStyle = {
  Valid: 'bg-blue-100 text-gray-500',
  'Tidak Valid': 'bg-orange-100 text-orange-800',
};

  return (
    <div className="space-y-6">

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.bg} rounded-xl p-4 flex items-center gap-4 shadow-sm`}>
            <div className={`p-3 rounded-full ${stat.iconBg}`}>
              <div className={stat.iconColor}>{stat.icon}</div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-2xl font-extrabold ${stat.text} mt-1`}>{stat.value}</p>
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