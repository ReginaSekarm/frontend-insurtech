import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaHome, FaCar, FaGraduationCap, FaTrash } from 'react-icons/fa';
import { api } from '../lib/api'; 

const statusColor = {
  Aktif: 'bg-green-100 text-green-700',
  Draft: 'bg-yellow-100 text-yellow-700',
  Nonaktif: 'bg-red-100 text-red-700',
};

const getIconByKategori = (kategori) => {
  if (kategori === 'Kesehatan') return <FaHeartbeat className="text-2xl text-red-500" />;
  if (kategori === 'Properti') return <FaHome className="text-2xl text-blue-300" />;
  if (kategori === 'Pendidikan') return <FaGraduationCap className="text-2xl text-zinc-600" />;
  if (kategori === 'Kendaraan') return <FaCar className="text-2xl text-amber-300" />;
  return null;
};

export default function AdminProduk() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState('terlama');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  // Ambil data produk dari API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api('/produk', 'GET', null, token);
        const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        
        // JALAN AMAN: Normalisasi semua teks dari database ke format standar frontend
        const withIcons = data.map(p => {
          const rawStatus = (p.status || p.Status_Produk || 'draft').toLowerCase();
          
          let normalizedStatus = 'Draft';
          if (rawStatus === 'published' || rawStatus === 'aktif') normalizedStatus = 'Aktif';
          if (rawStatus === 'archived' || rawStatus === 'nonaktif') normalizedStatus = 'Nonaktif';

          const rawPremi = p.Harga_Premi || p.premi || 0;
          const formattedPremi = typeof rawPremi === 'number' 
            ? `Rp ${rawPremi.toLocaleString('id-ID')}` 
            : rawPremi;

          // PERBAIKAN: Ambil nilai Maksimal Klaim dengan benar
          // Coba ambil dari berbagai kemungkinan nama field
          let maksValue = '-';
          const maksKlaim = p.Maksimal_Klaim || p.maksimal_klaim || p.maks_klaim || p.maks;
          
          if (maksKlaim && maksKlaim !== null && maksKlaim !== '') {
            // Jika berupa angka, format dengan pemisah ribuan
            if (typeof maksKlaim === 'number') {
              maksValue = `Rp ${maksKlaim.toLocaleString('id-ID')}`;
            } 
            // Jika sudah berupa string dengan nilai valid
            else if (typeof maksKlaim === 'string' && maksKlaim !== '-' && maksKlaim !== '') {
              // Coba parse jika string angka
              const parsed = parseInt(maksKlaim);
              if (!isNaN(parsed)) {
                maksValue = `Rp ${parsed.toLocaleString('id-ID')}`;
              } else {
                maksValue = maksKlaim;
              }
            }
            // Jika berupa objek atau lainnya
            else if (maksKlaim && typeof maksKlaim === 'object') {
              maksValue = JSON.stringify(maksKlaim);
            }
          }

          return {
            id: p.ID_Produk || p.id,
            nama: p.Nama_Produk || p.nama || 'Produk Tanpa Nama',
            kategori: p.Kategori_Produk || p.kategori || 'Umum',
            premi: formattedPremi,
            maks: maksValue,
            status: normalizedStatus, 
            icon: getIconByKategori(p.Kategori_Produk || p.kategori)
          };
        });
        
        setProducts(withIcons);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Gagal mengambil data produk');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const sortOptions = [
    { value: 'terlama', label: 'Urutan: Terlama' },
    { value: 'terbaru', label: 'Terbaru' },
    { value: 'nama-asc', label: 'Nama A-Z' },
    { value: 'nama-desc', label: 'Nama Z-A' },
  ];

  const getSortedProducts = () => {
    let sorted = [...products];
    if (sortBy === 'terlama') return sorted;
    if (sortBy === 'terbaru') return sorted.reverse();
    if (sortBy === 'nama-asc') return sorted.sort((a, b) => a.nama.localeCompare(b.nama));
    if (sortBy === 'nama-desc') return sorted.sort((a, b) => b.nama.localeCompare(a.nama));
    return sorted;
  };

  const sortedProducts = getSortedProducts();
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const currentProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPrev = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const goToNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const handleEdit = (product) => {
    const productDataToSend = {
      id: product.id,
      nama: product.nama,
      kategori: product.kategori,
      premi: product.premi,
      maks: product.maks,
      status: product.status,
    };
    navigate('/admin-tambah-produk', { state: { mode: 'edit', product: productDataToSend } });
  };

  const handleTambah = () => {
    navigate('/admin-tambah-produk', { state: { mode: 'add' } });
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus produk "${nama}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      await api(`/admin/produk/${id}`, 'DELETE', null, token);
      setProducts(products.filter(p => p.id !== id));
      alert(`Produk "${nama}" berhasil dihapus.`);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err.message || 'Gagal menghapus produk. Silakan coba lagi.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-base font-bold text-gray-600">MANAJEMEN PRODUK</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola semua produk asuransi yang tersedia</p>
        </div>
        <button onClick={handleTambah} className="flex items-center gap-2 bg-white hover:bg-gray-200 border border-black text-black font-semibold px-4 py-2.5 rounded-xl transition">
          <span className="text-lg">+</span> Tambah Produk
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Produk', value: products.length, sub: '+1 bulan ini', color: 'text-green-600' },
          { label: 'Produk Aktif', value: products.filter(p => p.status === 'Aktif').length, sub: products.length > 0 ? `${Math.round((products.filter(p => p.status === 'Aktif').length / products.length) * 100)}% dari total` : '0%', color: 'text-green-600' },
          { label: 'Draft', value: products.filter(p => p.status === 'Draft').length, sub: 'Menunggu publikasi', color: 'text-yellow-400' },
          { label: 'Review Klaim', value: '0', sub: 'Perlu ditinjau!', color: 'text-red-500' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <div className="flex justify-between items-baseline mt-1">
              <p className="text-2xl font-extrabold text-gray-600">{value}</p>
              <p className={`text-xs font-semibold ${color}`}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-300 text-black text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-200 cursor-pointer border-none">
            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <p className="text-xs text-gray-500">Menampilkan {currentProducts.length} dari {sortedProducts.length} Produk</p>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-300 text-left">
                <th className="px-6 py-3 text-xs font-bold text-black uppercase">Nama Produk</th>
                <th className="px-6 py-3 text-xs font-bold text-black uppercase">Kategori</th>
                <th className="px-6 py-3 text-xs font-bold text-black uppercase">Premi/Bln</th>
                <th className="px-6 py-3 text-xs font-bold text-black uppercase">Maks. Klaim</th>
                <th className="px-6 py-3 text-xs font-bold text-black uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-black uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Belum ada data produk</td>
                </tr>
              ) : (
                currentProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span className="font-medium text-gray-800">{item.nama}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-800">{item.kategori}</td>
                    <td className="px-6 py-4 text-gray-800">{item.premi}</td>
                    <td className="px-6 py-4 text-gray-800">{item.maks}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[item.status] || 'bg-gray-100 text-gray-700'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(item)} className={`${item.status === 'Draft' ? 'bg-white border border-gray-300 text-gray-700 hover:bg-sky-800 hover:text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'} text-xs font-semibold px-3 py-1.5 rounded-lg transition`}>
                          {item.status === 'Draft' ? 'Publikasi' : 'Edit'}
                        </button>
                        {item.status === 'Nonaktif' && (
                          <button
                            onClick={() => handleDelete(item.id, item.nama)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Hapus produk"
                          >
                            <FaTrash size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
           </table>
        </div>
        <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-500">Halaman {currentPage} dari {totalPages || 1}</p>
          <div className="flex gap-1">
            <button onClick={goToPrev} disabled={currentPage === 1} className="w-7 h-7 border border-gray-300 rounded text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">‹</button>
            <button onClick={goToNext} disabled={currentPage === totalPages || totalPages === 0} className="w-7 h-7 border border-gray-300 rounded text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}