import { Routes, Route } from 'react-router-dom';  
import ProtectedRoute from './components/ProtectedRoute';

// USER
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardNasabah from './pages/DashboardNasabah';
import Profil from './pages/Profil';
import ProdukAsuransi from './pages/ProdukAsuransi';
import PolisSaya from './pages/PolisSaya';
import AjukanKlaim from './pages/AjukanKlaim';
import StatusKlaim from './pages/StatusKlaim';
import Notifikasi from './pages/Notifikasi';
import PembayaranPolis from './pages/PembayaranPolis';
import BayarPremi from './pages/BayarPremi';
import PembayaranPremi from './pages/PembayaranPremi';
import LaporanKeuangan from './pages/LaporanKeuangan';
import RincianTransaksiLapKeu from './pages/RincianTransaksiLapKeu';
import UbahNoTelepon from './pages/UbahNoTelepon';
import UbahPassword from './pages/UbahPassword';
import RiwayatTransaksi from './pages/RiwayatTransaksi';
import NasabahLayout from './pages/NasabahLayout';
import Tunggakan from './pages/Tunggakan';

// Admin
import AdminLayout from './pagesadmin/AdminLayout';
import AdminDashboard from './pagesadmin/AdminDashboard';
import AdminProduk from './pagesadmin/AdminProduk';
import AdminTambahProduk from './pagesadmin/AdminTambahProduk';
import AdminReviewKlaim from './pagesadmin/AdminReviewKlaim';
import AdminPengguna from './pagesadmin/AdminPengguna';
import AdminVerifikasiDokumen from './pagesadmin/AdminVerifikasiDokumen';

function App() {
    return (
        // ← HAPUS <BrowserRouter> dari sini!
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes untuk Nasabah (hanya user) */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                <Route element={<NasabahLayout />}>
                    <Route path="/dashboard" element={<DashboardNasabah />} />
                    <Route path="/profil" element={<Profil />} />
                    <Route path="/produk" element={<ProdukAsuransi />} />
                    <Route path="/polis-saya" element={<PolisSaya />} />
                    <Route path="/ajukan-klaim" element={<AjukanKlaim />} />
                    <Route path="/notifikasi" element={<Notifikasi />} />
                    <Route path="/pembayaran-polis" element={<PembayaranPolis />} />
                    <Route path="/bayar-premi" element={<BayarPremi />} />
                    <Route path="/pembayaran-premi" element={<PembayaranPremi />} />
                    <Route path="/laporan-keuangan" element={<LaporanKeuangan />} />
                    <Route path="/rinciantransaksilapkeu/:id" element={<RincianTransaksiLapKeu />} />
                    <Route path="/status-klaim" element={<StatusKlaim />} />
                    <Route path="/ubah-telepon" element={<UbahNoTelepon />} />
                    <Route path="/ubah-password" element={<UbahPassword />} />
                    <Route path="/riwayat-transaksi" element={<RiwayatTransaksi />} />
                    <Route path="/tunggakan" element={<Tunggakan />} />
                </Route>
            </Route>

            {/* Protected routes untuk Admin (hanya admin) */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/admin-produk" element={<AdminProduk />} />
                    <Route path="/admin-tambah-produk" element={<AdminTambahProduk />} />
                    <Route path="/admin-review-klaim" element={<AdminReviewKlaim />} />
                    <Route path="/admin-pengguna" element={<AdminPengguna />} />
                    <Route path="/admin-verifikasi-dokumen" element={<AdminVerifikasiDokumen />} />
                </Route>
            </Route>
        </Routes>
        // ← HAPUS </BrowserRouter> dari sini!
    );
}

export default App;