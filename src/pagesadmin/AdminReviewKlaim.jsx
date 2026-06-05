import { useState, useEffect } from 'react';
import { FiEye } from 'react-icons/fi';
import { FaCheck, FaTimes, FaCheckCircle, FaTimesCircle, FaFilePdf, FaFileImage, FaFileAlt, FaFile, FaImage } from 'react-icons/fa';
import { api } from '../lib/api';

const statusColor = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Proses: 'bg-yellow-100 text-yellow-700',
  Disetujui: 'bg-green-100 text-green-700',
  Selesai: 'bg-green-100 text-green-700',
  Ditolak: 'bg-red-100 text-red-700',
};

const filterButtons = ['Semua', 'Pending', 'Disetujui', 'Ditolak'];

// Fungsi untuk mendapatkan icon berdasarkan tipe file
const getFileIcon = (filename) => {
  const extension = filename?.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return <FaFilePdf className="text-red-500 text-base" />;
    case 'jpg':
    case 'jpeg':
      return <FaImage className="text-green-500 text-base" />;
    case 'png':
    case 'gif':
    case 'webp':
      return <FaFileImage className="text-green-500 text-base" />;
    case 'doc':
    case 'docx':
      return <FaFileAlt className="text-blue-500 text-base" />;
    default:
      return <FaFile className="text-gray-400 text-base" />;
  }
};

