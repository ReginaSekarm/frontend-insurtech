import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCheckCircle, FaExclamationTriangle, FaEye, FaFilePdf, FaImage } from 'react-icons/fa';
import { api } from '../lib/api';

export default function AdminPengguna() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [verifikasiData, setVerifikasiData] = useState([]);
  const [penggunaData, setPenggunaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 1. Ambil daftar verifikasi pending
        try {
          const verifRes = await api('/admin/verifikasi/pending', 'GET', null, token);
          const verifData = Array.isArray(verifRes.data) ? verifRes.data : (verifRes.data?.data || []);
          
          const mappedVerif = verifData.map(item => ({
            id: item.ID_Pengguna || item.id,
            nama: item.Nama_Lengkap || item.nama || 'User',
            pending: 'Dokumen belum direview',
            _original: item
          }));
          setVerifikasiData(mappedVerif);
        } catch (verifErr) {
          console.warn('Endpoint verifikasi pending mungkin belum ada', verifErr);
          setVerifikasiData([]);
        }

        // 2. Ambil daftar pengguna — polis_count & klaim_count sudah ada dari backend (withCount)
        const userRes = await api('/pengguna', 'GET', null, token);
        const userData = Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || []);
        
        const usersWithStats = userData.map((user) => {
          return {
            id: user.ID_Pengguna || user.id,
            nama: user.Nama_Lengkap || user.nama || 'Nama Tidak Diketahui',
            email: user.Email || user.email || '-',
            polis: user.polis_count ?? 0,   // ✅ dari withCount backend
            klaim: user.klaim_count ?? 0,   // ✅ dari withCount backend
            foto_ktp: user.foto_ktp,
            foto_kk: user.foto_kk,
            verifikasi_status: user.verifikasi_status
          };
        });
        
        setPenggunaData(usersWithStats);
      } catch (err) {
        console.error('Error fetching admin pengguna:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBukaDokumen = (url, title) => {
    if (!url) {
      alert('Dokumen belum diupload');
      return;
    }
    
    const fullUrl = `http://127.0.0.1:8000/storage/${url}`;
    
    if (url.endsWith('.pdf')) {
      window.open(fullUrl, '_blank');
    } else {
      setSelectedImage(fullUrl);
      setSelectedImageTitle(title);
      setShowImageModal(true);
    }
  };

  const handleVerifikasi = (item) => {
    navigate('/admin-verifikasi-dokumen', { 
      state: { 
        userData: {
          ID_Pengguna: item.id,
          Nama_Lengkap: item.nama
        }
      } 
    });
  };

  const filteredPengguna = penggunaData.filter(user =>
    (user.nama && user.nama.toLowerCase().includes(search.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="p-6 text-center">Memuat data pengguna...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <h1 className="text-base font-bold text-gray-600">MANAJEMEN PENGGUNA</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola semua pengguna yang terdaftar</p>
      </div>

      {/* Verifikasi Pending */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-bold text-gray-800">Verifikasi Dokumen Pending</h2>
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">
            {verifikasiData.length} Pending
          </span>
        </div>
        <div className="space-y-3">
          {verifikasiData.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                <FaUser />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{item.nama}</p>
                <p className="text-xs text-orange-600 font-medium mt-0.5">{item.pending}</p>
              </div>
              <button
                onClick={() => handleVerifikasi(item)}
                className="bg-[#1B3A5C] hover:bg-sky-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                Verifikasi
              </button>
            </div>
          ))}
          {verifikasiData.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">Tidak ada dokumen pending.</div>
          )}
        </div>
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">Data Pengguna</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {['NAMA', 'EMAIL', 'POLIS', 'KLAIM', 'KTP', 'KK'].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPengguna.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 text-sky-700 font-semibold">{item.nama}</td>
                  <td className="px-5 py-3.5 text-gray-600">{item.email}</td>
                  <td className="px-5 py-3.5 text-gray-800 font-medium">{item.polis}</td>
                  <td className="px-5 py-3.5 text-gray-800 font-medium">{item.klaim}</td>
                  <td className="px-5 py-3.5">
                    {item.foto_ktp ? (
                      <button
                        onClick={() => handleBukaDokumen(item.foto_ktp, `KTP - ${item.nama}`)}
                        className="text-green-500 hover:text-green-700"
                        title="Klik untuk lihat dokumen"
                      >
                        <FaCheckCircle className="text-lg" />
                      </button>
                    ) : (
                      <FaExclamationTriangle className="text-orange-400 text-lg" title="Belum upload KTP" />
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {item.foto_kk ? (
                      <button
                        onClick={() => handleBukaDokumen(item.foto_kk, `KK - ${item.nama}`)}
                        className="text-green-500 hover:text-green-700"
                        title="Klik untuk lihat dokumen"
                      >
                        <FaCheckCircle className="text-lg" />
                      </button>
                    ) : (
                      <FaExclamationTriangle className="text-orange-400 text-lg" title="Belum upload KK" />
                    )}
                  </td>
                </tr>
              ))}
              {filteredPengguna.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">Tidak ada data pengguna.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Menampilkan {filteredPengguna.length} dari {penggunaData.length} Pengguna
          </p>
          <div className="flex gap-1">
            <button className="w-7 h-7 border border-gray-300 rounded text-xs hover:bg-gray-50">‹</button>
            <button className="w-7 h-7 border border-gray-300 rounded text-xs hover:bg-gray-50">›</button>
          </div>
        </div>
      </div>

      {/* Modal Preview Gambar */}
      {showImageModal && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowImageModal(false);
            setSelectedImage(null);
          }}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setShowImageModal(false);
                setSelectedImage(null);
              }}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors text-3xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-white text-center mb-2">{selectedImageTitle}</h3>
            <img
              src={selectedImage}
              alt={selectedImageTitle}
              className="w-full h-auto rounded-lg shadow-2xl"
              style={{ maxHeight: '85vh', objectFit: 'contain' }}
              onError={(e) => {
                alert('Gagal memuat gambar');
                setShowImageModal(false);
              }}
            />
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedImage(null);
                }}
                className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}