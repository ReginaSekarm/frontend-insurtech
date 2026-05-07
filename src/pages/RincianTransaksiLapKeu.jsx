import { useParams, Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { Shield, ArrowLeft, FileText, Calendar } from 'lucide-react';

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

const formatRupiah = (nominal) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(nominal);

export default function RincianTransaksiLapKeu() {
  const { id } = useParams();
  const data = detailTransaksiMap[id];

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Data tidak ditemukan</p>
          <Link to="/laporan-keuangan" className="mt-4 inline-block text-sky-700 font-semibold hover:underline">
            Kembali ke Laporan Keuangan
          </Link>
        </div>
      </div>
    );
  }

  const totalKeseluruhan = data.riwayat.reduce((sum, item) => sum + item.nominal, 0);

  const infoRows = [
    { label: 'Jenis Polis', value: data.namaProduk },
    { label: 'No. Polis', value: data.noPolis },
    ...(data.premiPerBulan
      ? [{ label: 'Premi per Bulan', value: formatRupiah(data.premiPerBulan) }]
      : []),
    { label: 'Status Polis', value: data.statusPolis },
  ];

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── TOP HEADER BAR ── */}
      <div className="bg-gradient-to-r from-sky-950 to-sky-800 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-8">

          {/* Kembali */}
          <Link
            to="/laporan-keuangan"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-5 transition"
          >
            <ArrowLeft size={16} />
          </Link>

          {/* Judul + Badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Shield size={24} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest">Detail Transaksi</p>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{data.namaProduk}</h1>
            </div>
            <span className="ml-auto bg-green-400/20 text-green-300 text-xs font-bold px-3 py-1 rounded-full border border-green-400/30">
              {data.statusPolis}
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-2xl px-4 py-3">
              <p className="text-white/60 text-xs mb-1">Total Dibayar 2026</p>
              <p className="text-white text-xl font-extrabold">{formatRupiah(data.totalDibayar2026)}</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-3">
              <p className="text-white/60 text-xs mb-1">Jumlah Pembayaran</p>
              <p className="text-amber-300 text-xl font-extrabold">{data.jumlahPembayaran}x Bayar</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-3 col-span-2 sm:col-span-1">
              <p className="text-white/60 text-xs mb-1">No. Polis</p>
              <p className="text-white text-sm font-bold truncate">{data.noPolis}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Kolom kiri: Informasi Polis + Total */}
          <div className="lg:col-span-1 space-y-4">

            {/* Informasi Polis */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} className="text-sky-700" />
                <h2 className="text-base font-bold text-gray-800">Informasi Polis</h2>
              </div>
              <div className="space-y-3">
                {infoRows.map(({ label, value }, i) => (
                  <div
                    key={label}
                    className={`flex justify-between items-center ${
                      i < infoRows.length - 1 ? 'pb-3 border-b border-gray-100' : ''
                    }`}
                  >
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-semibold text-gray-800 text-right ml-4">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Keseluruhan */}
            <div className="bg-sky-950 rounded-2xl p-5 flex justify-between items-center">
              <span className="text-white font-semibold text-sm">Total Keseluruhan</span>
              <span className="text-xl font-extrabold text-white">{formatRupiah(totalKeseluruhan)}</span>
            </div>

          </div>

          {/* Kolom kanan: Riwayat Pembayaran */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <Calendar size={16} className="text-sky-700" />
                <h2 className="text-base font-bold text-gray-800">Riwayat Pembayaran Premi</h2>
                <span className="ml-auto bg-sky-50 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {data.riwayat.length} Transaksi
                </span>
              </div>

              <div className="space-y-3">
                {data.riwayat.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-sky-50 transition"
                  >
                    {/* Ikon */}
                    <div className="bg-sky-100 p-2.5 rounded-xl flex-shrink-0">
                      <Shield size={18} className="text-sky-500" strokeWidth={1.5} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{item.tanggal}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.waktu}</p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                      <FaCheckCircle className="text-green-500 text-[10px]" />
                      <span className="text-xs text-green-600 font-semibold">{item.status}</span>
                    </div>

                    {/* Nominal */}
                    <span className="text-sm font-bold text-red-500 flex-shrink-0 ml-2">
                      -{formatRupiah(item.nominal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}