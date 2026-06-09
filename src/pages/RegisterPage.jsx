import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserCircle, FaCheckCircle, FaTimesCircle,
  FaEye, FaEyeSlash, FaTrash, FaExternalLinkAlt,
  FaTimes, FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';

function AlertPopup({ show, type = 'warning', title, message, onClose }) {
  if (!show) return null;

  const config = {
    warning: {
      bg: 'bg-yellow-100',
      icon: <FaExclamationTriangle className="text-yellow-500 text-3xl" />,
      btnColor: 'bg-yellow-500 hover:bg-yellow-600',
    },
    error: {
      bg: 'bg-red-100',
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      btnColor: 'bg-red-500 hover:bg-red-600',
    },
    info: {
      bg: 'bg-blue-100',
      icon: <FaInfoCircle className="text-blue-500 text-3xl" />,
      btnColor: 'bg-sky-900 hover:bg-sky-800',
    },
  };

  const c = config[type] || config.warning;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="text-center">
          <div className={`w-16 h-16 ${c.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {c.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <p className="text-gray-600 text-sm mt-2">{message}</p>
        </div>
        <div className="mt-5 flex justify-center">
          <button
            onClick={onClose}
            className={`${c.btnColor} text-white px-8 py-2 rounded-lg font-semibold transition`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    namaLengkap: '',
    email: '',
    noTelepon: '',
    tanggalLahir: '',
    alamat: '',
    password: '',
    konfirmasiPassword: '',
  });

  const [ktpFile, setKtpFile] = useState(null);
  const [kkFile, setKkFile] = useState(null);
  const [ktpPreview, setKtpPreview] = useState(null);
  const [kkPreview, setKkPreview] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [emailPopupMsg, setEmailPopupMsg] = useState('');
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [alertPopup, setAlertPopup] = useState({
    show: false,
    type: 'warning',
    title: '',
    message: '',
    onClose: null,
  });

  const showAlert = (type, title, message, callback = null) => {
    setAlertPopup({
      show: true,
      type,
      title,
      message,
      onClose: () => {
        setAlertPopup(prev => ({ ...prev, show: false }));
        if (callback) callback();
      },
    });
  };

  const registeredEmails = ['nasabah@insurtech.com', 'admin@insurtech.com'];

  const getMaxDateString = () => {
    const lastYear = new Date().getFullYear() - 1;
    return `${lastYear}-12-31`;
  };

  const password = formData.password;
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleKtpChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showAlert('warning', 'File Terlalu Besar', 'Ukuran file KTP maksimal 5MB. Harap pilih file lain.');
        e.target.value = '';
        return;
      }
      setKtpFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setKtpPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setKtpPreview(null);
      }
    }
  };

  const handleKkChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showAlert('warning', 'File Terlalu Besar', 'Ukuran file KK maksimal 5MB. Harap pilih file lain.');
        e.target.value = '';
        return;
      }
      setKkFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setKkPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setKkPreview(null);
      }
    }
  };

  const handleBukaDokumen = (type, file, preview) => {
    if (!file) {
      showAlert('info', 'File Belum Ada', 'File belum diupload. Silakan pilih file terlebih dahulu.');
      return;
    }
    if (file.type.startsWith('image/')) {
      if (preview) {
        setSelectedImage(preview);
        setSelectedImageTitle(type === 'ktp' ? 'Foto KTP' : 'Foto KK');
        setShowImageModal(true);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newPreview = reader.result;
          if (type === 'ktp') setKtpPreview(newPreview);
          else setKkPreview(newPreview);
          setSelectedImage(newPreview);
          setSelectedImageTitle(type === 'ktp' ? 'Foto KTP' : 'Foto KK');
          setShowImageModal(true);
        };
        reader.readAsDataURL(file);
      }
    } else if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    }
  };

  const handleRemoveKtp = () => { setKtpFile(null); setKtpPreview(null); };
  const handleRemoveKk = () => { setKkFile(null); setKkPreview(null); };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.namaLengkap.trim()) newErrors.namaLengkap = 'Nama lengkap harus diisi';
    if (!formData.email.trim()) newErrors.email = 'Email harus diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!formData.noTelepon.trim()) newErrors.noTelepon = 'No telepon harus diisi';
    else if (!/^[0-9]{10,13}$/.test(formData.noTelepon.replace(/\s/g, ''))) newErrors.noTelepon = 'No telepon harus 10-13 digit angka';
    if (!formData.tanggalLahir) {
      newErrors.tanggalLahir = 'Tanggal lahir harus diisi';
    } else {
      const selectedYear = new Date(formData.tanggalLahir).getFullYear();
      const currentYear = new Date().getFullYear();
      if (selectedYear >= currentYear) newErrors.tanggalLahir = 'Tahun lahir tidak boleh tahun ini atau tahun depan';
    }
    if (!formData.alamat.trim()) newErrors.alamat = 'Alamat harus diisi';
    if (!formData.password) newErrors.password = 'Password harus diisi';
    else if (formData.password.length < 8) newErrors.password = 'Password minimal 8 karakter';
    if (formData.password !== formData.konfirmasiPassword) newErrors.konfirmasiPassword = 'Password tidak cocok';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    if (registeredEmails.includes(formData.email.toLowerCase())) {
      setEmailPopupMsg(`Email ${formData.email} sudah digunakan.`);
      setShowEmailPopup(true);
      setTimeout(() => setShowEmailPopup(false), 3000);
      return;
    }

    if (!ktpFile || !kkFile) {
      showAlert('warning', 'Dokumen Belum Lengkap', 'Harap upload KTP dan Kartu Keluarga sebelum melanjutkan.');
      return;
    }

    if (!agreeTerms) {
      showAlert('info', 'Syarat & Ketentuan', 'Harap menyetujui Syarat & Ketentuan serta Kebijakan Privasi InsurTech untuk melanjutkan.');
      return;
    }

    setIsLoading(true);

    try {
      const registerRes = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Nama_Lengkap: formData.namaLengkap,
          Email: formData.email,
          Password: formData.password,
          No_Telepon: formData.noTelepon,
          Tanggal_Lahir: formData.tanggalLahir,
          Alamat_Lengkap: formData.alamat,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        if (registerData.message?.toLowerCase().includes('email')) {
          setEmailPopupMsg(registerData.message);
          setShowEmailPopup(true);
          setTimeout(() => setShowEmailPopup(false), 3000);
        } else {
          const errorMsg = registerData.errors
            ? Object.values(registerData.errors).flat().join(', ')
            : registerData.message;
          showAlert('error', 'Registrasi Gagal', errorMsg || 'Registrasi gagal. Silakan coba lagi.');
        }
        return;
      }

      const loginRes = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: formData.email,
          Password: formData.password,
        }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        showAlert(
          'info',
          'Login Otomatis Gagal',
          'Registrasi berhasil tapi gagal login otomatis. Silakan login manual.',
          () => navigate('/login')
        );
        return;
      }

      const token = loginData.token;
      localStorage.setItem('token', token);
      if (loginData.user) localStorage.setItem('user', JSON.stringify(loginData.user));

      const dokumenForm = new FormData();
      dokumenForm.append('foto_ktp', ktpFile);
      dokumenForm.append('foto_kk', kkFile);

      const uploadRes = await fetch('http://localhost:8000/api/upload-dokumen', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: dokumenForm,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        showAlert(
          'warning',
          'Upload Dokumen Gagal',
          'Akun berhasil dibuat, tapi gagal upload dokumen: ' +
            (uploadData.message || 'Coba upload ulang di halaman profil.'),
          () => navigate('/login')
        );
        return;
      }

      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Error registrasi:', error);
      showAlert('error', 'Kesalahan Jaringan', 'Terjadi kesalahan jaringan. Pastikan backend menyala.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-sky-900 mb-6 text-center">Daftar Akun</h1>
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="mb-6 flex items-start gap-3">
            <FaUserCircle className="text-sky-900 text-3xl mt-1" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Identitas Pribadi</h2>
              <p className="text-sm text-gray-500">Lindungi profil cakupan editorial Anda.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input type="text" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} placeholder="Nama Lengkap"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
              {errors.namaLengkap && <p className="text-red-500 text-xs mt-1">{errors.namaLengkap}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="nama@gmail.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
              <input type="tel" name="noTelepon" value={formData.noTelepon} onChange={handleChange} placeholder="08xx xxxx xxxx" minLength="10" maxLength="13"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
              {errors.noTelepon && <p className="text-red-500 text-xs mt-1">{errors.noTelepon}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
              <input type="date" name="tanggalLahir" max={getMaxDateString()} value={formData.tanggalLahir} onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-gray-800" />
              {errors.tanggalLahir && <p className="text-red-500 text-xs mt-1">{errors.tanggalLahir}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Alamat</label>
              <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows="2" placeholder="Alamat Lengkap"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
              {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="•••"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <div className="mt-2 bg-gray-50 p-3 rounded-lg space-y-1">
                <p className="text-xs font-semibold text-gray-600">Syarat Password</p>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li className="flex items-center gap-2">{hasMinLength ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-gray-400" />}Minimal 8 Karakter</li>
                  <li className="flex items-center gap-2">{hasUpperCase ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-gray-400" />}Mengandung huruf besar (A-Z)</li>
                  <li className="flex items-center gap-2">{hasNumber ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-gray-400" />}Mengandung angka (0-9)</li>
                  <li className="flex items-center gap-2">{hasSpecialChar ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-gray-400" />}Mengandung karakter unik (!@#$%)</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} name="konfirmasiPassword" value={formData.konfirmasiPassword} onChange={handleChange} placeholder="•••"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.konfirmasiPassword && <p className="text-red-500 text-xs mt-1">{errors.konfirmasiPassword}</p>}
              {formData.konfirmasiPassword && formData.password === formData.konfirmasiPassword && (
                <p className="text-xs text-green-600 mt-1">✓ Password cocok</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dokumen Pendukung</label>
              <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                {/* KTP */}
                <div className="flex flex-col gap-1 pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500 font-bold w-12">KTP</span>
                    {!ktpFile ? (
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleKtpChange}
                        className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                    ) : (
                      <div className="flex items-center gap-3 bg-white border px-3 py-1.5 rounded-lg text-sm text-gray-700 shadow-sm flex-1 max-w-full justify-between">
                        <span className="truncate max-w-[150px] font-medium text-xs">✓ {ktpFile.name}</span>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => handleBukaDokumen('ktp', ktpFile, ktpPreview)}
                            className="text-sky-700 hover:text-sky-900 flex items-center gap-1 text-xs font-semibold">
                            <FaExternalLinkAlt size={11} /> Buka
                          </button>
                          <button type="button" onClick={handleRemoveKtp} className="text-red-500 hover:text-red-700 p-1">
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {ktpPreview && (
                    <div className="mt-2 ml-14">
                      <img src={ktpPreview} alt="Pratinjau KTP"
                        className="h-16 w-auto rounded border object-cover shadow-sm bg-white cursor-pointer hover:opacity-80"
                        onClick={() => handleBukaDokumen('ktp', ktpFile, ktpPreview)} />
                    </div>
                  )}
                </div>

                {/* KK */}
                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500 font-bold w-12">KK</span>
                    {!kkFile ? (
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleKkChange}
                        className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                    ) : (
                      <div className="flex items-center gap-3 bg-white border px-3 py-1.5 rounded-lg text-sm text-gray-700 shadow-sm flex-1 max-w-full justify-between">
                        <span className="truncate max-w-[150px] font-medium text-xs">✓ {kkFile.name}</span>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => handleBukaDokumen('kk', kkFile, kkPreview)}
                            className="text-sky-700 hover:text-sky-900 flex items-center gap-1 text-xs font-semibold">
                            <FaExternalLinkAlt size={11} /> Buka
                          </button>
                          <button type="button" onClick={handleRemoveKk} className="text-red-500 hover:text-red-700 p-1">
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {kkPreview && (
                    <div className="mt-2 ml-14">
                      <img src={kkPreview} alt="Pratinjau KK"
                        className="h-16 w-auto rounded border object-cover shadow-sm bg-white cursor-pointer hover:opacity-80"
                        onClick={() => handleBukaDokumen('kk', kkFile, kkPreview)} />
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-1">Format JPG, PNG, PDF (maks 5MB)</p>
              </div>
            </div>

            <div className="flex items-start">
              <input type="checkbox" id="terms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded mt-1" />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Saya menyetujui{' '}
                <button type="button" onClick={() => setShowTermsPopup(true)}
                  className="text-sky-900 font-medium hover:text-gray-600 transition-colors">
                  Syarat & Ketentuan serta Kebijakan Privasi InsurTech
                </button>
              </label>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-sky-900 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? 'Memproses...' : 'Daftar'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Sudah punya akun?{' '}
              <button type="button" onClick={() => navigate('/login')} className="text-sky-900 font-semibold hover:text-gray-600 transition-colors">
                Masuk
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* ✅ CUSTOM ALERT POPUP */}
      <AlertPopup
        show={alertPopup.show}
        type={alertPopup.type}
        title={alertPopup.title}
        message={alertPopup.message}
        onClose={alertPopup.onClose}
      />

      {/* MODAL PREVIEW GAMBAR */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => { setShowImageModal(false); setSelectedImage(null); }}>
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setShowImageModal(false); setSelectedImage(null); }}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors text-3xl font-bold">
              <FaTimes size={28} />
            </button>
            <h3 className="text-white text-center mb-2">{selectedImageTitle}</h3>
            <img src={selectedImage} alt={selectedImageTitle}
              className="w-full h-auto rounded-lg shadow-2xl"
              style={{ maxHeight: '85vh', objectFit: 'contain' }}
              onError={() => {
                showAlert('error', 'Gagal Memuat Gambar', 'Gambar tidak dapat ditampilkan.');
                setShowImageModal(false);
              }} />
            <div className="text-center mt-4">
              <button onClick={() => { setShowImageModal(false); setSelectedImage(null); }}
                className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP EMAIL SUDAH TERDAFTAR */}
      {showEmailPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Email Sudah Terdaftar</h3>
              <p className="text-gray-600 text-sm mt-2">{emailPopupMsg}</p>
            </div>
          </div>
        </div>
      )}

      {/* POPUP SYARAT & KETENTUAN */}
      {showTermsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Syarat & Ketentuan InsurTech</h2>
              <button onClick={() => setShowTermsPopup(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-gray-700">
              <div><h3 className="font-bold text-base mb-2">1. Penerimaan syarat</h3><p>Dengan mendaftar, mengakses, atau menggunakan layanan InsurTech, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang tercantum dalam dokumen ini.</p></div>
              <div><h3 className="font-bold text-base mb-2">2. Definisi layanan</h3><p>InsurTech adalah platform teknologi asuransi yang menyediakan perbandingan dan pembelian produk asuransi, pengajuan klaim secara digital, dan pengelolaan polis secara terpadu.</p></div>
              <div><h3 className="font-bold text-base mb-2">3. Kelayakan pengguna</h3><p>Layanan hanya dapat digunakan oleh individu berusia minimal 17 tahun atau yang telah memiliki KTP, dan Warga Negara Indonesia atau warga asing berdomisili di Indonesia.</p></div>
              <div><h3 className="font-bold text-base mb-2">4. Akun dan keamanan</h3><p>Pengguna bertanggung jawab menjaga kerahasiaan informasi login dan semua aktivitas yang terjadi di akunnya.</p></div>
              <div><h3 className="font-bold text-base mb-2">5. Kewajiban pengguna</h3><p>Pengguna wajib memberikan informasi yang akurat, lengkap, dan terkini serta tidak menyalahgunakan platform untuk tujuan penipuan atau ilegal.</p></div>
              <div><h3 className="font-bold text-base mb-2">6. Pembatasan tanggung jawab</h3><p>InsurTech bertindak sebagai platform perantara dan tidak bertanggung jawab atas keputusan underwriting atau penolakan klaim dari mitra asuransi.</p></div>
              <div><h3 className="font-bold text-base mb-2">7. Hukum yang berlaku</h3><p>Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia.</p></div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP REGISTRASI BERHASIL */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Pendaftaran Berhasil!</h3>
              <p className="text-gray-600 text-sm mt-2">Akun dan dokumen Anda berhasil disimpan. Menunggu verifikasi admin.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}