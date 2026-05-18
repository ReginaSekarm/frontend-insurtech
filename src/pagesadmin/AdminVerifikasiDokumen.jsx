import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import { IdCard, Users } from 'lucide-react';

export default function AdminVerifikasiDokumen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = location.state || {};

  const [ktpData, setKtpData] = useState(null);
  const [kkData, setKkData] = useState(null);
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

  useEffect(() => {
    if (!userData || !userData.id) {
      setError('Data user tidak ditemukan');
      setLoading(false);
      return;
    }

    const fetchDokumen = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/verifikasi-dokumen/${userData.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Gagal mengambil data dokumen');
        const data = await response.json();
        setKtpData(data.ktp); // data.ktp berisi { fileName, fileSize, fileType, nik, nama, ttl, noKK, kepalaKK, anggota }
        setKkData(data.kk);   // data.kk berisi { fileName, fileSize, fileType, noKK, kepalaKK, anggota }
      } catch (err) {
        console.error('Error fetching dokumen:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDokumen();
  }, [userData]);

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

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/verifikasi-dokumen/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          keputusan,
          catatan,
          checklist: { ktp: ktpChecklist, kk: kkChecklist }
        })
      });
      if (!response.ok) throw new Error('Gagal menyimpan verifikasi');
      showToast(`Verifikasi ${keputusan === 'setuju' ? 'disetujui' : 'ditolak'}`, 'success');
      setTimeout(() => {
        navigate('/admin-pengguna');
      }, 1500);
    } catch (err) {
      console.error('Error submitting verifikasi:', err);
      showToast('Terjadi kesalahan, silakan coba lagi.', 'error');
    }
  };

  if (loading) return <div className="p-6 text-center">Memuat data dokumen...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  if (!ktpData || !kkData) return <div className="p-6 text-center">Data dokumen tidak lengkap</div>;

  return (
    <div className="min-h-screen py-1 px-4 relative">
      <div className="max-w-5xl mx-auto">
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
              <h1 className="text-2xl font-bold text-gray-800">Data Pengguna</h1>
              <p className="text-sm text-gray-500 mt-1">Verifikasi dokumen untuk {userData?.nama || 'Pengguna'}</p>
            </div>
            <div className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
              Pending
            </div>
          </div>
        </div>

        {/* KTP & KK Section dalam dua kolom sejajar */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* KTP Section */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <IdCard className="w-6 h-6" /> KTP
            </h2>
            <div className="flex flex-col gap-4">
              <div className="bg-gray-100 rounded-xl p-4 flex flex-col items-center text-center">
                <div className="text-3xl mb-2">📄</div>
                <div>
                  <p className="font-semibold text-gray-800">{ktpData.fileName}</p>
                  <p className="text-xs text-gray-500">{ktpData.fileSize} · {ktpData.fileType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">NIK</span><br /><span className="font-semibold">{ktpData.nik}</span></div>
                <div><span className="text-gray-500">NAMA</span><br /><span className="font-semibold">{ktpData.nama}</span></div>
                <div><span className="text-gray-500">TTL</span><br /><span className="font-semibold">{ktpData.ttl}</span></div>
              </div>
            </div>
          </div>

          {/* KK Section */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" /> KK
            </h2>
            <div className="flex flex-col gap-4">
              <div className="bg-gray-100 rounded-xl p-4 flex flex-col items-center text-center">
                <div className="text-3xl mb-2">📄</div>
                <div>
                  <p className="font-semibold text-gray-800">{kkData.fileName}</p>
                  <p className="text-xs text-gray-500">{kkData.fileSize} · {kkData.fileType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">No. KK</span><br /><span className="font-semibold">{kkData.noKK}</span></div>
                <div><span className="text-gray-500">Kepala KK</span><br /><span className="font-semibold">{kkData.kepalaKK}</span></div>
                <div><span className="text-gray-500">Anggota</span><br /><span className="font-semibold">{kkData.anggota}</span></div>
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
            <label className="flex items-center gap-2">
              <input type="radio" name="keputusan" value="setuju" checked={keputusan === 'setuju'} onChange={() => setKeputusan('setuju')} className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Setuju</span>
            </label>
            <label className="flex items-center gap-2">
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
    </div>
  );
}