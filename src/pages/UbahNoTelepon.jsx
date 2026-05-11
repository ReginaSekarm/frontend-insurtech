import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function UbahTelepon() {
  const navigate = useNavigate();
  
  // State untuk input
  const [newPhone, setNewPhone] = useState('');
  const [confirmPhone, setConfirmPhone] = useState('');
  
  // State untuk toggle lihat nomor
  const [showNumber, setShowNumber] = useState(false);
  const [showConfirmNumber, setShowConfirmNumber] = useState(false);
  
  // State untuk Pop-up & Error Message
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Logika Validasi
  const validate = () => {
    let isValid = true;
    const isNumeric = /^[0-9]+$/.test(newPhone);
    
    if (!newPhone) {
      setPhoneError('Nomor telepon baru harus diisi.');
      isValid = false;
    } else if (!isNumeric) {
      setPhoneError('Nomor telepon hanya boleh berisi angka.');
      isValid = false;
    } else {
      setPhoneError('');
    }

    if (confirmPhone !== newPhone) {
      setConfirmError('Format nomor tidak valid');
      isValid = false;
    } else {
      setConfirmError('');
    }

    return isValid;
  };

  const handleSave = () => {
    if (validate()) {
      setShowSuccessPopup(true);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessPopup(false);
    navigate('/profil');
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Ubah No. Telepon</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-5 space-y-5">
        
        {/* Nomor Telepon Baru */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon Baru</label>
          <div className="relative">
            <input
              type={showNumber ? 'text' : 'password'}
              value={newPhone}
              onChange={(e) => {
                setNewPhone(e.target.value);
                if (phoneError) setPhoneError('');
              }}
              className={`w-full border ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500`}
              placeholder="+62 8xx-xxxx-xxxx"
            />
            <button
              type="button"
              onClick={() => setShowNumber(!showNumber)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showNumber ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
        </div>

        {/* Konfirmasi No. Telepon Baru  */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi No. Telepon Baru</label>
          <div className="relative">
            <input
              type={showConfirmNumber ? 'text' : 'password'}
              value={confirmPhone}
              onChange={(e) => {
                setConfirmPhone(e.target.value);
                if (confirmError) setConfirmError('');
              }}
              className={`w-full border ${confirmError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500`}
              placeholder="+62 8xx-xxxx-xxxx"
            />
            <button
              type="button"
              onClick={() => setShowConfirmNumber(!showConfirmNumber)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showConfirmNumber ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {confirmError && <p className="text-red-500 text-xs mt-1">{confirmError}</p>}
          {!confirmError && confirmPhone && newPhone === confirmPhone && (
            <p className="text-green-600 text-xs mt-1">Nomor telepon cocok</p>
          )}
        </div>

        {/* Tombol Simpan & Batal */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-sky-950 hover:bg-sky-800 text-white font-semibold py-2 rounded-lg transition"
          >
            Simpan
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
          >
            Batal
          </button>
        </div>
      </div>

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
              <h3 className="text-lg font-bold text-gray-800">Berhasil Diperbarui</h3>
              <p className="text-gray-600 text-sm mt-2">Nomor telepon Anda telah berhasil diganti.</p>
              <button onClick={handleSuccessOk} className="mt-4 bg-sky-950 text-white px-6 py-2 rounded-lg font-medium w-full shadow-md">
                Oke, Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}