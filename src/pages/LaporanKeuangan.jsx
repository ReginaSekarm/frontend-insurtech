import { Link } from 'react-router-dom';
import { FaChevronRight, FaEnvelopeCircleCheck } from 'react-icons/fa6';
import { Shield } from 'lucide-react';

const daftarTransaksi = [
  {
    id: 1,
    nama: 'Premi Kesehatan',
    nominal: 200000,
    tanggal: '11 Mar 2025',
    status: 'Pembayaran Bulanan',
    tipe: 'premi', // untuk menentukan icon
  },
  {
    id: 2,
    nama: 'Klaim Dana Rawat Jalan',
    nominal: 1500000,
    tanggal: '30 Feb 2025',
    status: 'Klaim disetujui',
    tipe: 'klaim',
  },
  {
    id: 3,
    nama: 'Klaim Dana Rawat Jalan',
    nominal: 1000000,
    tanggal: '30 Feb 2025',
    status: 'Klaim disetujui',
    tipe: 'klaim',
  },
];

const formatRupiah = (nominal) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(nominal);
};

// Fungsi untuk memilih icon berdasarkan tipe
const getIcon = (tipe) => {
  if (tipe === 'premi') {
    return <Shield className="text-red-500 text-2xl" />;
  }
  return <FaEnvelopeCircleCheck className="text-green-500 text-2xl" />;
};

export default function LaporanKeuangan() {
  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-sky-950">Laporan Keuangan</h1>
      <h2 className="text-lg font-semibold text-gray-700">Rincian Transaksi</h2>

      <div className="space-y-3">
        {daftarTransaksi.map((item) => (
          // Card putih untuk setiap transaksi
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md p-4 flex items-start gap-3 hover:shadow-lg transition"
          >
            {/* Icon di samping kiri */}
            <div className="mt-1">{getIcon(item.tipe)}</div>

            {/* Detail transaksi */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-medium text-gray-800">{item.nama}</p>
                <p className="font-semibold text-gray-800">{formatRupiah(item.nominal)}</p>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{item.tanggal}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.status}</p>
            </div>

            {/* Tombol panah kanan (navigasi) */}
            <Link to={`/rinciantransaksilapkeu/${item.id}`} className="mt-2">
              <FaChevronRight className="text-gray-400 hover:text-blue-600 text-xl cursor-pointer" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}