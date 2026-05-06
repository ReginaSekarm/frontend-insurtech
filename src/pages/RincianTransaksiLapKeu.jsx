import { useParams, Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

// Data dummy detail transaksi
const detailTransaksiMap = {
  1: {
    namaProduk: 'Asuransi Kesehatan',
    totalDibayar2026: 800000,
    jumlahPembayaran: 4,
    noPolis: '#POL-2026-0312',
    premiPerBulan: 200000,
    statusPolis: 'Aktif',
    riwayat: [
      { tanggal: '11 Maret 2026', waktu: '09:14 WIB', nominal: 200000, status: 'Lunas' },
      { tanggal: '11 Februari 2026', waktu: '10:04 WIB', nominal: 200000, status: 'Lunas' },
      { tanggal: '11 Januari 2026', waktu: '08:45 WIB', nominal: 200000, status: 'Lunas' },
      { tanggal: '11 April 2026', waktu: '09:50 WIB', nominal: 200000, status: 'Lunas' },
    ],
  },
  2: {
    namaProduk: 'Klaim Kesehatan',
    totalDibayar2026: 1500000,
    jumlahPembayaran: 1,
    noPolis: '#CLAIM-2025-001',
    premiPerBulan: null,
    statusPolis: 'Selesai',
    riwayat: [
      { tanggal: '30 Februari 2025', waktu: '14:20 WIB', nominal: 1500000, status: 'Disetujui' },
    ],
  },
  3: {
    namaProduk: 'Klaim Kesehatan',
    totalDibayar2026: 1000000,
    jumlahPembayaran: 1,
    noPolis: '#CLAIM-2025-002',
    premiPerBulan: null,
    statusPolis: 'Selesai',
    riwayat: [
      { tanggal: '30 Februari 2025', waktu: '11:05 WIB', nominal: 1000000, status: 'Disetujui' },
    ],
  },
};

const formatRupiah = (nominal) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(nominal);
};

export default function DetailTransaksi() {
  const { id } = useParams();
  const data = detailTransaksiMap[id];

  if (!data) {
    return <div className="p-4 text-center text-gray-500">Data tidak ditemukan</div>;
  }

  const totalKeseluruhan = data.riwayat.reduce((sum, item) => sum + item.nominal, 0);

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Header dengan tombol kembali */}
      <div className="flex items-center gap-3">
        <Link to="/riwayattransaksi" className="text-blue-600 hover:text-blue-800">
        </Link>
        <h1 className="text-xl font-bold text-gray-800">Detail Transaksi</h1>
      </div>

      {/* Card 1: Ringkasan Pembayaran */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Total Dibayar 2026</p>
            <p className="text-2xl font-bold text-gray-800">
              {formatRupiah(data.totalDibayar2026)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Jumlah Pembayaran</p>
            <p className="text-2xl font-bold text-amber-300">
              {data.jumlahPembayaran}x Bayar
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: Informasi Polis */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Informasi Polis</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Jenis Polis</span>
            <span className="font-medium text-gray-800">{data.namaProduk}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">No. Polis</span>
            <span className="font-medium text-gray-800">{data.noPolis}</span>
          </div>
          {data.premiPerBulan && (
            <div className="flex justify-between">
              <span className="text-gray-600">Premi per Bulan</span>
              <span className="font-medium text-gray-800">
                {formatRupiah(data.premiPerBulan)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Status Polis</span>
            <span className="text-gray-800 font-medium">{data.statusPolis}</span>
          </div>
        </div>
      </div>

      {/* Card 3: Riwayat Pembayaran Premi (tanpa total) */}
        <div className="bg-white rounded-xl shadow-md p-5">
        <h2 className="text-lg font-semibold mb-3">Riwayat Pembayaran Premi</h2>
        <div className="space-y-4">
            {data.riwayat.map((item, idx) => (
            <div key={idx} className="border-b border-gray-100 pb-3 last:border-0">
                {/* Baris atas: tanggal di kiri, nominal di kanan */}
                <div className="flex justify-between items-start">
                <span className="font-medium text-gray-800">{item.tanggal}</span>
                <span className="font-bold text-red-600">{formatRupiah(item.nominal)}</span>
                </div>
                {/* Baris tengah: waktu di kiri */}
                <div className="mt-1">
                <span className="text-sm text-gray-500">{item.waktu}</span>
                </div>
                {/* Baris bawah: icon dan status Lunas di kiri */}
                <div className="mt-1 flex items-center gap-1">
                <FaCheckCircle className="text-green-600 text-xs" />
                <span className="text-xs text-green-600">{item.status}</span>
                </div>
            </div>
            ))}
        </div>
        </div>

      {/* Card 4: Total Keseluruhan (card terpisah) */}
      <div className="bg-sky-900 rounded-xl shadow-md p-5">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-white">Total Keseluruhan</span>
          <span className="text-xl font-bold text-white">{formatRupiah(totalKeseluruhan)}</span>
        </div>
      </div>
    </div>
  );
}