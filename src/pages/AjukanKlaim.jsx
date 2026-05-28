import { useState, useEffect } from 'react';
import { FaPaperPlane, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function AjukanKlaim() {
  const navigate = useNavigate();
  const [userPolisList, setUserPolisList] = useState([]);
  const [formData, setFormData] = useState({
    polisId: '',
    polisJenis: '',
    jenisKlaim: '',
    jumlah: '',
    tanggalKejadian: '',
    deskripsi: '',
    dokumen: null,
  });
  const [fileName, setFileName] = useState('');
  
  // State Baru: Menyimpan URL sementara pratinjau dokumen di browser
  const [documentPreview, setDocumentPreview] = useState(null);
  
  const [statusDraft, setStatusDraft] = useState('Draft Tersimpan');
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ambil daftar polis dari backend
  useEffect(() => {
    const fetchPolis = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:8000/api/polis/saya', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Gagal mengambil daftar polis');
        const resJson = await response.json();
        
        const polisArray = resJson.data || resJson;
        
        const normalizedPolis = Array.isArray(polisArray) ? polisArray.map(p => ({
          id: p.id || p.ID_Polis,
          noPolis: p.noPolis || p.ID_Polis || '-',
          jenis: p.jenis || 'Asuransi Kesehatan'
        })) : [];

        setUserPolisList(normalizedPolis);
      } catch (error) {
        console.error('Error fetching polis:', error);
        setUserPolisList([]);
      }
    };
    fetchPolis();
  }, []);

  const getAvailableClaimsByJenis = (jenis) => {
    if (!jenis) return [];
    if (jenis.includes('Kesehatan')) return ['Rawat Inap', 'Kecelakaan', 'Kerusakan Fisik'];
    if (jenis.includes('Properti')) return ['Kebakaran', 'Pencurian', 'Kerusakan'];
    if (jenis.includes('Kendaraan')) return ['Kecelakaan', 'Pencurian', 'Kerusakan'];
    if (jenis.includes('Pendidikan')) return ['Klaim Biaya Pendidikan', 'Kecelakaan Anak'];
    return ['Rawat Inap', 'Kecelakaan']; 
  };

  const handlePolisChange = (selectedId) => {
    const selectedPolis = userPolisList.find(p => p.id.toString() === selectedId.toString());
    if (selectedPolis) {
      setFormData(prev => ({
        ...prev,
        polisId: selectedId,
        polisJenis: selectedPolis.jenis,
        jenisKlaim: ''
      }));
    } else {
      setFormData(prev => ({ ...prev, polisId: selectedId, polisJenis: '', jenisKlaim: '' }));
    }
    setStatusDraft('Draft Tersimpan');
  };

  // PERBAIKAN UTAMA: Manajemen pembacaan input text, select option, dan file multipart dokumen
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'dokumen') {
      if (files && files[0]) {
        const file = files[0];
        if (file.size > 5 * 1024 * 1024) {
          alert('Ukuran file maksimal 5MB');
          e.target.value = ''; // reset elemen html
          return;
        }
        setFormData(prev => ({ ...prev, dokumen: file }));
        setFileName(file.name);
        
        // Hapus pratinjau memori lama jika ada pergantian berkas baru
        if (documentPreview) URL.revokeObjectURL(documentPreview);
        setDocumentPreview(URL.createObjectURL(file));
        setStatusDraft('Draft Tersimpan');
      }
    } else if (name === 'polisId') {
      handlePolisChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setStatusDraft('Draft Tersimpan');
    }
  };

  // Fungsi membatalkan unggahan dokumen klaim sebelum dikirim
  const handleRemoveDokumen = () => {
    if (documentPreview) URL.revokeObjectURL(documentPreview); 
    setFormData(prev => ({ ...prev, dokumen: null }));
    setFileName('');
    setDocumentPreview(null);
    setStatusDraft('Draft Tersimpan');
  };

  // Bersihkan URL Object saat komponen ditutup agar tidak bocor memorinya
  useEffect(() => {
    return () => {
      if (documentPreview) URL.revokeObjectURL(documentPreview);
    };
  }, [documentPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.polisId || !formData.jenisKlaim || !formData.jumlah || !formData.tanggalKejadian || !formData.deskripsi) {
      alert('Harap lengkapi data formulir wajib!');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Mengirimkan muatan data yang sinkron dengan request->validate() Laravel Anda
      formDataToSend.append('ID_Polis', formData.polisId);
      formDataToSend.append('Jenis_Klaim', formData.jenisKlaim);
      formDataToSend.append('Jumlah_Klaim', formData.jumlah);
      formDataToSend.append('Tanggal_Kejadian', formData.tanggalKejadian);
      formDataToSend.append('Deskripsi', formData.deskripsi);
      if (formData.dokumen) {
        formDataToSend.append('Dokumen', formData.dokumen);
      }

      const response = await fetch('http://127.0.0.1:8000/api/klaim/ajukan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json' // Memaksa laravel merespons JSON jika validasi gagal
        },
        body: formDataToSend
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Ekstrak pesan kesalahan validasi Laravel jika ada
        const errorMsg = result.errors 
          ? Object.values(result.errors).flat().join(', ') 
          : result.message;
        throw new Error(errorMsg || 'Gagal mengajukan klaim ke database');
      }

      console.log('Klaim berhasil:', result);
      setStatusDraft('Draft Terkirim');
      setShowPopup(true);
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Gagal mengajukan klaim: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToStatus = () => {
    setShowPopup(false);
    navigate('/status-klaim');
  };

  const availableClaims = formData.polisId ? getAvailableClaimsByJenis(
    userPolisList.find(p => p.id.toString() === formData.polisId.toString())?.jenis || ''
  ) : [];

  return (
    <div className="min-h-screen py-10 px-4 relative">
      <div className="bg-white max-w-4xl mx-auto rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-sky-950 to-sky-800 px-6 py-5">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Ajukan Klaim</h1>
          <p className="text-blue-100 text-sm mt-1">Isi formulir klaim dengan data yang benar dan lengkap.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 md:p-8 space-y-5">
            {/* Pilih Polis */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Polis</label>
              <select
                name="polisId"
                value={formData.polisId}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800"
              >
                <option value="">Pilih polis</option>
                {userPolisList.map(polis => (
                  <option key={polis.id} value={polis.id}>{polis.noPolis} - {polis.jenis}</option>
                ))}
              </select>
              {userPolisList.length === 0 && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">
                  Anda belum memiliki polis aktif. Silakan beli produk terlebih dahulu.
                </p>
              )}
            </div>

            {/* Jenis Klaim */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Klaim</label>
              <select
                name="jenisKlaim"
                value={formData.jenisKlaim}
                onChange={handleChange}
                required
                disabled={!formData.polisId}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:bg-gray-200 text-gray-800"
              >
                <option value="">Pilih jenis klaim</option>
                {availableClaims.map((claim, idx) => (
                  <option key={idx} value={claim}>{claim}</option>
                ))}
              </select>
              {!formData.polisId && (
                <p className="text-xs text-gray-400 mt-1">Pilih nomor polis terlebih dahulu untuk memunculkan kategori klaim</p>
              )}
            </div>

            {/* Jumlah & Tanggal Kejadian */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah (Rp)</label>
                <input
                  type="number"
                  name="jumlah"
                  value={formData.jumlah}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Kejadian</label>
                <input
                  type="date"
                  name="tanggalKejadian"
                  value={formData.tanggalKejadian}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800"
                />
              </div>
            </div>

            {/* Deskripsi Kejadian */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Kejadian</label>
              <textarea
                name="deskripsi"
                rows="4"
                value={formData.deskripsi}
                onChange={handleChange}
                placeholder="Ceritakan kronologi kejadian secara lengkap..."
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800"
              />
            </div>

            {/* Dokumen Pendukung dengan Fitur Cek & Hapus */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dokumen Pendukung (Opsional)</label>
              <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  {!formData.dokumen ? (
                    <input
                      type="file"
                      name="dokumen"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleChange}
                      className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  ) : (
                    <div className="flex items-center justify-between bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-700 shadow-sm w-full">
                      <span className="truncate max-w-[250px] font-medium text-xs text-green-700">✓ {fileName}</span>
                      <div className="flex items-center gap-4">
                        <a 
                          href={documentPreview} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-sky-700 hover:text-sky-900 flex items-center gap-1 text-xs font-bold"
                        >
                          <FaExternalLinkAlt size={11} /> Buka Berkas
                        </a>
                        <button 
                          type="button" 
                          onClick={handleRemoveDokumen} 
                          className="text-red-500 hover:text-red-700 p-1" 
                          title="Batalkan dokumen"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pratinjau Gambar Thumbnail Instan jika berkas bertipe Citra/Gambar */}
                {documentPreview && formData.dokumen && formData.dokumen.type.startsWith('image/') && (
                  <div className="mt-1">
                    <img 
                      src={documentPreview} 
                      alt="Pratinjau Berkas Klaim" 
                      className="h-20 w-auto rounded-lg border object-cover shadow-sm bg-white p-1" 
                    />
                  </div>
                )}
                <p className="text-xs text-gray-400">Format yang didukung: JPG, PNG, PDF (maksimal 5MB)</p>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="border-t border-gray-100 px-6 py-5 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Estimasi Verifikasi</p>
                <p className="text-sm font-extrabold text-sky-950 mt-0.5">24 - 48 Jam Kerja</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Status Dokumen</p>
                <p className="text-sm font-extrabold text-blue-500 mt-0.5">{statusDraft}</p>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || userPolisList.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-sky-950 hover:bg-sky-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow transition"
            >
              {loading ? 'Sedang Memproses...' : 'Ajukan Klaim Sekarang'}
              <FaPaperPlane size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* Popup sukses */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Klaim Berhasil Diajukan!</h3>
            <p className="text-gray-500 text-sm mt-2">Nomor pengajuan telah tercatat. Status klaim akan ditinjau dalam 24-48 jam oleh admin.</p>
            <div className="mt-6">
              <button
                onClick={handleGoToStatus}
                className="w-full bg-sky-950 hover:bg-sky-900 text-white font-bold py-2.5 rounded-xl transition"
              >
                Lihat Status Klaim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}