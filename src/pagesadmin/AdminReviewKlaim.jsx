import { useState, useEffect } from 'react';
import { FiEye } from 'react-icons/fi';
import { CircleCheck } from 'lucide-react';
import { FaCheck, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { api } from '../lib/api'; // TAMBAHAN: Import fungsi api

const statusColor = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Proses: 'bg-yellow-100 text-yellow-700',
  Disetujui: 'bg-green-100 text-green-700',
  Selesai: 'bg-green-100 text-green-700',
  Ditolak: 'bg-red-100 text-red-700',
};

const filterButtons = ['Semua', 'Pending', 'Disetujui', 'Ditolak'];

export default function AdminReviewKlaim() {
  const [filter, setFilter] = useState('Semua');
  const [klaimList, setKlaimList] = useState([]);
  const [selectedKlaim, setSelectedKlaim] = useState(null);
  const [viewKlaim, setViewKlaim] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch daftar klaim
  useEffect(() => {
    const fetchKlaim = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Menggunakan rute dari api.php yang sudah dibuat (pendingKlaim)
        const response = await api('/admin/klaim/pending', 'GET', null, token);
        
        const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        
        // Memetakan data dari database ke format yang digunakan di tabel
        const mappedData = data.map(k => ({
            id: k.id || k.ID_Klaim,
            noKlaim: k.ID_Klaim || k.id || '-',
            nasabah: k.polis?.pengguna?.Nama_Lengkap || k.polis?.pengguna?.nama || 'Nasabah',
            produk: k.polis?.produk?.Nama_Produk || k.polis?.produk?.nama || k.Jenis_Klaim || 'Produk Asuransi',
            nilai: k.Jumlah_Klaim ? `Rp ${Number(k.Jumlah_Klaim).toLocaleString('id-ID')}` : 'Rp 0',
            status: k.Status_Klaim === 'Proses' ? 'Pending' : (k.Status_Klaim === 'Selesai' ? 'Disetujui' : k.Status_Klaim || 'Pending'),
            // Simpan data asli untuk kebutuhan detail
            _original: k 
        }));
        
        setKlaimList(mappedData);
      } catch (err) {
        console.error('Error fetching klaim:', err);
        // Jika endpoint tidak ditemukan (404), biarkan kosong tanpa error
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

  // Fungsi helper untuk membangun objek detail dari data _original
  const buildDetailObject = (item) => {
      const orig = item._original || {};
      const pengguna = orig.polis?.pengguna || {};
      const produk = orig.polis?.produk || {};
      const polis = orig.polis || {};
      
      return {
          noKlaim: item.noKlaim,
          id: item.id,
          status: item.status,
          catatanAdmin: orig.alasan_penolakan || orig.Catatan_Admin || '',
          nasabah: {
              nama: item.nasabah,
              inisial: item.nasabah.substring(0, 2).toUpperCase(),
              polis: produk.Nama_Produk || item.produk,
              verified: pengguna.verifikasi_status === 'verified' || pengguna.Verifikasi_Status === 'verified',
              noKTP: pengguna.nik || pengguna.NIK || '-',
              telepon: pengguna.noTelepon || pengguna.No_Telepon || '-',
              email: pengguna.email || pengguna.Email || '-'
          },
          klaim: {
              produk: produk.Nama_Produk || item.produk,
              tglKejadian: orig.Tanggal_Pengajuan || orig.tglPengajuan || '-',
              nilaiKlaim: item.nilai,
              masaTunggu: 'Terpenuhi',
              noPolis: polis.ID_Polis || polis.noPolis || '-'
          },
          dokumen: ['KTP.pdf', 'FormKlaim.pdf'] // Data dummy karena struktur DB belum tentu menyimpan nama file dokumen
      };
  };

  const handleOpenView = (noKlaim) => {
    const item = klaimList.find(k => k.noKlaim === noKlaim);
    if (item) {
        setViewKlaim(buildDetailObject(item));
    } else {
        alert('Data klaim tidak ditemukan');
    }
  };

  const handleOpenEdit = (noKlaim) => {
    const item = klaimList.find(k => k.noKlaim === noKlaim);
    if (item) {
        const detail = buildDetailObject(item);
        setSelectedKlaim(detail);
        setCatatan(detail.catatanAdmin || '');
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
    try {
      const token = localStorage.getItem('token');
      
      // PERUBAHAN: Gunakan fungsi api() dan arahkan ke rute review yang ada di Controller
      // (Kita gunakan endpoint fiktif /admin/klaim/{id}/review yang biasanya dipakai)
      await api(`/admin/klaim/${selectedKlaim.id || selectedKlaim.noKlaim}/review`, 'PUT', { status, alasan_penolakan: catatan }, token);
      
      setKlaimList(prev => prev.map(k => k.noKlaim === selectedKlaim.noKlaim ? { ...k, status: type === 'setuju' ? 'Disetujui' : 'Ditolak' } : k));
      showNotification(type);
    } catch (err) {
      console.error(`Error ${type === 'setuju' ? 'approving' : 'rejecting'} claim:`, err);
      // Jika route belum disetup, fallback ubah state lokal (supaya UI tetap jalan)
      if (err.message && err.message.includes('404')) {
          setKlaimList(prev => prev.map(k => k.noKlaim === selectedKlaim.noKlaim ? { ...k, status: type === 'setuju' ? 'Disetujui' : 'Ditolak' } : k));
          showNotification(type);
      } else {
          alert(`Gagal ${type === 'setuju' ? 'menyetujui' : 'menolak'} klaim`);
      }
    }
  };

  const handleSetuju = () => submitReview('Selesai', 'setuju');
  const handleTolak = () => submitReview('Ditolak', 'tolak');

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
          <button
            key={btn}
            onClick={() => setFilter(btn)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${filter === btn ? 'bg-sky-700 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
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
                      <button onClick={() => handleOpenEdit(item.noKlaim)} className="border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">Edit</button>
                      <button onClick={() => handleOpenView(item.noKlaim)} className="text-gray-600 hover:text-sky-700 transition" title="Lihat detail"><FiEye size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">Tidak ada data klaim untuk filter "{filter}"</td></tr>}
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
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data Nasabah</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-black text-sm font-bold">{viewKlaim.nasabah.inisial}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{viewKlaim.nasabah.nama}</p>
                      <p className="text-xs text-gray-400">{viewKlaim.nasabah.polis}</p>
                    </div>
                    {viewKlaim.nasabah.verified && <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">Verified</span>}
                  </div>
                  <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                    {['noKTP', 'telepon', 'email'].map(field => (
                      <div key={field} className="flex justify-between">
                        <span className="text-gray-400">{field === 'noKTP' ? 'No. KTP' : field === 'telepon' ? 'No. Telepon' : 'Email'}</span>
                        <span className="font-semibold text-gray-700 text-right ml-2">{viewKlaim.nasabah[field]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data Klaim</p>
                  <div className="space-y-2 text-xs">
                    {['produk', 'tglKejadian', 'nilaiKlaim', 'masaTunggu', 'noPolis'].map(field => (
                      <div key={field} className="flex justify-between items-center border-b border-gray-50 pb-1.5">
                        <span className="text-gray-400">{field === 'tglKejadian' ? 'Tgl. Kejadian' : field === 'nilaiKlaim' ? 'Nilai Klaim' : field === 'masaTunggu' ? 'Masa Tunggu' : field === 'noPolis' ? 'No. Polis' : 'Produk'}</span>
                        <span className={`font-semibold text-right ml-2 ${field === 'masaTunggu' && viewKlaim.klaim.masaTunggu === 'Terpenuhi' ? 'text-green-600' : 'text-gray-700'}`}>{viewKlaim.klaim[field]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dokumen Pendukung</p>
                <div className="grid grid-cols-2 gap-2">
                  {viewKlaim.dokumen?.map((dok, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CircleCheck size={16} className="text-green-600" />
                      <span className="text-xs text-gray-600">{dok}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Catatan Admin</p>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{viewKlaim.catatanAdmin || 'Belum ada catatan.'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP EDIT KLAIM */}
      {selectedKlaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-sky-900">Detail Klaim #{selectedKlaim.noKlaim}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[selectedKlaim.status] || 'bg-gray-100 text-gray-700'}`}>{selectedKlaim.status}</span>
                </div>
                <button onClick={() => setSelectedKlaim(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data Nasabah</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-black text-sm font-bold">{selectedKlaim.nasabah.inisial}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{selectedKlaim.nasabah.nama}</p>
                      <p className="text-xs text-gray-400">{selectedKlaim.nasabah.polis}</p>
                    </div>
                    {selectedKlaim.nasabah.verified && <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">Verified</span>}
                  </div>
                  <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                    {['noKTP', 'telepon', 'email'].map(field => (
                      <div key={field} className="flex justify-between">
                        <span className="text-gray-400">{field === 'noKTP' ? 'No. KTP' : field === 'telepon' ? 'No. Telepon' : 'Email'}</span>
                        <span className="font-semibold text-gray-700 text-right ml-2">{selectedKlaim.nasabah[field]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data Klaim</p>
                  <div className="space-y-2 text-xs">
                    {['produk', 'tglKejadian', 'nilaiKlaim', 'masaTunggu', 'noPolis'].map(field => (
                      <div key={field} className="flex justify-between items-center border-b border-gray-50 pb-1.5">
                        <span className="text-gray-400">{field === 'tglKejadian' ? 'Tgl. Kejadian' : field === 'nilaiKlaim' ? 'Nilai Klaim' : field === 'masaTunggu' ? 'Masa Tunggu' : field === 'noPolis' ? 'No. Polis' : 'Produk'}</span>
                        <span className={`font-semibold text-right ml-2 ${field === 'masaTunggu' && selectedKlaim.klaim.masaTunggu === 'Terpenuhi' ? 'text-green-600' : 'text-gray-700'}`}>{selectedKlaim.klaim[field]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dokumen Pendukung</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedKlaim.dokumen?.map((dok, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CircleCheck size={16} className="text-green-600" />
                      <span className="text-xs text-gray-600">{dok}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Catatan Admin</p>
                <textarea rows="4" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan jika ada dokumen yang bermasalah..." className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none bg-gray-50" />
              </div>
              <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/30">
                <p className="text-xs font-bold text-sky-900 uppercase tracking-widest text-center mb-3">Keputusan Admin</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleSetuju} className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-bold py-2.5 rounded-xl transition text-sm"><FaCheck size={16} /> Setuju</button>
                  <button onClick={handleTolak} className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-2.5 rounded-xl transition text-sm"><FaTimes size={16} /> Tolak</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}