export default function AdminReviewKlaim() {
  const [filter, setFilter] = useState('Semua');
  const [klaimList, setKlaimList] = useState([]);
  const [selectedKlaim, setSelectedKlaim] = useState(null);
  const [viewKlaim, setViewKlaim] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [tanggalPencairan, setTanggalPencairan] = useState('');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKlaim = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api('/klaim', 'GET', null, token);
        
        let data = [];
        if (Array.isArray(response)) {
          data = response;
        } else if (response?.data && Array.isArray(response.data)) {
          data = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        }
        
        console.log('Data klaim dari API:', data);
        
        const mappedData = data.map(k => {
          // Ambil nilai klaim
          let nilaiKlaim = k.Jumlah_Klaim || k.jumlah_klaim || k.nilai || 0;
          
          // Ambil status
          let rawStatus = k.Status_Klaim || k.status || 'Pending';
          let displayStatus = rawStatus;
          if (rawStatus === 'Proses' || rawStatus === 'proses') displayStatus = 'Pending';
          if (rawStatus === 'Selesai' || rawStatus === 'selesai') displayStatus = 'Disetujui';
          if (rawStatus === 'Ditolak' || rawStatus === 'ditolak') displayStatus = 'Ditolak';
          
          // PERBAIKAN: Ambil nama nasabah dari hasil JOIN (nasabah_nama)
          let namaNasabah = k.nasabah_nama || 'Nasabah';
          
          // Ambil nama produk dari hasil JOIN (produk_nama)
          let namaProduk = k.produk_nama || k.Jenis_Klaim || 'Produk Asuransi';
          
          return {
            id: k.ID_Klaim || k.id,
            noKlaim: k.ID_Klaim || k.id || '-',
            nasabah: namaNasabah,
            produk: namaProduk,
            nilai: `Rp ${Number(nilaiKlaim).toLocaleString('id-ID')}`,
            nilaiRaw: Number(nilaiKlaim),
            status: displayStatus,
            // Simpan data mentah untuk detail popup
            _original: k
          };
        });
        
        setKlaimList(mappedData);
      } catch (err) {
        console.error('Error fetching klaim:', err);
        if (err.message && err.message.includes('404')) {
          setKlaimList([]);
        } else {
          setError(err.message || 'Gagal mengambil data klaim');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchKlaim();
  }, []);

  const filteredData = klaimList.filter((item) => {
    if (filter === 'Semua') return true;
    return item.status === filter;
  });

  const buildDetailObject = (item) => {
    const orig = item._original || {};
    
    // Parse dokumen dari JSON jika ada
    let dokumenList = [];
    if (orig.Dokumen) {
      try {
        const parsed = typeof orig.Dokumen === 'string' ? JSON.parse(orig.Dokumen) : orig.Dokumen;
        if (Array.isArray(parsed)) {
          dokumenList = parsed.map(doc => doc.original_name || 'dokumen');
        }
      } catch(e) {
        dokumenList = ['Dokumen tersedia'];
      }
    }
    
    if (dokumenList.length === 0) {
      dokumenList = ['Tidak ada dokumen'];
    }
    
    return {
      noKlaim: item.noKlaim,
      id: item.id,
      status: item.status,
      catatanAdmin: orig.alasan_penolakan || '',
      deskripsi: orig.Deskripsi || orig.deskripsi || 'Tidak ada deskripsi',
      tanggalKejadian: orig.Tanggal_Kejadian || orig.tanggal_kejadian || '-',
      tanggalPengajuan: orig.Tanggal_Pengajuan || orig.tanggal_pengajuan || '-',
      nasabah: {
        nama: orig.nasabah_nama || item.nasabah,
        inisial: (orig.nasabah_nama || item.nasabah || 'Na').substring(0, 2).toUpperCase(),
        noKTP: orig.nasabah_nik || '-',
        telepon: orig.nasabah_telepon || '-',
        email: orig.nasabah_email || '-'
      },
      klaim: {
        produk: orig.produk_nama || item.produk,
        tglKejadian: orig.Tanggal_Kejadian || orig.tanggal_kejadian || '-',
        tglPengajuan: orig.Tanggal_Pengajuan || orig.tanggal_pengajuan || '-',
        nilaiKlaim: item.nilai,
        deskripsi: orig.Deskripsi || orig.deskripsi || 'Tidak ada deskripsi',
        noPolis: orig.ID_Polis || '-'
      },
      dokumen: dokumenList
    };
  };

  const handleOpenView = (noKlaim) => {
    const item = klaimList.find(k => k.noKlaim === noKlaim);
    if (item) setViewKlaim(buildDetailObject(item));
    else alert('Data klaim tidak ditemukan');
  };

  const handleOpenEdit = (noKlaim) => {
    const item = klaimList.find(k => k.noKlaim === noKlaim);
    if (item) {
      const detail = buildDetailObject(item);
      setSelectedKlaim(detail);
      setCatatan(detail.catatanAdmin || '');
      setTanggalPencairan('');
    } else {
      alert('Data klaim tidak ditemukan');
    }
  };

  const showNotification = (type) => {
    if (type === 'setuju') {
      setNotification({ type: 'success', message: 'Klaim Telah Disetujui', description: 'Klaim disetujui dan nasabah akan menerima notifikasi via email dan SMS' });
    } else {
      setNotification({ type: 'tolak', message: 'Tolak Klaim Ini!', description: 'Klaim ditolak dan nasabah akan diberitahu alasan penolakan' });
    }
    setTimeout(() => {
      setNotification(null);
      setSelectedKlaim(null);
    }, 2000);
  };

  const submitReview = async (status, type) => {
    if (!selectedKlaim) return;
    if (type === 'setuju' && !tanggalPencairan) {
      alert('Harap tentukan tanggal pencairan terlebih dahulu!');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await api(`/admin/klaim/${selectedKlaim.id}/review`, 'PUT', {
        status: status, 
        alasan_penolakan: type === 'tolak' ? catatan : null,
        tanggal_pencairan: type === 'setuju' ? tanggalPencairan : null,
      }, token);
      
      setKlaimList(prev => prev.map(k =>
        k.noKlaim === selectedKlaim.noKlaim
          ? { ...k, status: type === 'setuju' ? 'Disetujui' : 'Ditolak' }
          : k
      ));
      showNotification(type);
    } catch (err) {
      console.error(`Error ${type === 'setuju' ? 'approving' : 'rejecting'} claim:`, err);
      alert(`Gagal ${type === 'setuju' ? 'menyetujui' : 'menolak'} klaim: ` + err.message);
    }
  };

  const handleSetuju = () => submitReview('DISETUJUI', 'setuju');
  const handleTolak = () => submitReview('DITOLAK', 'tolak');

  if (loading) return <div className="p-6 text-center">Memuat data klaim...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-5">
      {/* Popup Notifikasi */}
      {notification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              {notification.type === 'success' ? <FaCheckCircle className="w-8 h-8 text-green-600" /> : <FaTimesCircle className="w-8 h-8 text-red-600" />}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{notification.message}</h3>
            <p className="text-sm text-gray-600 mt-2">{notification.description}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="w-full border-b border-gray-200 shadow-sm px-4 py-2 flex flex-wrap gap-2 -mt-1">
        {filterButtons.map((btn) => (
          <button key={btn} onClick={() => setFilter(btn)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${filter === btn ? 'bg-sky-700 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {btn}
          </button>
        ))}
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-200 text-left">
                {['NO. KLAIM', 'NASABAH', 'PRODUK', 'NILAI', 'STATUS', 'AKSI'].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-bold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 text-sky-700 font-medium">{item.noKlaim}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{item.nasabah}</td>
                  <td className="px-5 py-3.5 text-gray-500">{item.produk}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{item.nilai}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[item.status] || 'bg-gray-100 text-gray-700'}`}>{item.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenEdit(item.noKlaim)} className="border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">Review</button>
                      <button onClick={() => handleOpenView(item.noKlaim)} className="text-gray-600 hover:text-sky-700 transition" title="Lihat detail"><FiEye size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">Tidak ada data klaim untuk filter "{filter}"</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP DETAIL KLAIM (View Only) */}
      {viewKlaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-sky-900">Detail Klaim #{viewKlaim.noKlaim}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[viewKlaim.status] || 'bg-gray-100 text-gray-700'}`}>{viewKlaim.status}</span>
                </div>
                <button onClick={() => setViewKlaim(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data Nasabah */}
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data Nasabah</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-black text-sm font-bold">{viewKlaim.nasabah.inisial}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{viewKlaim.nasabah.nama}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                    <div className="flex justify-between"><span className="text-gray-400">No. KTP</span><span className="font-semibold text-gray-700">{viewKlaim.nasabah.noKTP}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">No. Telepon</span><span className="font-semibold text-gray-700">{viewKlaim.nasabah.telepon}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="font-semibold text-gray-700">{viewKlaim.nasabah.email}</span></div>
                  </div>
                </div>
                
                {/* Data Klaim */}
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data Klaim</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-gray-400">Jenis Klaim</span><span className="font-semibold text-gray-700">{viewKlaim.klaim.produk}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Tanggal Kejadian</span><span className="font-semibold text-gray-700">{viewKlaim.klaim.tglKejadian}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Tanggal Pengajuan</span><span className="font-semibold text-gray-700">{viewKlaim.klaim.tglPengajuan}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Nilai Klaim</span><span className="font-semibold text-green-600">{viewKlaim.klaim.nilaiKlaim}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">No. Polis</span><span className="font-semibold text-gray-700">{viewKlaim.klaim.noPolis}</span></div>
                  </div>
                </div>
              </div>
              
              {/* Deskripsi Kejadian */}
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Deskripsi Kejadian</p>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{viewKlaim.klaim.deskripsi}</div>
              </div>
              
              {/* Dokumen Pendukung - Icon sesuai tipe file */}
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dokumen Pendukung</p>
                <div className="grid grid-cols-2 gap-2">
                  {viewKlaim.dokumen?.map((dok, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      {getFileIcon(dok)}
                      <span className="text-xs text-gray-600">{dok}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Catatan Admin */}
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Catatan Admin</p>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{viewKlaim.catatanAdmin || 'Belum ada catatan.'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP REVIEW KLAIM */}
      {selectedKlaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-sky-900">Review Klaim #{selectedKlaim.noKlaim}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[selectedKlaim.status] || 'bg-gray-100 text-gray-700'}`}>{selectedKlaim.status}</span>
                </div>
                <button onClick={() => setSelectedKlaim(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data Nasabah */}
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data Nasabah</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-black text-sm font-bold">{selectedKlaim.nasabah.inisial}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{selectedKlaim.nasabah.nama}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                    <div className="flex justify-between"><span className="text-gray-400">No. KTP</span><span className="font-semibold text-gray-700">{selectedKlaim.nasabah.noKTP}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">No. Telepon</span><span className="font-semibold text-gray-700">{selectedKlaim.nasabah.telepon}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="font-semibold text-gray-700">{selectedKlaim.nasabah.email}</span></div>
                  </div>
                </div>
                
                {/* Data Klaim */}
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data Klaim</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-gray-400">Jenis Klaim</span><span className="font-semibold text-gray-700">{selectedKlaim.klaim.produk}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Tanggal Kejadian</span><span className="font-semibold text-gray-700">{selectedKlaim.klaim.tglKejadian}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Nilai Klaim</span><span className="font-semibold text-green-600">{selectedKlaim.klaim.nilaiKlaim}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">No. Polis</span><span className="font-semibold text-gray-700">{selectedKlaim.klaim.noPolis}</span></div>
                  </div>
                </div>
              </div>
              
              {/* Deskripsi */}
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Deskripsi Kejadian</p>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedKlaim.klaim.deskripsi}</div>
              </div>
              
              {/* Dokumen - Icon sesuai tipe file */}
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dokumen Pendukung</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedKlaim.dokumen?.map((dok, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      {getFileIcon(dok)}
                      <span className="text-xs text-gray-600">{dok}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Catatan Admin */}
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Catatan Admin</p>
                <textarea rows="4" value={catatan} onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Masukkan catatan untuk nasabah (alasan penolakan, dll)..."
                  className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none bg-gray-50" />
              </div>

              {/* Tanggal Pencairan */}
              <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/40">
                <p className="text-xs font-bold text-sky-900 uppercase tracking-widest mb-3">Tanggal Pencairan</p>
                <p className="text-xs text-gray-500 mb-2">Wajib diisi jika klaim disetujui. Tentukan tanggal dana akan dicairkan kepada nasabah.</p>
                <input
                  type="date"
                  value={tanggalPencairan}
                  onChange={(e) => setTanggalPencairan(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full text-sm border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
                />
                {tanggalPencairan && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    ✓ Dana akan dicairkan pada: {new Date(tanggalPencairan).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>

              {/* Tombol Keputusan */}
              <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/30">
                <p className="text-xs font-bold text-sky-900 uppercase tracking-widest text-center mb-3">Keputusan Admin</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleSetuju}
                    className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-bold py-2.5 rounded-xl transition text-sm">
                    <FaCheck size={16} /> Setuju
                  </button>
                  <button onClick={handleTolak}
                    className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-2.5 rounded-xl transition text-sm">
                    <FaTimes size={16} /> Tolak
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}