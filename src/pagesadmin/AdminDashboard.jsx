import { useState, useEffect } from 'react';
import { User, ShieldCheck, ClipboardClock } from 'lucide-react';
import { FaMoneyBillWave } from 'react-icons/fa';
import api from '../lib/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        pengguna: 0,
        polisAktif: 0,
        klaimPending: 0,
        premiBulanIni: 0
    });
    const [klaimData, setKlaimData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Ambil data pengguna
            const penggunaRes = await api('/pengguna', 'GET', null, token);
            const totalPengguna = penggunaRes.data.length || 0;
            
            // Ambil data polis (semua polis)
            const polisRes = await api('/polis', 'GET', null, token);
            const polisAktif = polisRes.data.filter(p => p.Status_Polis === 'Aktif').length || 0;
            
            // Ambil data klaim pending (admin only)
            const klaimRes = await api('/admin/klaim/pending', 'GET', null, token);
            const klaimPending = klaimRes.data.length || 0;
            
            // Format data klaim untuk tabel
            const formattedKlaim = klaimRes.data.map((klaim) => ({
                no: klaim.ID_Klaim,
                nasabah: klaim.polis?.pengguna?.Nama_Lengkap || 'Unknown',
                produk: klaim.polis?.produk?.Nama_Produk || 'Unknown',
                nilai: formatRupiah(klaim.polis?.produk?.Harga_Premi || 0),
                dokumen: klaim.dokumen_status || 'Pending',
                status: klaim.Status_Klaim || 'Proses'
            }));
            
            setKlaimData(formattedKlaim);
            setStats({
                pengguna: totalPengguna,
                polisAktif: polisAktif,
                klaimPending: klaimPending,
                premiBulanIni: 68000000 // contoh, nanti dari API transaksi
            });
            
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Data contoh jika gagal fetch
            setKlaimData([
                { no: 'KLM001', nasabah: 'Budi Santoso', produk: 'Kesehatan', nilai: 'Rp 500.000', dokumen: 'Valid', status: 'Proses' },
                { no: 'KLM002', nasabah: 'Siti Aminah', produk: 'Jiwa', nilai: 'Rp 1.000.000', dokumen: 'Pending', status: 'Proses' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (nominal) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(nominal);
    };

    // Data statistik untuk ditampilkan
    const statsData = [
        { label: 'Pengguna', value: stats.pengguna.toLocaleString(), icon: <User size={28} />, bg: 'bg-white', iconBg: 'bg-blue-100', iconColor: 'text-sky-900' },
        { label: 'Polis Aktif', value: stats.polisAktif.toLocaleString(), icon: <ShieldCheck size={28} />, bg: 'bg-white', iconBg: 'bg-green-100', iconColor: 'text-sky-900' },
        { label: 'Klaim Pending', value: stats.klaimPending.toString(), icon: <ClipboardClock size={28} />, bg: 'bg-white', iconBg: 'bg-yellow-100', iconColor: 'text-orange-600' },
        { label: 'Premi Bulan Ini', value: formatRupiah(stats.premiBulanIni), icon: <FaMoneyBillWave size={28} />, bg: 'bg-white', iconBg: 'bg-purple-100', iconColor: 'text-green-600' },
    ];

    // Fungsi untuk menentukan warna status
    const getStatusColor = (status) => {
        if (status === 'Disetujui' || status === 'diterima') return 'text-green-600 bg-green-50';
        if (status === 'Ditolak' || status === 'ditolak') return 'text-red-600 bg-red-50';
        return 'text-yellow-600 bg-yellow-50';
    };

    const dokumenStyle = {
        Valid: 'bg-blue-100 text-gray-500',
        'Tidak Valid': 'bg-orange-100 text-orange-800',
        Pending: 'bg-yellow-100 text-yellow-800'
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Kartu Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((stat, idx) => (
                    <div key={idx} className={`${stat.bg} rounded-xl p-4 flex items-center gap-4 shadow-sm`}>
                        <div className={`p-3 rounded-full ${stat.iconBg}`}>
                            <div className={stat.iconColor}>{stat.icon}</div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                            <p className="text-2xl font-extrabold mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabel Klaim */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Klaim Pending</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-300">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">NO. KLAIM</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">NASABAH</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">PRODUK</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">NILAI</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">DOKUMEN</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {klaimData.length > 0 ? (
                                klaimData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-sky-900">{item.no}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{item.nasabah}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{item.produk}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{item.nilai}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`px-3 py-1 rounded-sm text-xs font-semibold ${dokumenStyle[item.dokumen] || 'bg-gray-100 text-gray-600'}`}>
                                                {item.dokumen}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Belum ada klaim pending.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}