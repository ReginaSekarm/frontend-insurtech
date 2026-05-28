import { useState, useEffect } from 'react';
import {
  FaMoneyBillWave,
  FaHandHoldingUsd,
  FaFileInvoiceDollar,
} from 'react-icons/fa';
import { api } from '../lib/api'; 

export default function RiwayatTransaksi() {
  const [transaksi, setTransaksi] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransaksi = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Memanggil rute resmi backend Laravel yang sudah kita hubungkan kemarin
        const response = await api('/nasabah/riwayat-transaksi', 'GET', null, token);
        
        // Amankan data, bongkar pembungkus array bawaan dari Laravel secara defensif
        const resData = response.data || response;
        const data = Array.isArray(resData) ? resData : (resData?.data || []);
        
        // Urutkan berdasarkan tanggal terbaru
        data.sort((a, b) => new Date(b.tanggal || b.created_at) - new Date(a.tanggal || a.created_at));
        setTransaksi(data);
      } catch (err) {
        console.error('Error fetching transaksi:', err);
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
    const t = (tipe || 'premi').toLowerCase();
    if (t.includes('premi') || t.includes('asuransi')) {
      return <FaMoneyBillWave className="text-green-500 text-2xl" />;
    } else if (t.includes('klaim')) {
      return <FaHandHoldingUsd className="text-blue-500 text-2xl" />;
    }
    return <FaFileInvoiceDollar className="text-gray-500 text-2xl" />;
  };

  const groupByMonth = (data) => {
    const grouped = {};
    data.forEach(item => {
      const itemDate = item.tanggal || item.created_at;
      if (!itemDate) return;

      let date = new Date(itemDate);
      
      // Jika format tanggal yang datang berupa string lokal "28 Mei 2026", lakukan pemetaan manual
      if (isNaN(date)) {
        const months = { Jan: 0, Janu: 0, Feb: 1, Febr: 1, Mar: 2, Mare: 2, Apr: 3, Apri: 3, Mei: 4, May: 4, Jun: 5, Juni: 5, Jul: 6, Juli: 6, Agu: 7, Agus: 7, Aug: 7, Sep: 8, Sept: 8, Okt: 9, Okto: 9, Oct: 9, Nov: 10, Nove: 10, Des: 11, Dese: 11, Dec: 11 };
        const parts = itemDate.split(' ');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = months[parts[1].substring(0, 4)];
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
    // Parsing string "BULAN TAHUN" kembali ke objek Date untuk disortir kronologis ke bawah
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
    return <span className="text-black font-extrabold text-base whitespace-nowrap">{formatted}</span>;
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6 text-center font-medium text-gray-500">Memuat riwayat transaksi...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-6 text-center text-red-600 font-semibold">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 px-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h1>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
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
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <FaFileInvoiceDollar className="text-gray-300 text-5xl mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada catatan riwayat transaksi pembayaran.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMonths.map((month) => (
            <div key={month} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4">{month}</h2>
              <div className="space-y-4">
                {grouped[month].map((trx, idx) => (
                  <div key={trx.id || idx} className="flex gap-4 items-center justify-between">
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 p-2.5 bg-gray-50 rounded-xl">{getIcon(trx.tipe || trx.jenis)}</div>
                      <div>
                        <p className="font-bold text-gray-800">{trx.jenis || trx.nama || 'Pembayaran Premi'}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">
                          {trx.noPolis || trx.ID_Polis ? `No. Polis: ${trx.noPolis || trx.ID_Polis} · ` : ''}
                          {trx.tanggal}
                        </p>
                      </div>
                    </div>
                    {formatNominal(trx.nominal)}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {filteredMonths.length === 0 && selectedMonth && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 font-medium">Tidak ada transaksi pembayaran untuk bulan {selectedMonth}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}