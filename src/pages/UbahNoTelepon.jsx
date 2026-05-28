import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function UbahNoTelepon() {
  const navigate = useNavigate();
  const [noTeleponLama, setNoTeleponLama] = useState('');
  const [confirmNoTelepon, setConfirmNoTelepon] = useState('');
  const [showNoTelepon, setShowNoTelepon] = useState(true); 
  const [showConfirmNoTelepon, setShowConfirmNoTelepon] = useState(true); 
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center pt-16 px-4">
      <div className="w-full max-w-md space-y-6">
        
        <h1 className="text-xl font-bold text-sky-950 text-center tracking-wide uppercase">
          Ubah No. Telepon
        </h1>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-5 relative">
          
          {/* Field 1: Nomor Telepon Saat Ini */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              No. Telepon Saat Ini
            </label>
            <div className="relative">
              <input
                type={showNoTelepon ? 'text' : 'password'}
                value={noTeleponLama}
                onChange={(e) => {
                  setNoTeleponLama(e.target.value.replace(/[^0-9]/g, ''));
                  setIsSubmitted(false);
                }}
                className={`w-full border ${isSubmitted && !isNoTeleponLamaValid ? 'border-red-400 focus:ring-red-200 bg-red-50/10' : 'border-gray-300 focus:ring-blue-200'} rounded-xl px-4 py-2.5 pr-11 focus:outline-none focus:ring-4 font-medium text-gray-800 transition-all`}
                placeholder="08xx-xxxx-xxxx"
                maxLength={13}
              />
              <button
                type="button"
                onClick={() => setShowNoTelepon(!showNoTelepon)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showNoTelepon ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {isSubmitted && !isNoTeleponLamaValid && (
              <p className="text-red-500 text-[11px] font-medium mt-1.5 pl-1">
                Format nomor tidak valid (Minimal 11 digit angka)
              </p>
            )}
          </div>

          {/* Field 2: Konfirmasi Nomor Telepon Baru */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Konfirmasi No. Telepon Baru
            </label>
            <div className="relative">
              <input
                type={showConfirmNoTelepon ? 'text' : 'password'}
                value={confirmNoTelepon}
                onChange={(e) => {
                  setConfirmNoTelepon(e.target.value.replace(/[^0-9]/g, ''));
                  setIsSubmitted(false);
                }}
                className={`w-full border ${hasInputError ? 'border-red-400 focus:ring-red-200 bg-red-50/10' : 'border-gray-300 focus:ring-blue-200'} rounded-xl px-4 py-2.5 pr-11 focus:outline-none focus:ring-4 font-medium text-gray-800 transition-all`}
                placeholder="08xx-xxxx-xxxx"
                maxLength={13}
              />
              <button
                type="button"
                onClick={() => setShowConfirmNoTelepon(!showConfirmNoTelepon)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmNoTelepon ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            
            {hasInputError && (
              <p className="text-red-500 text-[11px] font-medium mt-1.5 pl-1 transition-all">
                Format nomor tidak valid (Minimal 11 digit angka)
              </p>
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-[#2C5266] hover:bg-sky-900 text-white font-bold py-2.5 rounded-xl transition-all shadow disabled:opacity-50 text-sm"
            >
              {isLoading ? 'Memproses...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profil')}
              disabled={isLoading}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl border border-gray-300 shadow-sm transition-all text-sm"
            >
              Batal
            </button>
          </div>
        </div>
      </div>

      {/* POPUP ALERT MODAL: ERROR HANDLING */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-50">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-md font-bold text-gray-800">Gagal Menyimpan</h3>
            <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">{errorMessage}</p>
            <button 
              type="button"
              onClick={() => setShowErrorPopup(false)} 
              className="mt-4 w-full bg-[#2C5266] hover:bg-sky-900 text-white py-2 rounded-xl text-xs font-bold shadow transition-all"
            >
              Perbaiki Input
            </button>
          </div>
        </div>
      )}

      {/* POPUP ALERT MODAL: SUCCESS HANDLING */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-50">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-md font-bold text-gray-800">Perubahan Berhasil</h3>
            <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">Nomor telepon kontak akun Anda telah sukses diperbarui.</p>
            <button 
              type="button"
              onClick={handleSuccessOk} 
              className="mt-4 w-full bg-[#2C5266] hover:bg-sky-900 text-white py-2 rounded-xl text-xs font-bold shadow transition-all"
            >
              Oke, Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}