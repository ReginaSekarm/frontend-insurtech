import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa6';
import { FaHeartbeat } from 'react-icons/fa';
import { FaHandHoldingUsd } from 'react-icons/fa';

const formatRupiah = (nominal) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(nominal);
};

const getIcon = (tipe) => {
  if (tipe === 'premi') {
    return <FaHeartbeat className="text-red-500 text-2xl" />;
  }
  if (tipe === 'klaim') {
    return <FaHandHoldingUsd className="text-green-500 text-2xl" />;
  }
  return <FaHeartbeat className="text-gray-500 text-2xl" />;
};

export default function LaporanKeuangan() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('userTransaksi');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const map = new Map();
        data.forEach(item => {
          const key = item.nama;
          if (!map.has(key)) {
            map.set(key, {
              nama: key,
              tipe: item.tipe,
              totalNominal: 0,
              jumlahTransaksi: 0,
              terbaru: item.tanggal,
              id: item.id 
             });
          }
          const group = map.get(key);
          group.totalNominal += item.nominal;
          group.jumlahTransaksi += 1;
          if (new Date(item.tanggal) > new Date(group.terbaru)) group.terbaru = item.tanggal;
        });
        
        const groupedArray = Array.from(map.values()).sort((a, b) => new Date(b.terbaru) - new Date(a.terbaru));
        setGroups(groupedArray);
      } catch (e) {
        console.error(e);
        setGroups([]);
      }
    } else {
      setGroups([]);
    }
  }, []);

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
          groups.map((group) => (
            <div
              key={group.nama}
              className="bg-white rounded-xl shadow-md p-4 flex items-start gap-3 hover:shadow-lg transition"
            >
              <div className="mt-1">{getIcon(group.tipe)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-gray-800">{group.nama}</p>
                  <p className="font-semibold text-gray-800">{formatRupiah(group.totalNominal)}</p>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {group.jumlahTransaksi} transaksi · Terakhir: {group.terbaru}
                </p>
              </div>
              {/* Tautan ke halaman rincian transaksi */}
              <Link
                to="/rinciantransaksilapkeu/:id"
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