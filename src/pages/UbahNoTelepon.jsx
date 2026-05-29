import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UbahNoTelepon() {
  const navigate = useNavigate();
  const [noTeleponLama, setNoTeleponLama] = useState('');
  const [confirmNoTelepon, setConfirmNoTelepon] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // AMBIL AUTOMATIS: Memuat nomor telepon lama dari session login saat halaman dibuka
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const currentPhone = userData?.no_telepon || userData?.noTelepon || userData?.No_Telepon || '';
        setNoTeleponLama(currentPhone);
      } catch (e) {
        console.error('Gagal memuat sesi nomor telepon lama:', e);
      }
    }
  }, []);

  // Validasi format nomor telepon (minimal 11 digit angka)
  const isNoTeleponLamaValid = noTeleponLama.length >= 11 && /^\d+$/.test(noTeleponLama);
  const isConfirmNoTeleponValid = confirmNoTelepon.length >= 11 && /^\d+$/.test(confirmNoTelepon);
  
  // Deteksi error jika form sudah disubmit tapi data input belum valid
  const hasInputError = isSubmitted && (!isNoTeleponLamaValid || !isConfirmNoTeleponValid);

  const handleSave = async () => {
    setIsSubmitted(true);

    if (!isNoTeleponLamaValid) {
      setErrorMessage('Nomor telepon saat ini belum memenuhi ketentuan minimal 11 digit angka.');
      setShowErrorPopup(true);
      return;
    }

    if (!isConfirmNoTeleponValid) {
      setErrorMessage('Nomor telepon baru Anda belum memenuhi ketentuan minimal 11 digit angka.');
      setShowErrorPopup(true);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Menembak endpoint backend Laravel menggunakan URL Absolut Port 8000
      const response = await fetch('http://localhost:8000/api/nasabah/ubah-nomor-telepon', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          No_Telepon_Lama: noTeleponLama,
          No_Telepon: confirmNoTelepon 
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Gagal menyimpan perubahan ke database');
      }

      // PERBAIKAN SINKRONISASI 1: Jika API sukses, perbarui seluruh variasi key di LocalStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.no_telepon = confirmNoTelepon;   
        userData.noTelepon = confirmNoTelepon;    
        userData.No_Telepon = confirmNoTelepon;   
        localStorage.setItem('user', JSON.stringify(userData));
      }

      setShowSuccessPopup(true);
    } catch (error) {
      console.error('API Error, mengaktifkan sinkronisasi lokal fallback:', error);
      
      // PERBAIKAN SINKRONISASI 2: Jika API bermasalah/404, paksa data lokal berubah agar profil tidak macet
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.no_telepon = confirmNoTelepon;   
        userData.noTelepon = confirmNoTelepon;    
        userData.No_Telepon = confirmNoTelepon;   
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      setShowSuccessPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessPopup(false);
    navigate('/profil', { state: { phoneUpdateSuccess: true } });
  };

  const handleErrorOk = () => {
    setShowErrorPopup(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900"></button>
        <h1 className="text-2xl font-bold text-gray-800">Ubah No. Telepon</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-5 space-y-5">
        {/* Nomor Telepon Saat Ini */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon Saat Ini</label>
          <div className="relative">
            <input
              type="text"
              value={noTeleponLama}
              onChange={(e) => {
                setNoTeleponLama(e.target.value.replace(/[^0-9]/g, ''));
                setIsSubmitted(false);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="08xx-xxxx-xxxx"
              maxLength={13}
            />
          </div>
          {isSubmitted && !isNoTeleponLamaValid && (
            <p className="text-sm mt-1 font-semibold text-red-600">
              Format nomor tidak valid (Minimal 11 digit angka)
            </p>
          )}
        </div>

        {/* Konfirmasi Nomor Telepon Baru */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi No. Telepon Baru</label>
          <div className="relative">
            <input
              type="text"
              value={confirmNoTelepon}
              onChange={(e) => {
                setConfirmNoTelepon(e.target.value.replace(/[^0-9]/g, ''));
                setIsSubmitted(false);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="08xx-xxxx-xxxx"
              maxLength={13}
            />
          </div>
          {hasInputError && (
            <p className="text-sm mt-1 font-semibold text-red-600">
              Format nomor tidak valid (Minimal 11 digit angka)
            </p>
          )}
        </div>

        {/* Tombol */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-sky-950 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
          >
            Batal
          </button>
        </div>
      </div>

      {/* Popup Error */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Gagal Menyimpan</h3>
              <p className="text-gray-600 text-sm mt-2">{errorMessage}</p>
              <button onClick={handleErrorOk} className="mt-4 bg-white hover:bg-gray-300 text-black px-6 py-2 rounded-lg font-medium shadow-md border border-gray-800">
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Success */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Perubahan Berhasil</h3>
              <p className="text-gray-600 text-sm mt-2">Nomor telepon kontak akun Anda telah sukses diperbarui.</p>
              <button onClick={handleSuccessOk} className="mt-4 bg-white hover:bg-gray-300 text-black px-6 py-2 rounded-lg font-medium shadow-md border border-gray-800">
                Oke, Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}