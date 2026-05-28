import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function Tunggakan() {
  const [totalTunggakan, setTotalTunggakan] = useState(0);
  const [jumlahTagihan, setJumlahTagihan] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTunggakan = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Memanggil URL absolut backend Laravel
        const response = await fetch('http://127.0.0.1:8000/api/nasabah/tunggakan', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Gagal mengambil data tunggakan');
        const data = await response.json();
        
        setTotalTunggakan(data.totalTunggakan || 0);
        setJumlahTagihan(data.jumlahTagihan || 0);
      } catch (err) {
        console.error('Error fetching tunggakan:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTunggakan();
  }, []);

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6 text-center font-medium text-gray-500">Memuat data tunggakan...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-6 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-sky-950 rounded-2xl p-6 text-white shadow-lg flex items-center gap-4">
        <Link to="/dashboard" className="text-white hover:text-gray-300 transition">
            <FaArrowLeft size={18} />
        </Link>
        <h2 className="text-2xl font-semibold">Tunggakan</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Tunggakan</p>
          <p className="text-4xl font-extrabold text-sky-900 mt-2">
            Rp {totalTunggakan.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Jumlah Tagihan</p>
          <p className="text-4xl font-extrabold text-sky-900 mt-2">
            {jumlahTagihan} polis
          </p>
        </div>
      </div>

      {totalTunggakan === 0 && (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
          <div className="flex justify-center mb-3">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
          <p className="text-xl font-bold text-gray-800">Semua Tagihan Lunas</p>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Tidak ada tunggakan saat ini. Seluruh polis Anda aktif dan terlindungi sepenuhnya.
          </p>
        </div>
      )}
    </div>
  );
}