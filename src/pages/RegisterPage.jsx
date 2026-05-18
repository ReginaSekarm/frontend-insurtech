import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaUserCircle, FaCheckCircle } from 'react-icons/fa';

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

  const registeredEmails = ['nasabah@insurtech.com', 'admin@insurtech.com'];

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
    else if (!/^[0-9]{10,13}$/.test(formData.noTelepon.replace(/\s/g, ''))) newErrors.noTelepon = 'No telepon harus 10-13 digit';
    if (!formData.tanggalLahir) newErrors.tanggalLahir = 'Tanggal lahir harus diisi';
    if (!formData.alamat.trim()) newErrors.alamat = 'Alamat harus diisi';
    if (!formData.password) newErrors.password = 'Password harus diisi';
    else if (formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    if (formData.password !== formData.konfirmasiPassword) newErrors.konfirmasiPassword = 'Password tidak cocok';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Cek email sudah terdaftar
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
    console.log('Data pendaftaran:', { ...formData, ktpFile, kkFile, agreeTerms });
    alert('Pendaftaran berhasil! Silakan login.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-sky-900 mb-6 text-center">Daftar Akun </h1>
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

            {/* Dokumen Pendukung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dokumen Pendukung</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
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
                  <span className="text-sm text-gray-500">KTP</span>
                </div>
                <div className="flex items-center gap-2">
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
                  <span className="text-sm text-gray-500">KK</span>
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
              <button onClick={() => navigate('/login')} className="text-sky-900 font-semibold hover:text-gray-600 transition-colors">
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
              <div>
                <h3 className="font-bold text-base mb-2">2. Definisi layanan</h3>
                <p>InsurTech adalah platform teknologi asuransi yang menyediakan:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Perbandingan dan pembelian produk asuransi dari berbagai mitra penyedia</li>
                  <li>Pengajuan klaim secara digital dan pemantauan statusnya</li>
                  <li>Pengelolaan polis asuransi secara terpadu dalam satu platform</li>
                  <li>Konsultasi dan rekomendasi produk asuransi berdasarkan kebutuhan</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-base mb-2">3. Kelayakan pengguna</h3>
                <p>Layanan InsurTech hanya dapat digunakan oleh:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Individu berusia minimal 17 tahun atau yang telah memiliki KTP</li>
                  <li>Warga Negara Indonesia atau warga asing yang berdomisili di Indonesia</li>
                  <li>Badan usaha yang terdaftar secara sah di Indonesia</li>
                </ul>
                <p className="mt-1">InsurTech berhak menolak atau menonaktifkan akun yang tidak memenuhi kelayakan ini.</p>
              </div>
              <div>
                <h3 className="font-bold text-base mb-2">4. Akun dan keamanan</h3>
                <p>Pengguna bertanggung jawab untuk menjaga kerahasiaan informasi login dan semua aktivitas yang terjadi di akunnya. InsurTech tidak bertanggung jawab atas kerugian akibat kelalaian pengguna dalam menjaga keamanan akun.</p>
              </div>
              <div>
                <h3 className="font-bold text-base mb-2">5. Kewajiban pengguna</h3>
                <p>Pengguna wajib:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Memberikan informasi yang akurat, lengkap, dan terkini</li>
                  <li>Tidak menyalahgunakan platform untuk tujuan penipuan atau ilegal</li>
                  <li>Tidak melakukan tindakan yang merusak sistem atau pengalaman pengguna lain</li>
                  <li>Memahami peraturan perundang-undangan yang berlaku di Indonesia</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-base mb-2">6. Pembatasan tanggung jawab</h3>
                <p>InsurTech bertindak sebagai platform perantara dan tidak bertanggung jawab atas keputusan underwriting, penolakan klaim, atau tindakan lain dari mitra asuransi. Semua ketentuan polis mengacu pada dokumen polis dari penerbit asuransi terkait.</p>
              </div>
              <div>
                <h3 className="font-bold text-base mb-2">7. Perubahan layanan</h3>
                <p>InsurTech berhak mengubah, memperbaiki, atau menghentikan fitur layanan sewaktu-waktu. Perubahan material pada syarat dan ketentuan akan diinformasikan melalui email atau notifikasi dalam aplikasi minimal 14 hari sebelum berlaku.</p>
              </div>
              <div>
                <h3 className="font-bold text-base mb-2">8. Hukum yang berlaku</h3>
                <p>Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia. Setiap perselisihan yang timbul akan diselesaikan melalui musyawarah terlebih dahulu, dan apabila tidak tercapai kesepakatan, akan diselesaikan melalui Pengadilan Negeri Jakarta Selatan.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}