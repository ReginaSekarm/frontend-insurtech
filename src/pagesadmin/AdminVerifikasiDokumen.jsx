import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaFilePdf, FaImage, FaExternalLinkAlt } from 'react-icons/fa';
import { IdCard, Users } from 'lucide-react';

export default function AdminVerifikasiDokumen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = location.state || {};

  const userId = userData?.ID_Pengguna || userData?.id;

  const [ktpData, setKtpData] = useState(null);
  const [kkData, setKkData] = useState(null);
  const [ktpPreview, setKtpPreview] = useState(null);
  const [kkPreview, setKkPreview] = useState(null);
  const [ktpChecklist, setKtpChecklist] = useState({
    fotoJelas: false,
    namaSesuai: false,
    nikValid: false,
  });
  const [kkChecklist, setKkChecklist] = useState({
    fotoJelas: false,
    namaTercantum: false,
    nomorKKValid: false,
  });
  const [catatan, setCatatan] = useState('');
  const [keputusan, setKeputusan] = useState('setuju');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState('');

  useEffect(() => {
    if (!userId) {
      setError('Data user tidak ditemukan');
      setLoading(false);
      return;
    }

    const fetchDokumen = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://127.0.0.1:8000/api/pengguna/${userId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Gagal mengambil data pengguna');
        const result = await response.json();
        const user = result.data || result;
        
        const ktpFile = user.foto_ktp;
        const kkFile = user.foto_kk;
        
        if (ktpFile) {
          const ktpUrl = `http://127.0.0.1:8000/storage/${ktpFile}`;
          setKtpPreview(ktpUrl);
          setKtpData({
            fileName: ktpFile.split('/').pop(),
            fileUrl: ktpUrl,
            isImage: !ktpFile.endsWith('.pdf'),
            nik: user.NIK || '-',
            nama: user.Nama_Lengkap || '-',
            ttl: user.Tanggal_Lahir || '-'
          });
        } else {
          setKtpData(null);
        }
        
        if (kkFile) {
          const kkUrl = `http://127.0.0.1:8000/storage/${kkFile}`;
          setKkPreview(kkUrl);
          setKkData({
            fileName: kkFile.split('/').pop(),
            fileUrl: kkUrl,
            isImage: !kkFile.endsWith('.pdf'),
            noKK: user.No_KK || '-',
            kepalaKK: user.Nama_Lengkap || '-',
            anggota: '-'
          });
        } else {
          setKkData(null);
        }
        
      } catch (err) {
        console.error('Error fetching dokumen:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDokumen();
  }, [userId]);

  const handleBukaDokumen = (url, title) => {
    if (!url) {
      alert('Dokumen belum diupload');
      return;
    }
    
    if (url.endsWith('.pdf')) {
      window.open(url, '_blank');
    } else {
      setSelectedImage(url);
      setSelectedImageTitle(title);
      setShowImageModal(true);
    }
  };

  const handleKtpCheck = (field) => {
    setKtpChecklist(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleKkCheck = (field) => {
    setKkChecklist(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    if (keputusan === 'setuju') {
      const allKtpChecked = Object.values(ktpChecklist).every(v => v === true);
      const allKkChecked = Object.values(kkChecklist).every(v => v === true);
      if (!allKtpChecked || !allKkChecked) {
        showToast('Harap centang semua checklist sebelum menyetujui dokumen.', 'error');
        return;
      }
    }
    
    if (keputusan === 'tolak' && !catatan.trim()) {
      showToast('Harap isi catatan alasan penolakan jika berkas ditolak.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const requestBody = {
        status: keputusan === 'setuju' ? 'verified' : 'rejected'
      };
      
      if (keputusan === 'tolak' && catatan.trim()) {
        requestBody.alasan_penolakan = catatan;
      }
      
      console.log('Sending request to:', `http://127.0.0.1:8000/api/admin/verifikasi/${userId}`);
      console.log('Request body:', requestBody);
      
      const response = await fetch(`http://127.0.0.1:8000/api/admin/verifikasi/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch(e) {
        console.error('JSON parse error:', e);
        throw new Error('Response dari server tidak valid: ' + responseText.substring(0, 100));
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan verifikasi');
      }
      
      showToast(`Verifikasi ${keputusan === 'setuju' ? 'disetujui' : 'ditolak'}`, 'success');
      setTimeout(() => {
        navigate('/admin-pengguna');
      }, 1500);
      
    } catch (err) {
      console.error('Error submitting verifikasi:', err);
      showToast(err.message || 'Terjadi kesalahan, silakan coba lagi.', 'error');
    }
  };

  if (loading) return <div className="p-6 text-center">Memuat data dokumen...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  return (
    // ✅ HANYA INI YANG BERUBAH — bg-gray-50 diganti warna krem sesuai Figma
    <div className="min-h-screen py-4 px-4 relative" style={{ backgroundColor: '#FEF9EE' }}>
      <div className="max-w-6xl mx-auto">
        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Verifikasi Dokumen</h1>
              <p className="text-sm text-gray-500 mt-1">Verifikasi dokumen KTP dan KK pengguna</p>
            </div>
            <div className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
              Pending
            </div>
          </div>
        </div>

        {/* KTP & KK Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* KTP Section */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <IdCard className="w-6 h-6 text-sky-900" /> KTP
            </h2>
            <div className="flex flex-col gap-4">
              <div className="bg-gray-100 rounded-xl p-4 flex flex-col items-center text-center">
                {ktpData ? (
                  <>
                    {ktpData.isImage ? (
                      <img 
                        src={ktpData.fileUrl} 
                        alt="KTP" 
                        className="w-40 h-28 object-cover rounded-lg mb-2 cursor-pointer hover:opacity-80 border border-gray-300"
                        onClick={() => handleBukaDokumen(ktpData.fileUrl, 'KTP')}
                      />
                    ) : (
                      <div className="text-4xl mb-2">📄</div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{ktpData.fileName}</p>
                      <button
                        onClick={() => handleBukaDokumen(ktpData.fileUrl, 'KTP')}
                        className="text-sky-600 hover:text-sky-800 text-xs flex items-center gap-1 mx-auto mt-1"
                      >
                        <FaExternalLinkAlt size={10} /> Buka Dokumen
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">Dokumen KTP belum diupload</p>
                )}
              </div>
             
              <div className="border-t border-gray-200 pt-3 mt-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">VERIFIKASI DOKUMEN</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={ktpChecklist.fotoJelas} 
                      onChange={() => handleKtpCheck('fotoJelas')} 
                      className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm text-gray-700">Foto KTP jelas dan terbaca</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={ktpChecklist.namaSesuai} 
                      onChange={() => handleKtpCheck('namaSesuai')} 
                      className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm text-gray-700">Nama sesuai dengan data pendaftaran</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={ktpChecklist.nikValid} 
                      onChange={() => handleKtpCheck('nikValid')} 
                      className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm text-gray-700">NIK valid (16 digit)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* KK Section */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-sky-900" /> KK
            </h2>
            <div className="flex flex-col gap-4">
              <div className="bg-gray-100 rounded-xl p-4 flex flex-col items-center text-center">
                {kkData ? (
                  <>
                    {kkData.isImage ? (
                      <img 
                        src={kkData.fileUrl} 
                        alt="KK" 
                        className="w-40 h-28 object-cover rounded-lg mb-2 cursor-pointer hover:opacity-80 border border-gray-300"
                        onClick={() => handleBukaDokumen(kkData.fileUrl, 'KK')}
                      />
                    ) : (
                      <div className="text-4xl mb-2">📄</div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{kkData.fileName}</p>
                      <button
                        onClick={() => handleBukaDokumen(kkData.fileUrl, 'KK')}
                        className="text-sky-600 hover:text-sky-800 text-xs flex items-center gap-1 mx-auto mt-1"
                      >
                        <FaExternalLinkAlt size={10} /> Buka Dokumen
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">Dokumen KK belum diupload</p>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-3 mt-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">VERIFIKASI DOKUMEN</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={kkChecklist.fotoJelas} 
                      onChange={() => handleKkCheck('fotoJelas')} 
                      className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm text-gray-700">Foto KK jelas dan terbaca</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={kkChecklist.namaTercantum} 
                      onChange={() => handleKkCheck('namaTercantum')} 
                      className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm text-gray-700">Nama tercantum dalam KK</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={kkChecklist.nomorKKValid} 
                      onChange={() => handleKkCheck('nomorKKValid')} 
                      className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm text-gray-700">Nomor KK valid</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Catatan Admin */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Catatan Admin</h2>
          <textarea
            rows="3"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Catatan jika ada dokumen yang bermasalah..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Keputusan Admin */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">KEPUTUSAN ADMIN</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="keputusan" value="setuju" checked={keputusan === 'setuju'} onChange={() => setKeputusan('setuju')} className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Setuju</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="keputusan" value="tolak" checked={keputusan === 'tolak'} onChange={() => setKeputusan('tolak')} className="w-4 h-4 text-red-600" />
              <span className="text-gray-700">Tolak</span>
            </label>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-sky-950 hover:bg-sky-800 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Simpan Verifikasi
          </button>
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