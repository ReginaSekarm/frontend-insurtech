import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipboardEdit, CloudUpload, Info } from 'lucide-react';

export default function AdminTambahProduk() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, product } = location.state || { mode: 'add', product: null };

  const [status, setStatus] = useState('aktif');
  const [formData, setFormData] = useState({
    namaProduk: '',
    kategori: '',
    premi: '',
    maksKlaim: '',
    masaTunggu: '',
    deskripsi: '',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

 
  useEffect(() => {
    if (showErrorPopup) {
      const timer = setTimeout(() => setShowErrorPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showErrorPopup]);

  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        namaProduk: product.nama || '',
        kategori: product.kategori || '',
        premi: product.premi?.replace(/[^0-9]/g, '') || '',
        maksKlaim: product.maks?.replace(/[^0-9]/g, '') || '',
        masaTunggu: product.masaTunggu || '',
        deskripsi: product.deskripsi || '',
      });
      if (product.status) {
        const statusMap = { Aktif: 'aktif', Draft: 'draft', Nonaktif: 'nonaktif' };
        setStatus(statusMap[product.status] || 'aktif');
      }
    }
  }, [mode, product]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const errors = [];
    if (!formData.namaProduk.trim()) errors.push('Nama Produk harus diisi');
    if (!formData.kategori) errors.push('Kategori harus dipilih');
    if (!formData.premi || parseInt(formData.premi) <= 0) errors.push('Premi / Bulan harus diisi dengan angka > 0');
    if (!formData.maksKlaim || parseInt(formData.maksKlaim) <= 0) errors.push('Maks. Klaim harus diisi dengan angka > 0');
    if (!formData.masaTunggu || parseInt(formData.masaTunggu) <= 0) errors.push('Masa Tunggu (Hari) harus diisi dengan angka > 0');
    if (!formData.deskripsi.trim()) errors.push('Deskripsi harus diisi');
    return errors;
  };

  const handleSubmit = (type) => {
    const errors = validateForm();
    if (errors.length > 0) {
      setErrorMessages(errors);
      setShowErrorPopup(true);
      return;
    }

    const newProduct = {
      id: mode === 'edit' ? product.id : Date.now(),
      nama: formData.namaProduk,
      kategori: formData.kategori,
      premi: `Rp ${parseInt(formData.premi || 0).toLocaleString('id-ID')}`,
      maks: `Rp ${parseInt(formData.maksKlaim || 0).toLocaleString('id-ID')}`,
      status: status === 'aktif' ? 'Aktif' : status === 'draft' ? 'Draft' : 'Nonaktif',
      masaTunggu: formData.masaTunggu,
      deskripsi: formData.deskripsi,
      pdfFile: pdfFile ? pdfFile.name : null,
    };

    const stored = localStorage.getItem('adminProduk');
    let products = stored ? JSON.parse(stored) : [];

    if (mode === 'edit') {
      products = products.map(p => p.id === newProduct.id ? newProduct : p);
    } else {
      products.push(newProduct);
    }
    localStorage.setItem('adminProduk', JSON.stringify(products));
    alert(`Produk berhasil ${type === 'publish' ? 'dipublikasikan' : 'disimpan sebagai draft'}`);
    navigate('/admin-produk');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardEdit size={20} className="text-sky-950" />
            <h2 className="text-lg font-bold text-sky-950">Informasi Dasar Produk</h2>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Produk</label>
            <input type="text" name="namaProduk" value={formData.namaProduk} onChange={handleChange}
              placeholder="Contoh: Sehat Plus Individu"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
            <select name="kategori" value={formData.kategori} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50">
              <option value="">Pilih</option>
              <option>Kesehatan</option>
              <option>Properti</option>
              <option>Kendaraan</option>
              <option>Pendidikan</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Premi / Bulan</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-900 text-sm font-semibold">Rp</span>
                <input type="number" name="premi" value={formData.premi} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Maks. Klaim</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-900 text-sm font-semibold">Rp</span>
                <input type="number" name="maksKlaim" value={formData.maksKlaim} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Masa Tunggu (Hari)</label>
            <div className="relative">
              <input type="number" name="masaTunggu" value={formData.masaTunggu} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Hari</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi</label>
            <textarea name="deskripsi" rows="4" value={formData.deskripsi} onChange={handleChange}
              placeholder="Jelaskan cakupan dan keunggulan utama produk......"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50" />
          </div>
        </div>

        {/* Upload + Status */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Upload S&K (PDF)</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-sky-400 transition cursor-pointer"
              onClick={() => document.getElementById('pdf-upload').click()}>
              <CloudUpload className="w-12 h-12 mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-sky-900 font-medium">Tarik dan lepas file disini</p>
              <p className="text-xs text-gray-400 mt-1">atau klik untuk menelusuri file (Maks. 10MB)</p>
              <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files[0])} />
            </div>
            {pdfFile && <p className="text-xs text-green-600 mt-2">✓ {pdfFile.name}</p>}
            <button onClick={() => document.getElementById('pdf-upload').click()}
              className="mt-3 w-full border border-gray-300 text-sky-900 text-sm font-semibold py-2 rounded-lg hover:bg-gray-50">
              Pilih File PDF
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Status Produk</h3>
            <div className="space-y-2">
              {[
                { id: 'aktif', label: 'Aktif', sub: 'Dapat dilihat dan dibeli oleh nasabah', color: 'border-green-400 bg-green-50', dot: 'bg-green-500' },
                { id: 'draft', label: 'Draft', sub: 'Belum dipublikasikan', color: 'border-yellow-400 bg-yellow-50', dot: 'bg-yellow-500' },
                { id: 'nonaktif', label: 'Nonaktif', sub: 'Disembunyikan dari nasabah', color: 'border-red-300 bg-red-50', dot: 'bg-red-400' },
              ].map((s) => (
                <div key={s.id} onClick={() => setStatus(s.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${status === s.id ? s.color : 'border-gray-100 bg-gray-50'}`}>
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${s.dot}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                    <p className="text-xs text-gray-500">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-5 w-fit">
          <div className="text-xs text-gray-500 font-semibold flex items-center gap-1 mb-3">
            <Info size={14} className="text-gray-500" />
            Perubahan belum disimpan
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={() => handleSubmit('publish')} className="flex items-center gap-2 bg-[#1B3A5C] hover:bg-sky-800 text-white font-semibold px-8 py-2.5 rounded-lg text-sm transition">
              Simpan & Publikasikan
            </button>
            <button onClick={() => handleSubmit('draft')} className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-8 py-2.5 rounded-lg text-sm transition">
              Simpan Draft
            </button>
            <button onClick={() => navigate('/admin-produk')} className="bg-red-600 hover:bg-red-600 text-white font-semibold px-8 py-2.5 rounded-lg text-sm transition">
              Batal
            </button>
          </div>
        </div>
      </div>

      {/* Popup Error */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                <span className="text-red-600 text-xl font-bold">!</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Data Tidak Valid</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3 text-center">
              Terdapat data yang belum diisi atau tidak valid. Silahkan periksa kembali!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}