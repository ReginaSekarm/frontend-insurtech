import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUpload, FaCheckCircle, FaUserCircle } from 'react-icons/fa';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Data Diri, 2: Dokumen

  //data step 1
  const [formData, setFormData] = useState({
    namaLengkap: '',
    email: '',
    noTelepon: '',
    tanggalLahir: '',
    alamat: '',
    password: '',
    konfirmasiPassword: '',
  });

  //file upload
  const [ktpFile, setKtpFile] = useState(null);
  const [kkFile, setKkFile] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.namaLengkap.trim()) newErrors.namaLengkap = 'Nama lengkap harus diisi';
    if (!formData.email.trim()) newErrors.email = 'Email harus diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!formData.noTelepon.trim()) newErrors.noTelepon = 'No telepon harus diisi';
    else if (!/^[0-9]{10,13}$/.test(formData.noTelepon.replace(/\s/g, ''))) newErrors.noTelepon = 'No telepon harus 10-13 digit';
    if (!formData.tanggalLahir) newErrors.tanggalLahir = 'Tanggal lahir harus diisi';
    if (!formData.alamat.trim()) newErrors.alamat = 'Alamat harus diisi';
    if (!formData.password) newErrors.password = 'Password harus diisi';
    else if (formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    if (formData.password !== formData.konfirmasiPassword) newErrors.konfirmasiPassword = 'Password tidak cocok';
    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validateStep1();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }
    if (type === 'ktp') setKtpFile(file);
    else setKkFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ktpFile || !kkFile) {
      alert('Harap upload KTP dan Kartu Keluarga');
      return;
    }
    if (!agreeTerms) {
      alert('Harap menyetujui syarat & ketentuan');
      return;
    }
    console.log('Data pendaftaran:', { ...formData, ktpFile, kkFile, agreeTerms });
    alert('Pendaftaran berhasil! Silakan login.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center">Daftar Akun</h1>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-4 mt-4">
            {/* Step 1 - jika sudah selesai (step===2) tampilkan centang, jika aktif tampilkan angka 1 */}
            <div className={`flex items-center ${step === 2 ? 'text-green-600' : step === 1 ? 'text-sky-900' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 2 
                  ? 'bg-green-500 text-white' 
                  : step === 1 
                  ? 'bg-sky-900 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step === 2 ? <FaCheckCircle className="text-white text-sm" /> : 1}
              </div>
              <span className="ml-2 text-sm font-medium">Data Diri</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            {/* Step 2 */}
            <div className={`flex items-center ${step === 2 ? 'text-sky-900' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 2 ? 'bg-sky-900 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Dokumen</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {step === 1 ? (
            // Step 1: Identitas Pribadi (tidak berubah)
            <div>
              <div className="mb-6 flex items-start gap-3">
                <FaUserCircle className="text-sky-900 text-3xl mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Identitas Pribadi</h2>
                  <p className="text-sm text-gray-500">Lindungi profil cakupan editorial Anda.</p>
                </div>
              </div>
              <form className="space-y-4">
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
                    placeholder="+62 8xx xxxx xxxx"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="•••"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
                  <input
                    type="password"
                    name="konfirmasiPassword"
                    value={formData.konfirmasiPassword}
                    onChange={handleChange}
                    placeholder="•••"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  />
                  {errors.konfirmasiPassword && <p className="text-red-500 text-xs mt-1">{errors.konfirmasiPassword}</p>}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-auto px-6 bg-sky-900 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition mx-auto block"
                >
                  Lanjut
                </button>
                <p className="text-center text-sm text-gray-600 mt-3">
                  Sudah punya akun?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-sky-900 font-semibold hover:underline"
                  >
                    Masuk
                  </button>
                </p>
              </form>
            </div>
          ) : (
            // Step 2: Upload Dokumen
            <div>
              <div className="mb-6 flex items-start gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Upload Dokumen</h2>
                  <p className="text-sm text-gray-500">Dokumen diperlukan untuk verifikasi identitas</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload KTP</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-sky-500 transition">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange(e, 'ktp')}
                      className="hidden"
                      id="ktp-upload"
                    />
                    <label htmlFor="ktp-upload" className="cursor-pointer flex flex-col items-center">
                      <FaUpload className="text-gray-400 text-2xl mb-2" />
                      <span className="text-sm text-gray-500">Foto atau scan KTP yang jelas</span>
                      <span className="text-xs text-gray-400">JPG / PNG - maks. 5MB</span>
                    </label>
                  </div>
                  {ktpFile && <p className="text-xs text-green-600 mt-1">✓ {ktpFile.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Kartu Keluarga</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-sky-500 transition">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange(e, 'kk')}
                      className="hidden"
                      id="kk-upload"
                    />
                    <label htmlFor="kk-upload" className="cursor-pointer flex flex-col items-center">
                      <FaUpload className="text-gray-400 text-2xl mb-2" />
                      <span className="text-sm text-gray-500">Foto atau scan Kartu Keluarga</span>
                      <span className="text-xs text-gray-400">JPG / PNG - maks. 5MB</span>
                    </label>
                  </div>
                  {kkFile && <p className="text-xs text-green-600 mt-1">✓ {kkFile.name}</p>}
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded mt-1"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    Saya menyetujui <a href="#" className="text-sky-900 font-medium">Syarat & Ketentuan serta Kebijakan Privasi InsurTech</a>
                  </label>
                </div>

                {/* ✅ PERUBAHAN: Tombol Daftar di atas, Kembali di bawah dengan ikon panah */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-sky-900 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Daftar
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <FaArrowLeft size={16} />
                    Kembali
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}