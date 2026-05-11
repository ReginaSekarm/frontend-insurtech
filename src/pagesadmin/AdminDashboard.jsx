import { User, ShieldCheck, ClipboardClock, Banknote } from 'lucide-react';

const statsData = [
  { label: 'PENGGUNA', value: '1.284', icon: <User size={28} />, bg: 'bg-white', iconBg: 'bg-blue-100', iconColor: 'text-sky-900' },
  { label: 'POLIS AKTIF', value: '3.410', icon: <ShieldCheck size={28} />, bg: 'bg-white', iconBg: 'bg-blue-100', iconColor: 'text-sky-900' },
  { label: 'KLAIM PENDING', value: '5', icon: <ClipboardClock size={28} />, bg: 'bg-white', iconBg: 'bg-amber-200', iconColor: 'text-orange-600' },
  { label: 'PREMI BULAN INI', value: 'Rp 68jt', icon: <Banknote size={28} />, bg: 'bg-white', iconBg: 'bg-lime-200', iconColor: 'text-green-600' },
];

const klaimData = [
  { noKlaim: 'KL-2026-018', nasabah: 'Gunandi D.', produk: 'Kesehatan', nilai: 'Rp 2.000.000', status: 'Pending' },
  { noKlaim: 'KL-2026-018', nasabah: 'Rina A.', produk: 'Properti', nilai: 'Rp 5.500.000', status: 'Pending' },
  { noKlaim: 'KL-2026-018', nasabah: 'Budi S.', produk: 'Pendidikan', nilai: 'Rp 1.200.000', status: 'Diproses' },
  { noKlaim: 'KL-2026-018', nasabah: 'Siti W.', produk: 'Kesehatan', nilai: 'Rp 500.000', status: 'Disetujui' },
  { noKlaim: 'KL-2026-018', nasabah: 'Dodi K.', produk: 'Kesehatan', nilai: 'Rp 3.000.000', status: 'Ditolak' },
];

const statusColor = {
  Pending: 'bg-yellow-200 text-yellow-600',
  Diproses: 'bg-blue-100 text-blue-500',
  Disetujui: 'bg-green-100 text-green-500',
  Ditolak: 'bg-red-100 text-red-500',
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map(({ label, value, icon, bg, iconBg, iconColor }) => (
          <div key={label} className={`${bg} rounded-xl p-4 flex items-center gap-4`}>
            <div className={`${iconBg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
              {icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-extrabold text-gray-800 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabel Klaim */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Klaim Perlu Ditinjau</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">No Klaim</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nasabah</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Produk</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nilai</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {klaimData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sky-700 font-medium">{item.noKlaim}</td>
                  <td className="px-6 py-4 text-gray-800">{item.nasabah}</td>
                  <td className="px-6 py-4 text-gray-600">{item.produk}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{item.nilai}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[item.status]}`}>
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