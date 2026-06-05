import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaTrash, FaExternalLinkAlt, FaPlus, FaTimes, FaFilePdf, FaImage } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AjukanKlaim() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userPolisList, setUserPolisList] = useState([]);
  const [formData, setFormData] = useState({
    polisId: location.state?.polisId || '',
    polisJenis: location.state?.polisJenis || '',
    jenisKlaim: '',
    jumlah: '',
    tanggalKejadian: '',
    deskripsi: '',
  });
  const [dokumenList, setDokumenList] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Gunakan ref untuk menyimpan URL yang perlu dibersihkan
  const blobUrlsRef = useRef([]);

  useEffect(() => {
    const fetchPolis = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:8000/api/polis/saya', {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
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

  // Hanya cleanup saat komponen unmount, bukan setiap re-render
  useEffect(() => {
    return () => {
      // Bersihkan semua blob URL saat komponen di-unmount
      blobUrlsRef.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current = [];
    };
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
      setFormData(prev => ({ ...prev, polisId: selectedId, polisJenis: selectedPolis.jenis, jenisKlaim: '' }));
    } else {
      setFormData(prev => ({ ...prev, polisId: selectedId, polisJenis: '', jenisKlaim: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'polisId') {
      handlePolisChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTambahDokumen = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => {
      if (f.size > 5 * 1024 * 1024) { 
        alert(`File ${f.name} melebihi batas 5MB`); 
        return false; 
      }
      return true;
    });

    const newDokumen = validFiles.map(f => {
      // Buat preview URL
      const previewUrl = URL.createObjectURL(f);
      // Simpan URL ke ref untuk cleanup nanti
      blobUrlsRef.current.push(previewUrl);
      
      console.log(`File: ${f.name}, Type: ${f.type}, URL: ${previewUrl}`);
      
      return {
        id: Date.now() + Math.random(),
        file: f,
        preview: previewUrl,
        isImage: f.type.startsWith('image/'),
        isPdf: f.type === 'application/pdf',
        fileName: f.name,
        fileType: f.type,
        fileSize: f.size
      };
    });

    setDokumenList(prev => [...prev, ...newDokumen]);
    e.target.value = '';
  };

  const handleHapusDokumen = (index) => {
    const dok = dokumenList[index];
    if (dok.preview) {
      // Hapus dari ref
      const urlIndex = blobUrlsRef.current.indexOf(dok.preview);
      if (urlIndex > -1) {
        blobUrlsRef.current.splice(urlIndex, 1);
      }
      URL.revokeObjectURL(dok.preview);
    }
    setDokumenList(prev => prev.filter((_, i) => i !== index));
  };

  // Fungsi untuk membuka dokumen
  const handleBukaDokumen = (dok) => {
    console.log('Membuka dokumen:', dok.fileName, 'Type:', dok.fileType, 'Preview:', dok.preview);
    
    if (!dok.preview) {
      alert('URL dokumen tidak valid');
      return;
    }

    if (dok.isImage) {
      // Untuk gambar, tampilkan di modal
      setSelectedImage(dok.preview);
      setShowImageModal(true);
    } else {
      // Untuk PDF dan file lainnya, buka di tab baru
      window.open(dok.preview, '_blank');
    }
  };

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
      formDataToSend.append('ID_Polis', formData.polisId);
      formDataToSend.append('Jenis_Klaim', formData.jenisKlaim);
      formDataToSend.append('Jumlah_Klaim', formData.jumlah);
      formDataToSend.append('Tanggal_Kejadian', formData.tanggalKejadian);
      formDataToSend.append('Deskripsi', formData.deskripsi);

      dokumenList.forEach((d, idx) => {
        formDataToSend.append(`Dokumen[${idx}]`, d.file);
      });

      const response = await fetch('http://127.0.0.1:8000/api/klaim/ajukan', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.errors ? Object.values(result.errors).flat().join(', ') : result.message;
        throw new Error(errorMsg || 'Gagal mengajukan klaim');
      }

      setShowPopup(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal mengajukan klaim: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const availableClaims = formData.polisId
    ? getAvailableClaimsByJenis(
        userPolisList.find(p => p.id.toString() === formData.polisId.toString())?.jenis || formData.polisJenis || ''
      )
    : [];

  return (
    <div className="min-h-screen py-10 px-4 relative">
      <div className="bg-white max-w-4xl mx-auto rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-sky-950 to-sky-800 px-6 py-5">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Ajukan Klaim</h1>
          <p className="text-blue-100 text-sm mt-1">Isi formulir klaim dengan data yang benar dan lengkap.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 md:p-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Polis</label>
              <select name="polisId" value={formData.polisId} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50">
                <option value="">Pilih polis</option>
                {userPolisList.map(polis => (
                  <option key={polis.id} value={polis.id}>{polis.noPolis} - {polis.jenis}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Klaim</label>
              <select name="jenisKlaim" value={formData.jenisKlaim} onChange={handleChange} required
                disabled={!formData.polisId}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:bg-gray-200">
                <option value="">Pilih jenis klaim</option>
                {availableClaims.map((claim, idx) => (
                  <option key={idx} value={claim}>{claim}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah (Rp)</label>
                <input type="number" name="jumlah" value={formData.jumlah} onChange={handleChange}
                  placeholder="0" required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Kejadian</label>
                <input type="date" name="tanggalKejadian" value={formData.tanggalKejadian} onChange={handleChange}
                  required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Kejadian</label>
              <textarea name="deskripsi" rows="4" value={formData.deskripsi} onChange={handleChange}
                placeholder="Ceritakan kronologi kejadian secara lengkap..." required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Dokumen Pendukung <span className="text-gray-400 font-normal">(Opsional, bisa lebih dari 1)</span>
              </label>
              <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                {dokumenList.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {dokumenList.map((dok, idx) => (
                      <div key={dok.id} className="flex items-center justify-between bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {dok.isImage ? (
                            <FaImage className="text-green-500 text-xl flex-shrink-0" />
                          ) : (
                            <FaFilePdf className="text-red-500 text-xl flex-shrink-0" />
                          )}
                          <span className="text-xs text-gray-700 font-medium truncate">{dok.fileName}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">({Math.round(dok.fileSize / 1024)} KB)</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <button 
                            type="button" 
                            onClick={() => handleBukaDokumen(dok)}
                            className="text-sky-700 hover:text-sky-900 flex items-center gap-1 text-xs font-bold"
                          >
                            <FaExternalLinkAlt size={11} /> Buka
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleHapusDokumen(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-blue-300 rounded-lg py-3 cursor-pointer hover:bg-blue-50 transition text-blue-700 text-sm font-semibold">
                  <FaPlus size={13} />
                  {dokumenList.length === 0 ? 'Tambah Dokumen' : 'Tambah Dokumen Lagi'}
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" multiple onChange={handleTambahDokumen} className="hidden" />
                </label>
                <p className="text-xs text-gray-400">Format: JPG, PNG, PDF (maks 5MB per file).</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 px-6 py-5 bg-gray-50">
            <button type="submit" disabled={loading || userPolisList.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-sky-950 hover:bg-sky-900 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-xl shadow transition">
              {loading ? 'Sedang Memproses...' : 'Ajukan Klaim Sekarang'}
              <FaPaperPlane size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* MODAL GAMBAR dengan tombol X */}
      {showImageModal && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowImageModal(false);
            setSelectedImage(null);
          }}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setShowImageModal(false);
                setSelectedImage(null);
              }}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors text-3xl font-bold z-10"
            >
              <FaTimes size={32} />
            </button>
            <img
              src={selectedImage}
              alt="Dokumen Klaim"
              className="w-full h-auto rounded-lg shadow-2xl"
              style={{ maxHeight: '85vh', objectFit: 'contain' }}
              onError={(e) => {
                console.error('Gambar gagal dimuat:', selectedImage);
                alert('Gagal memuat gambar. File mungkin rusak atau tidak didukung.');
                setShowImageModal(false);
                setSelectedImage(null);
              }}
            />
          </div>
        </div>
      )}

            {/* POPUP SUKSES - SEPERTI GAMBAR */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            {/* Icon Centang Hijau */}
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-800 mb-2">Klaim Berhasil Diajukan</h3>
            
            {/* Subtitle */}
            <p className="text-gray-500 text-sm mb-6">
              Status klaim akan diperbarui dalam 24-48 jam.
            </p>
            
            {/* Dua Tombol Sampingan */}
            <div className="flex gap-3">
              {/* Tombol Tutup */}
              <button 
                onClick={() => setShowPopup(false)}
                className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                Tutup
              </button>
              
              {/* Tombol Lihat Status Klaim (BIRU) */}
              <button 
                onClick={() => { 
                  setShowPopup(false); 
                  navigate('/status-klaim'); 
                }}
                className="flex-1 bg-sky-950 hover:bg-sky-900 text-white font-semibold py-2.5 rounded-lg transition"
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