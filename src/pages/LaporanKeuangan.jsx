import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa6';
import { FaHeartbeat } from 'react-icons/fa';
import { FaHandHoldingUsd } from 'react-icons/fa';
import { api } from '../lib/api'; // TAMBAHAN: Import fungsi api

const formatRupiah = (nominal) => {
  const num = Number(nominal) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
};

const getIcon = (tipe) => {
  const t = (tipe || '').toLowerCase();
  if (t === 'premi') {
    return <FaHeartbeat className="text-red-500 text-2xl" />;
  }
  if (t === 'klaim') {
    return <FaHandHoldingUsd className="text-green-500 text-2xl" />;
  }
  return <FaHeartbeat className="text-gray-500 text-2xl" />;
};

export default function LaporanKeuangan() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLaporanKeuangan = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // PERUBAHAN: Gunakan fungsi api()
        // Mengarah ke route resource /laporan-keuangan yang sudah ada di api.php
        const response = await api('/laporan-keuangan', 'GET', null, token);
        
        // Memastikan bentuk datanya adalah array
        const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        
        setGroups(data);
      } catch (err) {
        console.error('Error fetching laporan:', err);
        // Jika endpoint belum ada/merespon 404, fallback ke array kosong agar UI tidak merah
        if (err.message && err.message.includes('404')) {
          setGroups([]);
        } else {
          setError(err.message || 'Gagal mengambil data laporan keuangan');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLaporanKeuangan();
  }, []);

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold text-sky-950">Laporan Keuangan</h1>
        <h2 className="text-lg font-semibold text-gray-700">Rincian Transaksi</h2>
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold text-sky-950">Laporan Keuangan</h1>
        <h2 className="text-lg font-semibold text-gray-700">Rincian Transaksi</h2>
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-sky-950">Laporan Keuangan</h1>
      <h2 className="text-lg font-semibold text-gray-700">Rincian Transaksi</h2>

      <div className="space-y-3">
        {groups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">Belum ada transaksi.</p>
          </div>
        ) : (
          groups.map((group, index) => (
            <div
              key={group.id || group.nama || index}
              className="bg-white rounded-xl shadow-md p-4 flex items-start gap-3 hover:shadow-lg transition"
            >
              <div className="mt-1">{getIcon(group.tipe)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-gray-800">{group.nama || 'Transaksi'}</p>
                  <p className="font-semibold text-gray-800">{formatRupiah(group.totalNominal || 0)}</p>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {group.jumlahTransaksi || 0} transaksi · Terakhir: {group.terbaru || '-'}
                </p>
              </div>
              {/* Tautan ke halaman rincian transaksi */}
              <Link
                to={`/rinciantransaksilapkeu/${group.id || encodeURIComponent(group.nama)}`}
                state={{ group: group }}
                className="mt-2"
              >
                <FaChevronRight className="text-gray-400 hover:text-blue-600 text-xl cursor-pointer" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}