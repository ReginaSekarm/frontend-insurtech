import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';

const initialKlaimData = [
  { noKlaim: 'KL-2026-018', nasabah: 'Gunandi D.', produk: 'Kesehatan', nilai: 'Rp 2.000.000', dokumen: 'Valid', status: 'Pending' },
  { noKlaim: 'KL-2026-017', nasabah: 'Rina A.', produk: 'Properti', nilai: 'Rp 5.500.000', dokumen: 'Valid', status: 'Pending' },
  { noKlaim: 'KL-2026-016', nasabah: 'Budi S.', produk: 'Pendidikan', nilai: 'Rp 1.200.000', dokumen: 'Tidak Valid', status: 'Ditolak' },
  { noKlaim: 'KL-2026-014', nasabah: 'Siti W.', produk: 'Kesehatan', nilai: 'Rp 500.000', dokumen: 'Valid', status: 'Disetujui' },
  { noKlaim: 'KL-2026-013', nasabah: 'Dodi K.', produk: 'Kesehatan', nilai: 'Rp 3.000.000', dokumen: 'Tidak Valid', status: 'Ditolak' },
];

const statusColor = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Disetujui: 'bg-green-100 text-green-700',
  Ditolak: 'bg-red-100 text-red-700',
};


const dokumenStyle = {
  Valid: 'bg-blue-100 text-gray-500',
  'Tidak Valid': 'bg-orange-100 text-orange-800',
};

const filterButtons = ['Semua', 'Pending', 'Disetujui', 'Ditolak'];

export default function AdminReviewKlaim() {
  const [filter, setFilter] = useState('Semua');
  const navigate = useNavigate();

  const filteredData = initialKlaimData.filter((item) => {
    if (filter === 'Semua') return true;
    return item.status === filter;
  });

  const handleViewDetail = (noKlaim) => {
    navigate(`/admin/review-klaim/detail/${noKlaim}`);
  };

  const handleEdit = (noKlaim) => {
    navigate(`/admin/review-klaim/edit/${noKlaim}`);
  };

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="w-full border-b border-gray-200 shadow-sm px-4 py-2 flex flex-wrap gap-2 -mt-1">
        {filterButtons.map((btn) => (
          <button
            key={btn}
            onClick={() => setFilter(btn)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              filter === btn
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-200 text-left">
                {['NO. KLAIM', 'NASABAH', 'PRODUK', 'NILAI', 'DOKUMEN', 'STATUS', 'AKSI'].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-bold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 text-sky-700 font-medium">{item.noKlaim}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{item.nasabah}</td>
                  <td className="px-5 py-3.5 text-gray-500">{item.produk}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{item.nilai}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-3 py-1 rounded-sm text-xs font-semibold ${dokumenStyle[item.dokumen] || 'bg-gray-100 text-gray-600'}`}>
                      {item.dokumen}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item.noKlaim)}
                        className="border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewDetail(item.noKlaim)}
                        className="text-gray-600 hover:text-sky-700 transition"
                        title="Lihat detail"
                      >
                        <FiEye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-500">
                    Tidak ada data klaim untuk filter "{filter}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}