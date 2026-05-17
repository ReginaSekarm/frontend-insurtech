import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaCar, FaHome, FaHeartbeat, FaGraduationCap } from 'react-icons/fa';

const formatRupiah = (nominal) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(nominal);

export default function RincianKelompokTransaksi() {
  const location = useLocation();
  const navigate = useNavigate();
  const { group } = location.state || {};

  const [transaksiList, setTransaksiList] = useState([]);
  const [infoPolis, setInfoPolis] = useState(null);

  useEffect(() => {
    if (!group) {
      navigate('/laporan-keuangan');
      return;
    }

    const stored = localStorage.getItem('userTransaksi');
    if (stored) {
      const allTransaksi = JSON.parse(stored);
      const filtered = allTransaksi.filter(t => t.nama === group.nama);
      setTransaksiList(filtered);

      const transaksiPremi = filtered.find(t => t.tipe === 'premi' && t.noPolis);
      if (transaksiPremi) {
        setInfoPolis({
          jenis: transaksiPremi.nama.replace('Pembayaran Premi ', ''),
          noPolis: transaksiPremi.noPolis,
          premiPerBulan: transaksiPremi.premiPerBulan || transaksiPremi.nominal,
          statusPolis: transaksiPremi.statusPolis || 'Aktif',
        });
      } else {
        const storedPolis = localStorage.getItem('userPolis');
        if (storedPolis) {
          const polisList = JSON.parse(storedPolis);
          const polis = polisList.find(p => group.nama.includes(p.jenis));
          if (polis) {
            setInfoPolis({
              jenis: polis.jenis,
              noPolis: polis.noPolis,
              premiPerBulan: polis.premi,
              statusPolis: 'Aktif',
            });
          }
        }
      }
    }
  }, [group, navigate]);

  if (!group) return null;
  if (transaksiList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-500">Tidak ada transaksi untuk grup ini.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sky-600">Kembali</button>
        </div>
      </div>
    );
  }

  const totalDibayar = transaksiList.reduce((sum, t) => sum + t.nominal, 0);
  const jumlahPembayaran = transaksiList.length;

  // Icon berdasarkan nama grup
  let groupIcon = null;
  if (group.nama.includes('Kendaraan')) groupIcon = <FaCar className="text-white text-2xl" />;
  else if (group.nama.includes('Kesehatan')) groupIcon = <FaHeartbeat className="text-white text-2xl" />;
  else if (group.nama.includes('Properti')) groupIcon = <FaHome className="text-white text-2xl" />;
  else if (group.nama.includes('Pendidikan')) groupIcon = <FaGraduationCap className="text-white text-2xl" />;
  else groupIcon = <Shield size={24} className="text-white" />;

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-4">
          <FaArrowLeft size={16} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 to-sky-800 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-xl">{groupIcon}</div>
            <div>
              <h1 className="text-2xl font-bold">{group.nama}</h1>
              <p className="text-white/60 text-sm mt-1">Ringkasan transaksi</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-xs">Total Dibayar 2026</p>
              <p className="text-xl font-bold">{formatRupiah(totalDibayar)}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">Jumlah Pembayaran</p>
              <p className="text-xl font-bold text-yellow-300">{jumlahPembayaran}x Bayar</p>
            </div>
          </div>
        </div>

        {/* Informasi Polis (jika ada) */}
        {infoPolis && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Informasi Polis</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Jenis Polis</span>
                <span className="font-medium text-gray-800">{infoPolis.jenis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">No. Polis</span>
                <span className="font-medium text-gray-800">{infoPolis.noPolis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Premi per Bulan</span>
                <span className="font-medium text-gray-800">{formatRupiah(infoPolis.premiPerBulan)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Status Polis</span>
                <span className="font-medium text-gray-800">{infoPolis.statusPolis}</span>
              </div>
            </div>
          </div>
        )}

        {/* Riwayat Pembayaran Premi */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Riwayat Pembayaran Premi</h2>
          <div className="space-y-4">
            {transaksiList.map((trx, idx) => (
              <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 flex gap-3">
                {/* Ikon paper plane di kiri */}
                <div className="mt-1">
                  <FaPaperPlane className="text-gray-400 text-xl" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{trx.tanggal}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{trx.waktu || '-'}</p>
                      <span className="inline-block text-xs text-green-700 bg-green-300 px-2 py-0.5 rounded-full mt-1">
                        Lunas
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{formatRupiah(trx.nominal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Keseluruhan */}
        <div className="bg-sky-950 rounded-2xl p-5 flex justify-between items-center mt-6">
          <span className="text-white font-semibold text-sm">Total Keseluruhan</span>
          <span className="text-xl font-extrabold text-white">{formatRupiah(totalDibayar)}</span>
        </div>
      </div>
    </div>
  );
}