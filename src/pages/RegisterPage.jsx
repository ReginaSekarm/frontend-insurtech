import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaUserCircle, FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

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
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});

  // Popup email sudah terdaftar
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [emailPopupMsg, setEmailPopupMsg] = useState('');

  // Popup syarat & ketentuan
  const [showTermsPopup, setShowTermsPopup] = useState(false);

  // State untuk toggle password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State untuk popup registrasi berhasil
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const registeredEmails = ['nasabah@insurtech.com', 'admin@insurtech.com']; // fallback lokal (bisa dihapus jika hanya pakai API)

  // Validasi password 
  const password = formData.password;
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Helper untuk validasi nomor telepon (hanya angka, panjang 11-13)
  const getPhoneDigits = (phone) => phone.replace(/\D/g, '');
  const isPhoneValid = () => {
    const digits = getPhoneDigits(formData.noTelepon);
    return digits.length >= 11 && digits.length <= 13;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.namaLengkap.trim()) newErrors.namaLengkap = 'Nama lengkap harus diisi';
    if (!formData.email.trim()) newErrors.email = 'Email harus diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!formData.noTelepon.trim()) newErrors.noTelepon = 'No telepon harus diisi';
    else if (!/^[0-9]{10,13}$/.test(formData.noTelepon.replace(/\s/g, ''))) newErrors.noTelepon = 'No telepon harus 10-13 digit angka';
    if (!formData.tanggalLahir) newErrors.tanggalLahir = 'Tanggal lahir harus diisi';
    if (!formData.alamat.trim()) newErrors.alamat = 'Alamat harus diisi';
    if (!formData.password) newErrors.password = 'Password harus diisi';
    else if (formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    if (formData.password !== formData.konfirmasiPassword) newErrors.konfirmasiPassword = 'Password tidak cocok';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Cek email sudah terdaftar secara lokal
    if (registeredEmails.includes(formData.email.toLowerCase())) {
      setEmailPopupMsg(`Email ${formData.email} sudah digunakan. Silakan gunakan email lain atau masuk ke akun Anda.`);
      setShowEmailPopup(true);
      setTimeout(() => setShowEmailPopup(false), 3000);
      return;
    }

    if (!ktpFile || !kkFile) {
      alert('Harap upload KTP dan Kartu Keluarga');
      return;
    }
    if (!agreeTerms) {
      alert('Harap menyetujui syarat & ketentuan');
      return;
    }

    // Kirim data ke backend
    try {
      const formDataToSend = new FormData();
      
      // PERUBAHAN ADA DI SINI:
      // Key disamakan 100% dengan $request->validate() di AuthController.php
      formDataToSend.append('Nama_Lengkap', formData.namaLengkap);
      formDataToSend.append('Email', formData.email);
      formDataToSend.append('Password', formData.password);
      formDataToSend.append('No_Telepon', formData.noTelepon);
      formDataToSend.append('Tanggal_Lahir', formData.tanggalLahir);
      formDataToSend.append('Alamat_Lengkap', formData.alamat);
      
      // Mengirim file tetap dilampirkan meskipun backend saat ini belum memprosesnya
      formDataToSend.append('ktp', ktpFile);
      formDataToSend.append('kk', kkFile);

      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Accept': 'application/json', 
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message && (data.message.toLowerCase().includes('email') || data.message.toLowerCase().includes('sudah terdaftar'))) {
          setEmailPopupMsg(data.message);
          setShowEmailPopup(true);
          setTimeout(() => setShowEmailPopup(false), 3000);
        } else {
          // Menampilkan error validasi Laravel dengan lebih rapi (jika ada)
          const errorMsg = data.errors 
            ? Object.values(data.errors).flat().join(', ') 
            : data.message;
          alert(errorMsg || 'Registrasi gagal. Silakan coba lagi.');
        }
        return;
      }

      // Registrasi sukses
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate('/login'); // Diubah ke login agar flow-nya aman
      }, 2000);
    } catch (error) {
      console.error('Error registrasi:', error);
      alert('Terjadi kesalahan jaringan. Pastikan backend menyala.');
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
              <input
                type="text"
                name="namaLengkap"
                value={formData.namaLengkap}
                onChange={handleChange}
                placeholder="Nama Lengkap"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              />
              {errors.namaLengkap && <p className="text-red-500 text-xs mt-1">{errors.namaLengkap}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@gmail.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
              <input
                type="tel"
                name="noTelepon"
                value={formData.noTelepon}
                onChange={handleChange}
                placeholder="08xx xxxx xxxx"
                minLength="10"
                maxLength="13"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              />
              {/* Indikator syarat panjang digit */}
              {formData.noTelepon && (
                <div className="mt-1 flex items-center gap-2 text-xs">
                  {isPhoneValid() ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : null}
                </div>
              )}
              {/* Pesan error jika kurang dari 11 digit */}
              {formData.noTelepon && getPhoneDigits(formData.noTelepon).length > 0 && getPhoneDigits(formData.noTelepon).length < 11 && (
                <p className="text-red-500 text-xs mt-1">Format no telepon minimal 11 digit</p>
              )}
              {errors.noTelepon && <p className="text-red-500 text-xs mt-1">{errors.noTelepon}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
              <input
                type="date"
                name="tanggalLahir"
                value={formData.tanggalLahir}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              />
              {errors.tanggalLahir && <p className="text-red-500 text-xs mt-1">{errors.tanggalLahir}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Alamat</label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                rows="2"
                placeholder="Alamat Lengkap"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              />
              {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat}</p>}
            </div>

            {/* Password dengan icon mata dan syarat */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="•••"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              {/* Syarat Password */}
              <div className="mt-2 bg-gray-50 p-3 rounded-lg space-y-1">
                <p className="text-xs font-semibold text-gray-600">Syarat Password</p>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li className="flex items-center gap-2">
                    {hasMinLength ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-gray-400" />}
                    Minimal 8 Karakter
                  </li>
                  <li className="flex items-center gap-2">
                    {hasUpperCase ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-gray-400" />}
                    Mengandung huruf besar (A-Z)
                  </li>
                  <li className="flex items-center gap-2">
                    {hasNumber ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-gray-400" />}
                    Mengandung angka (0-9)
                  </li>
                  <li className="flex items-center gap-2">
                    {hasSpecialChar ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-gray-400" />}
                    Mengandung karakter unik (!@#$%)
                  </li>
                </ul>
              </div>
            </div>

            {/* Konfirmasi Password dengan icon mata */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="konfirmasiPassword"
                  value={formData.konfirmasiPassword}
                  onChange={handleChange}
                  placeholder="•••"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.konfirmasiPassword && <p className="text-red-500 text-xs mt-1">{errors.konfirmasiPassword}</p>}
              {formData.konfirmasiPassword && formData.password === formData.konfirmasiPassword && (
                <p className="text-xs text-green-600 mt-1">✓ Password cocok</p>
              )}
            </div>

            {/* Dokumen Pendukung - label KTP dan KK di kiri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dokumen Pendukung</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-bold">KTP</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.size > 5 * 1024 * 1024) alert('Ukuran file maksimal 5MB');
                      else setKtpFile(file);
                    }}
                    className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-bold">KK</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.size > 5 * 1024 * 1024) alert('Ukuran file maksimal 5MB');
                      else setKkFile(file);
                    }}
                    className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="flex flex-wrap gap-3 mt-1">
                  {ktpFile && <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">✓ KTP: {ktpFile.name}</span>}
                  {kkFile && <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">✓ KK: {kkFile.name}</span>}
                </div>
                <p className="text-xs text-gray-400">Format JPG, PNG, PDF (maks 5MB)</p>
              </div>
            </div>

            {/* Checkbox dan tombol */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Saya menyetujui{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsPopup(true)}
                  className="text-sky-900 font-medium hover:text-gray-600 transition-colors"
                >
                  Syarat & Ketentuan serta Kebijakan Privasi InsurTech
                </button>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-900 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
            >
              Daftar
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
              <h3 className="text-lg font-bold text-gray-800">Perhatian</h3>
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
              <button
                onClick={() => setShowTermsPopup(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-gray-700">
              <div>
                <h3 className="font-bold text-base mb-2">1. Penerimaan syarat</h3>
                <p>Dengan mendaftar, mengakses, atau menggunakan layanan InsurTech, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang tercantum dalam dokumen ini. Jika Anda tidak menyetujui syarat ini, harap tidak melanjutkan penggunaan layanan.</p>
              </div>
              {/* Bagian syarat & ketentuan lainnya... */}
              <div>
                <h3 className="font-bold text-base mb-2">2. Definisi layanan</h3>
                <p>InsurTech adalah platform teknologi asuransi yang menyediakan: ...</p>
              </div>
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
              <p className="text-gray-600 text-sm mt-2">
                Akun Anda telah berhasil dibuat. Anda akan dialihkan ke halaman utama.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}