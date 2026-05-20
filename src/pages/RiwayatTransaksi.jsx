import { useState, useEffect } from 'react';
import {
  FaMoneyBillWave,
  FaHandHoldingUsd,
  FaFileInvoiceDollar,
} from 'react-icons/fa';
import { api } from '../lib/api'; // TAMBAHAN: Import fungsi api

export default function RiwayatTransaksi() {
  const [transaksi, setTransaksi] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransaksi = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // PERUBAHAN: Gunakan fungsi api()
        // Pastikan endpoint '/riwayat-transaksi' sudah ada di routes/api.php backend kamu ya
        const response = await api('/riwayat-transaksi', 'GET', null, token);
        
        // Amankan data, pastikan bentuknya array
        const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        
        // Urutkan berdasarkan tanggal terbaru
        data.sort((a, b) => new Date(b.tanggal || b.created_at) - new Date(a.tanggal || a.created_at));
        setTransaksi(data);
      } catch (err) {
        console.error('Error fetching transaksi:', err);
        // Jika endpoint belum ada (404), kita anggap saja belum ada transaksi
        if (err.message && err.message.includes('404')) {
          setTransaksi([]);
        } else {
          setError(err.message || 'Gagal mengambil data transaksi');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTransaksi();
  }, []);

  const getIcon = (tipe) => {
    const t = (tipe || '').toLowerCase();
    if (t.includes('premi')) {
      return <FaMoneyBillWave className="text-green-500 text-2xl" />;
    } else if (t.includes('klaim')) {
      return <FaHandHoldingUsd className="text-blue-500 text-2xl" />;
    }
    return <FaFileInvoiceDollar className="text-gray-500 text-2xl" />;
  };

  const groupByMonth = (data) => {
    const grouped = {};
    data.forEach(item => {
      // Gunakan tanggal atau created_at dari backend
      const itemDate = item.tanggal || item.created_at;
      if (!itemDate) return;

      let date = new Date(itemDate);
      if (isNaN(date)) {
        const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, May: 4, Jun: 5, Jul: 6, Agu: 7, Aug: 7, Sep: 8, Okt: 9, Oct: 9, Nov: 10, Des: 11, Dec: 11 };
        const parts = itemDate.split(' ');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = months[parts[1]];
          const year = parseInt(parts[2]);
          if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            date = new Date(year, month, day);
          }
        }
      }
      if (isNaN(date)) return;
      
      const monthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
      if (!grouped[monthYear]) grouped[monthYear] = [];
      grouped[monthYear].push(item);
    });
    return grouped;
  };

  const grouped = groupByMonth(transaksi);
  const months = Object.keys(grouped).sort((a, b) => {
    // Parsing string "BULAN TAHUN" kembali ke Date untuk disortir
    const dateA = new Date(`1 ${a}`);
    const dateB = new Date(`1 ${b}`);
    return dateB - dateA;
  });
  
  const filteredMonths = selectedMonth
    ? months.filter(m => m.includes(selectedMonth.toUpperCase()))
    : months;

  const formatNominal = (nominal) => {
    const num = Number(nominal) || 0;
    const formatted = `Rp ${num.toLocaleString('id-ID')}`;
    return <span className="text-black font-bold">{formatted}</span>;
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6 text-center">Memuat riwayat transaksi...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-6 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 px-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h1>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Semua Periode</option>
            <option value="Januari">Januari</option>
            <option value="Februari">Februari</option>
            <option value="Maret">Maret</option>
            <option value="April">April</option>
            <option value="Mei">Mei</option>
            <option value="Juni">Juni</option>
            <option value="Juli">Juli</option>
            <option value="Agustus">Agustus</option>
            <option value="September">September</option>
            <option value="Oktober">Oktober</option>
            <option value="November">November</option>
            <option value="Desember">Desember</option>
          </select>
        </div>
      </div>

      {/* Daftar transaksi */}
      {transaksi.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <p className="text-gray-500">Belum ada transaksi.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMonths.map((month) => (
            <div key={month} className="bg-white rounded-xl shadow-md p-5">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">{month}</h2>
              <div className="space-y-4">
                {grouped[month].map((trx, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="mt-1">{getIcon(trx.tipe || trx.Jenis_Transaksi)}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{trx.nama || trx.Nama_Transaksi || 'Transaksi'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {trx.noPolis || trx.ID_Polis ? `${trx.noPolis || trx.ID_Polis} · ` : ''}
                            {trx.tanggal || trx.created_at}
                          </p>
                        </div>
                        {formatNominal(trx.nominal || trx.Nominal)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredMonths.length === 0 && selectedMonth && (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-500">Tidak ada transaksi untuk bulan {selectedMonth}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}