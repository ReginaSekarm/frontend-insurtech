import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaHome, FaCar, FaGraduationCap, FaTrash } from 'react-icons/fa';

const statusColor = {
  Aktif: 'bg-green-100 text-green-700',
  Draft: 'bg-yellow-100 text-yellow-700',
  Nonaktif: 'bg-red-100 text-red-700',
};


const initialProducts = [
  { id: 1, nama: 'Sehat Plus Individu', kategori: 'Kesehatan', premi: 'Rp 200.000', maks: 'Rp 50jt', status: 'Aktif' },
  { id: 2, nama: 'Sehat Plus Keluarga', kategori: 'Kesehatan', premi: 'Rp 350.000', maks: 'Rp 100jt', status: 'Aktif' },
  { id: 3, nama: 'Rumahku Terlindung', kategori: 'Properti', premi: 'Rp 150.000', maks: 'Rp 200jt', status: 'Aktif' },
  { id: 4, nama: 'Dana Cerdas Anak', kategori: 'Pendidikan', premi: 'Rp 250.000', maks: 'Rp 150jt', status: 'Aktif' },
  { id: 5, nama: 'Kendaraan Aman', kategori: 'Kendaraan', premi: 'Rp 180.000', maks: 'Rp 80jt', status: 'Draft' },
];

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
  const itemsPerPage = 5;

  // Load produk dari localStorage
  useEffect(() => {
    const stored = localStorage.getItem('adminProduk');
    if (stored) {
      const parsed = JSON.parse(stored);
      const withIcons = parsed.map(p => ({
        ...p,
        icon: getIconByKategori(p.kategori)
      }));
      setProducts(withIcons);
    } else {
      const withIcons = initialProducts.map(p => ({
        ...p,
        icon: getIconByKategori(p.kategori)
      }));
      setProducts(withIcons);
      localStorage.setItem('adminProduk', JSON.stringify(initialProducts));
    }
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

  // Hapus produk
  const handleDelete = (id, nama) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${nama}"?`)) {
      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
      // Update localStorage 
      const productsToStore = updatedProducts.map(({ icon, ...rest }) => rest);
      localStorage.setItem('adminProduk', JSON.stringify(productsToStore));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Produk Asuransi</h2>
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
          { label: 'Produk Aktif', value: products.filter(p => p.status === 'Aktif').length, sub: `${Math.round((products.filter(p => p.status === 'Aktif').length / products.length) * 100)}% dari total`, color: 'text-green-600' },
          { label: 'Draft', value: products.filter(p => p.status === 'Draft').length, sub: 'Menunggu publikasi', color: 'text-yellow-400' },
          { label: 'Review Klaim', value: '5', sub: 'Perlu ditinjau!', color: 'text-red-500' },
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
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-200 cursor-pointer border-none">
            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <p className="text-xs text-gray-500">Menampilkan {currentProducts.length} dari {sortedProducts.length} Produk</p>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-200 text-left">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nama Produk</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Premi/Bln</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Maks. Klaim</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {currentProducts.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4"><div className="flex items-center gap-2">{item.icon}<span className="font-medium text-gray-800">{item.nama}</span></div></td>
                  <td className="px-6 py-4 text-gray-600">{item.kategori}</td>
                  <td className="px-6 py-4 text-gray-800">{item.premi}</td>
                  <td className="px-6 py-4 text-gray-800">{item.maks}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[item.status]}`}>{item.status}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className={`${item.status === 'Draft' ? 'bg-white border border-gray-300 text-gray-700 hover:bg-sky-800' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'} text-xs font-semibold px-3 py-1.5 rounded-lg transition`}>
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
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-500">Halaman {currentPage} dari {totalPages}</p>
          <div className="flex gap-1">
            <button onClick={goToPrev} disabled={currentPage === 1} className="w-7 h-7 border border-gray-300 rounded text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">‹</button>
            <button onClick={goToNext} disabled={currentPage === totalPages} className="w-7 h-7 border border-gray-300 rounded text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}