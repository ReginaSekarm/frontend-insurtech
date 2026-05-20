import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaHome, FaHeartbeat, FaCar, FaGraduationCap } from 'react-icons/fa';
import { api } from '../lib/api'; 

export default function PolisSaya() {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [polisList, setPolisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getIconByJenis = (jenis) => {
    if (!jenis) return <FaHome className="text-gray-400 text-3xl" />;
    if (jenis.includes('Kesehatan')) return <FaHeartbeat className="text-red-500 text-3xl" />;
    if (jenis.includes('Properti')) return <FaHome className="text-blue-300 text-3xl" />;
    if (jenis.includes('Kendaraan')) return <FaCar className="text-amber-300 text-3xl" />;
    if (jenis.includes('Pendidikan')) return <FaGraduationCap className="text-zinc-600 text-3xl" />;
    return <FaHome className="text-gray-400 text-3xl" />;
  };

  useEffect(() => {
    const fetchPolis = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api('/polis/saya', 'GET', null, token);
        
        // PERBAIKAN UTAMA: Bongkar data bertumpuk response.data.data dari Axios + Laravel JSON wrapper
        let polisArray = [];
        if (response && response.data) {
          polisArray = Array.isArray(response.data) ? response.data : (response.data.data || []);
        } else if (Array.isArray(response)) {
          polisArray = response;
        }

        const withIcons = polisArray.map(polis => {
          const namaJenis = polis.jenis || polis.Nama_Produk || 'Asuransi Umum';
          return {
            ...polis,
            id: polis.id || polis.ID_Polis,
            jenis: namaJenis,
            noPolis: polis.noPolis || polis.ID_Polis || '-',
            premiFormatted: polis.premiFormatted || (polis.Total_Premi ? `Rp ${Number(polis.Total_Premi).toLocaleString('id-ID')}` : 'Rp 0'),
            periode: polis.periode || '/ bulan',
            icon: getIconByJenis(namaJenis)
          };
        });
        
        setPolisList(withIcons);
      } catch (err) {
        console.error('Error fetching polis:', err);
        setError(err.message || 'Gagal mengambil data polis dari server');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPolis();
  }, []);

  const filteredPolis = polisList.filter(
    (polis) =>
      (polis.jenis && polis.jenis.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (polis.noPolis && polis.noPolis.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6 text-center font-medium text-gray-500">Memuat data polis...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-6 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Polis Saya</h1>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="text-gray-500 hover:text-blue-600 transition"
        >
          <FaSearch size={22} />
        </button>
      </div>

      {/* Total polis */}
      <div>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-semibold">
          Polis Saya ({polisList.length})
        </span>
      </div>

      {/* Input pencarian */}
      {showSearch && (
        <div className="relative">
          <input
            type="text"
            placeholder="Cari polis (nama atau nomor polis)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      )}

      {/* Daftar Polis */}
      <div className="space-y-4">
        {filteredPolis.map((polis) => (
          <div key={polis.id || polis.noPolis} className="space-y-2">
            {/* Card Informasi Polis */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex items-start gap-4">
              <div className="text-3xl mt-1">{polis.icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-sky-900">{polis.jenis}</h3>
                <p className="text-sm text-gray-500 mt-1 font-mono">No. Polis: {polis.noPolis}</p>
                <div className="mt-2">
                  <span className="text-2xl font-extrabold text-sky-900">
                    {polis.premiFormatted}
                  </span>
                  <span className="text-gray-500 text-sm"> {polis.periode}</span>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/ajukan-klaim"
                  state={{ polisId: polis.noPolis, polisJenis: polis.jenis }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-sky-900 font-semibold rounded-lg hover:bg-sky-950 hover:text-white transition text-sm"
                >
                  + Ajukan Klaim
                </Link>
                <Link
                  to="/bayar-premi"
                  state={{
                    jenis: polis.jenis,
                    noPolis: polis.noPolis,
                    premi: polis.Total_Premi || 0,
                    premiFormatted: polis.premiFormatted,
                    periode: polis.periode
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-100 text-sky-950 font-semibold rounded-lg transition text-sm"
                >
                  Bayar Premi
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredPolis.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-100">
            <p className="text-gray-500 font-medium">Belum ada polis. Silakan beli produk terlebih dahulu.</p>
            <Link to="/produk" className="text-sky-600 hover:underline mt-2 inline-block font-semibold text-sm">
              Beli produk sekarang →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}