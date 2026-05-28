import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaHome, FaCar, FaGraduationCap } from 'react-icons/fa';
import { api } from '../lib/api'; 

export default function ProdukAsuransi() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('Kesehatan');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    nilaiPertanggungan: '',
    namaPenerima: '',
    nikPenerima: '',
  });
  
  // State baru untuk menampung pesan kesalahan validasi input modal
  const [errors, setErrors] = useState({});
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  
  const [products, setProducts] = useState({});
  const [pertanggunganOptions, setPertanggunganOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { name: 'Kesehatan', icon: <FaHeartbeat />, iconColor: 'text-red-500' },
    { name: 'Properti', icon: <FaHome />, iconColor: 'text-blue-300' },
    { name: 'Kendaraan', icon: <FaCar />, iconColor: 'text-amber-300' },
    { name: 'Pendidikan', icon: <FaGraduationCap />, iconColor: 'text-zinc-600' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api('/produk', 'GET', null, token);
        
        const produkData = Array.isArray(response) ? response : (response.data || []);
        
        const grouped = {};
        if (Array.isArray(produkData)) {
            produkData.forEach(prod => {
              const katRaw = prod.kategori || prod.Kategori_Produk || 'Kesehatan';
              
              let kat = 'Kesehatan';
              if (katRaw.toLowerCase() === 'properti') kat = 'Properti';
              if (katRaw.toLowerCase() === 'kendaraan') kat = 'Kendaraan';
              if (katRaw.toLowerCase() === 'pendidikan' || katRaw.toLowerCase() === 'jiwa') kat = 'Pendidikan';

              const statusRaw = (prod.status || prod.Status_Produk || 'aktif').toLowerCase();
              
              if (statusRaw === 'aktif' || statusRaw === 'published') {
                if (!grouped[kat]) grouped[kat] = [];
                grouped[kat].push({
                  id: prod.id || prod.ID_Produk,
                  name: prod.name || prod.nama || prod.Nama_Produk || 'Produk Asuransi',
                  price: parseInt(prod.price || prod.premi || prod.Harga_Premi || 0),
                  description: prod.description || prod.deskripsi || prod.Deskripsi_Produk || 'Melindungi masa depan Anda',
                  badge: prod.badge || null
                });
              }
            });
        }
        setProducts(grouped);

        try {
            const optionsRes = await api('/pertanggungan-options', 'GET', null, token);
            const optionsData = optionsRes.data || optionsRes || {};
            setPertanggunganOptions(optionsData);
        } catch (optionsErr) {
            console.warn('Gagal mengambil pertanggungan options, menggunakan fallback.');
            setPertanggunganOptions({});
        }

      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Gagal mengambil data produk dari server');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const currentProducts = products[activeCategory] || [];

  const handlePilihClick = (product) => {
    setSelectedProduct(product);
    setFormData({ nilaiPertanggungan: '', namaPenerima: '', nikPenerima: '' });
    setErrors({}); // Bersihkan log eror lama
    setErrorPopup({ show: false, message: '' });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Hapus eror pada field terkait jika user mulai mengetik ulang
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const hitungPremi = () => {
    if (!selectedProduct) return 0;
    const basePremi = selectedProduct.price || 0; 
    const selectedValue = formData.nilaiPertanggungan;
    if (!selectedValue) return basePremi;
    
    const extra = (parseFloat(selectedValue) / 100000000) * 50000;
    return Math.round(basePremi + extra);
  };

  const handleBeliPolis = () => {
    const { nilaiPertanggungan, namaPenerima, nikPenerima } = formData;
    
    // ====================================================================
    // PERBAIKAN VALIDASI: Cek kelengkapan & keabsahan panjang 16 digit NIK
    // ====================================================================
    const modalErrors = {};
    if (!nilaiPertanggungan) modalErrors.nilaiPertanggungan = 'Nilai pertanggungan wajib dipilih';
    if (!namaPenerima.trim()) modalErrors.namaPenerima = 'Nama lengkap penerima wajib diisi';
    
    const cleanNik = nikPenerima.replace(/\s/g, '');
    if (!cleanNik) {
      modalErrors.nikPenerima = 'NIK Penerima wajib diisi';
    } else if (cleanNik.length !== 16) {
      modalErrors.nikPenerima = `NIK harus tepat 16 digit (Saat ini: ${cleanNik.length} digit)`;
    }

    // Jika ada input tidak valid, cegah pindah halaman & nyalakan border merah
    if (Object.keys(modalErrors).length > 0) {
      setErrors(modalErrors);
      setErrorPopup({ show: true, message: 'Terdapat data yang belum diisi atau tidak valid. Silahkan periksa kembali!' });
      setTimeout(() => setErrorPopup({ show: false, message: '' }), 3000);
      return;
    }
    
    const kategoriMap = {
      Kesehatan: 'Asuransi Kesehatan',
      Properti: 'Asuransi Properti',
      Kendaraan: 'Asuransi Kendaraan',
      Pendidikan: 'Asuransi Pendidikan',
    };
    const jenisPolis = kategoriMap[activeCategory] || selectedProduct.name;
    const newPolis = {
      id: Date.now(),
      jenis: jenisPolis,
      noPolis: `POL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      premi: hitungPremi(),
      premiFormatted: `Rp ${hitungPremi().toLocaleString('id-ID')}`,
      periode: '/ bulan',
    };
    const existing = JSON.parse(localStorage.getItem('userPolis') || '[]');
    existing.push(newPolis);
    localStorage.setItem('userPolis', JSON.stringify(existing));

    const transactionId = `NMIID-ID${Date.now()}${Math.floor(Math.random() * 1000)}`;
    navigate('/pembayaran-polis', {
      state: {
        total: hitungPremi(),
        productName: selectedProduct.name,
        transactionId: transactionId,
        namaPenerima: namaPenerima,
        nikPenerima: cleanNik
      }
    });

    setShowModal(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6 text-center">Memuat data produk...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-6 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Beli Produk Baru</h1>

      {/* Kategori grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <button key={cat.name} onClick={() => setActiveCategory(cat.name)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${activeCategory === cat.name ? 'border-sky-950 bg-sky-100 shadow-md' : 'border-gray-200 bg-white hover:shadow-md'}`}>
            <div className={`text-2xl ${cat.iconColor}`}>{cat.icon}</div>
            <span className={`font-medium ${activeCategory === cat.name ? 'text-sky-950' : 'text-gray-600'}`}>Asuransi {cat.name}</span>
          </button>
        ))}
      </div>

      {/* Daftar produk */}
      <div className="mt-6 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Daftar Produk - {activeCategory}</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{currentProducts.length} produk</span>
        </div>
        
        {currentProducts.length === 0 ? (
           <p className="text-center text-gray-500 py-8">Belum ada produk di kategori ini.</p>
        ) : (
          currentProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              {product.badge && <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 inline-block rounded-br-lg">{product.badge}</div>}
              <div className="p-5">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                    <div className="mt-1">
                      <span className="text-2xl font-extrabold text-sky-950">
                        Rp {(product.price || 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-gray-500 text-sm"> / bulan</span>
                    </div>
                  </div>
                  <button onClick={() => handlePilihClick(product)} className="bg-sky-100 hover:bg-gray-300 text-sky-950 font-semibold px-5 py-2 rounded-lg transition flex items-center gap-1">
                    Pilih
                  </button>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-gray-600 text-sm flex items-center gap-2">
                    <span className="text-green-500">✓</span> {product.description}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal beli polis */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-sky-950">Pastikan data yang Anda masukkan benar. Polis akan aktif setelah pembayaran pertama dikonfirmasi.</div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Polis</label>
                <input type="text" value={selectedProduct.name} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 font-medium" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Pertanggungan (Rp)</label>
                <select name="nilaiPertanggungan" value={formData.nilaiPertanggungan} onChange={handleFormChange} 
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${errors.nilaiPertanggungan ? 'border-red-500 bg-red-50/30 focus:ring-red-200' : 'border-gray-300 focus:ring-sky-500'}`}>
                  <option value="">Pilih nilai pertanggungan</option>
                  {pertanggunganOptions[selectedProduct.name] 
                      ? pertanggunganOptions[selectedProduct.name].map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)
                      : <>
                          <option value="50000000">Rp 50.000.000</option>
                          <option value="100000000">Rp 100.000.000</option>
                          <option value="250000000">Rp 250.000.000</option>
                        </>
                  }
                </select>
                {errors.nilaiPertanggungan && <p className="text-red-500 text-xs mt-1 font-medium">⚠️ {errors.nilaiPertanggungan}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penerima</label>
                <input type="text" name="namaPenerima" value={formData.namaPenerima} onChange={handleFormChange} placeholder="Nama lengkap sesuai KTP" 
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${errors.namaPenerima ? 'border-red-500 bg-red-50/30 focus:ring-red-200' : 'border-gray-300 focus:ring-sky-500'}`} />
                {errors.namaPenerima && <p className="text-red-500 text-xs mt-1 font-medium">⚠️ {errors.namaPenerima}</p>}
              </div>
              
              {/* FIELD UPDATE: Border merah dinamis, pencegahan selain angka, dan pembatasan maxLength */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIK Penerima</label>
                <input 
                  type="text" 
                  name="nikPenerima" 
                  maxLength={16} // Kunci input maksimal di angka 16
                  value={formData.nikPenerima} 
                  onChange={(e) => {
                    // Paksa membuang input apabila isinya selain angka (0-9)
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData(prev => ({ ...prev, nikPenerima: value }));
                    if (errors.nikPenerima) {
                      setErrors(prev => ({ ...prev, nikPenerima: '' }));
                    }
                  }} 
                  placeholder="16 digit NIK" 
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-all ${
                    errors.nikPenerima 
                      ? 'border-red-500 bg-red-50/40 text-red-900 placeholder-red-300 focus:ring-red-200 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-sky-500 focus:border-sky-500 text-gray-800'
                  }`} 
                />
                {errors.nikPenerima && (
                  <p className="text-red-600 text-xs mt-1.5 font-semibold flex items-center gap-1">
                    ⚠️ {errors.nikPenerima}
                  </p>
                )}
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Premi Bulanan:</span>
                  <span className="text-1xl font-bold text-sky-950">Rp {hitungPremi().toLocaleString('id-ID')}</span>
                </div>
                <p className="text-xs text-gray-500">Premi dihitung berdasarkan jenis polis dan nilai pertanggungan</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
                <button onClick={handleBeliPolis} className="flex-1 bg-sky-950 hover:bg-sky-900 text-white font-semibold py-2 rounded-lg transition-colors">Beli Polis Baru</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup error */}
      {errorPopup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Data Tidak Valid</h3>
              <p className="text-gray-600 text-sm mt-2">{errorPopup.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}