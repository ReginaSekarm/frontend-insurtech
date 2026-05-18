import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaHome, FaCar, FaGraduationCap } from 'react-icons/fa';

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
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  
  // State untuk data dari API
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

  // Fetch data produk dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Ambil daftar produk
        const produkRes = await fetch('/api/produk', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!produkRes.ok) throw new Error('Gagal mengambil data produk');
        const produkData = await produkRes.json();
        
        // Kelompokkan berdasarkan kategori (asumsikan setiap produk punya field 'kategori')
        const grouped = {};
        produkData.forEach(prod => {
          const kat = prod.kategori; // 'Kesehatan', 'Properti', dst
          if (!grouped[kat]) grouped[kat] = [];
          grouped[kat].push(prod);
        });
        setProducts(grouped);

        // Ambil opsi nilai pertanggungan (bisa dari endpoint terpisah)
        const optionsRes = await fetch('/api/pertanggungan-options', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (optionsRes.ok) {
          const optionsData = await optionsRes.json();
          setPertanggunganOptions(optionsData);
        } else {
          // Fallback kosong
          setPertanggunganOptions({});
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
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
    setErrorPopup({ show: false, message: '' });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const hitungPremi = () => {
    if (!selectedProduct) return 0;
    const basePremi = selectedProduct.price;
    const selectedValue = formData.nilaiPertanggungan;
    if (!selectedValue) return basePremi;
    // Asumsikan rumus sama
    const extra = (parseFloat(selectedValue) / 100000000) * 50000;
    return Math.round(basePremi + extra);
  };

  const handleBeliPolis = () => {
    const { nilaiPertanggungan, namaPenerima, nikPenerima } = formData;
    if (!nilaiPertanggungan || !namaPenerima || !nikPenerima) {
      setErrorPopup({ show: true, message: 'Terdapat data yang belum diisi atau tidak valid. Silahkan periksa kembali!' });
      setTimeout(() => setErrorPopup({ show: false, message: '' }), 3000);
      return;
    }
    
    // Simpan polis ke localStorage (atau bisa juga kirim ke API)
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
        nikPenerima: nikPenerima
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
        {currentProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            {product.badge && <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 inline-block rounded-br-lg">{product.badge}</div>}
            <div className="p-5">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                  <div className="mt-1">
                    <span className="text-2xl font-extrabold text-sky-950">{product.priceFormatted}</span>
                    <span className="text-gray-500 text-sm">{product.period}</span>
                  </div>
                </div>
                <button onClick={() => handlePilihClick(product)} className="bg-sky-100 hover:bg-gray-400 text-sky-950 font-semibold px-5 py-2 rounded-lg transition flex items-center gap-1">
                  Pilih
                </button>
              </div>
              <div className="mt-4 space-y-1">
                {product.benefits?.map((benefit, idx) => <p key={idx} className="text-gray-600 text-sm flex items-center gap-2"><span className="text-green-500">✓</span> {benefit}</p>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal beli polis (tetap sama, gunakan selectedProduct dan pertanggunganOptions dari API) */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-sky-950">Pastikan data yang Anda masukkan benar. Polis akan aktif setelah pembayaran pertama dikonfirmasi.</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Jenis Polis</label><input type="text" value={selectedProduct.name} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-600" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nilai Pertanggungan (Rp)</label><select name="nilaiPertanggungan" value={formData.nilaiPertanggungan} onChange={handleFormChange} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Pilih nilai pertanggungan</option>
                {pertanggunganOptions[selectedProduct.name]?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Penerima</label><input type="text" name="namaPenerima" value={formData.namaPenerima} onChange={handleFormChange} placeholder="Nama lengkap sesuai KTP" className="w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">NIK Penerima</label><input type="text" name="nikPenerima" value={formData.nikPenerima} onChange={handleFormChange} placeholder="16 digit NIK" className="w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
              <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Premi Bulanan:</span>
                  <span className="text-1xl font-bold text-sky-950">Rp {hitungPremi().toLocaleString('id-ID')}</span>
                </div>
                <p className="text-xs text-gray-500">Premi dihitung berdasarkan jenis polis dan nilai pertanggungan</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg">Batal</button>
                <button onClick={handleBeliPolis} className="flex-1 bg-sky-950 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg">Beli Polis Baru</button>
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