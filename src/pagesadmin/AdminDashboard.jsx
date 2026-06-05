import { useState, useEffect } from 'react';
import { User, ShieldCheck, ClipboardClock } from 'lucide-react';
import { FaMoneyBillWave } from 'react-icons/fa';
import { api } from '../lib/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        pengguna: 0, polisAktif: 0, klaimPending: 0, premiBulanIni: 0
    });
    const [klaimData, setKlaimData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');

            // PERUBAHAN: Gunakan endpoint /klaim (bukan /admin/klaim) karena yang tersedia di backend
            const [statsRes, klaimRes] = await Promise.all([
                api('/admin/dashboard/stats', 'GET', null, token).catch(() => null),
                api('/klaim', 'GET', null, token).catch(() => null),  // <-- UBAH KE /klaim
            ]);

            // 1. SETTING STATS (Angka bagian atas)
            const responseData = statsRes?.data || statsRes || {};
            const serverStats = responseData.data || responseData; 

            setStats({
                pengguna: serverStats.pengguna || 0, 
                polisAktif: serverStats.polisAktif || 0,   
                klaimPending: serverStats.klaimPending || 0,
                premiBulanIni: serverStats.premiBulanIni || 0
            });

            // 2. SETTING TABEL SEMUA KLAIM
            let arrKlaim = [];
            
            if (Array.isArray(klaimRes)) {
                arrKlaim = klaimRes;
            } else if (klaimRes?.data && Array.isArray(klaimRes.data)) {
                arrKlaim = klaimRes.data;
            } else if (klaimRes?.data?.data && Array.isArray(klaimRes.data.data)) {
                arrKlaim = klaimRes.data.data;
            }
            
            console.log('Semua data klaim:', arrKlaim);
            
            const formattedKlaim = arrKlaim.map((klaim) => {
    const rawStatus = klaim.Status_Klaim || klaim.status || 'Pending';
    const isDitolak = rawStatus.toLowerCase() === 'ditolak';
    const isSelesai = rawStatus.toLowerCase() === 'selesai' || rawStatus.toLowerCase() === 'disetujui';
    const isPending = rawStatus.toLowerCase() === 'proses' || rawStatus.toLowerCase() === 'pending';

    let displayStatus = 'Pending';
    if (isSelesai) displayStatus = 'Disetujui';
    if (isDitolak) displayStatus = 'Ditolak';
    if (isPending) displayStatus = 'Pending';

    let nilaiKlaim = klaim.Jumlah_Klaim || klaim.jumlah_klaim || klaim.nilai || 0;

    let statusDokumen = 'Tidak Ada';
    if (klaim.Dokumen) {
        try {
            const parsed = typeof klaim.Dokumen === 'string' ? JSON.parse(klaim.Dokumen) : klaim.Dokumen;
            if (Array.isArray(parsed) && parsed.length > 0) statusDokumen = 'Valid';
        } catch(e) {
            if (klaim.Dokumen && klaim.Dokumen.length > 0) statusDokumen = 'Valid';
        }
    } else if (klaim.dokumen_list && klaim.dokumen_list.length > 0) {
        statusDokumen = 'Valid';
    }

    if (displayStatus === 'Ditolak') statusDokumen = 'Tidak Valid';

    return {
        no:      klaim.ID_Klaim || klaim.id || '-',
        nasabah: klaim.nasabah_nama || klaim.polis?.pengguna?.Nama_Lengkap || 'Nasabah',
        produk:  klaim.produk_nama || klaim.polis?.produk?.Nama_Produk || klaim.Jenis_Klaim || 'Produk Asuransi',
        nilai:   `Rp ${Number(nilaiKlaim).toLocaleString('id-ID')}`,
        dokumen: statusDokumen,
        status:  displayStatus
    };
});

            const pendingCount = formattedKlaim.filter(item => item.status === 'Pending').length;
            setStats(prev => ({
                ...prev,
                klaimPending: pendingCount
            }));

            setKlaimData(formattedKlaim);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setStats({ pengguna: 0, polisAktif: 0, klaimPending: 0, premiBulanIni: 0 });
            setKlaimData([]);
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (nominal) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(nominal);

    const statsData = [
        { label: 'Pengguna', value: stats.pengguna.toLocaleString(), icon: <User size={28} />, iconBg: 'bg-blue-100', iconColor: 'text-sky-900' },
        { label: 'Polis Aktif', value: stats.polisAktif.toLocaleString(), icon: <ShieldCheck size={28} />, iconBg: 'bg-green-100', iconColor: 'text-sky-900' },
        { label: 'Klaim Pending', value: stats.klaimPending.toString(), icon: <ClipboardClock size={28} />, iconBg: 'bg-yellow-100', iconColor: 'text-orange-600' },
        { label: 'Premi Bulan Ini', value: formatRupiah(stats.premiBulanIni), icon: <FaMoneyBillWave size={28} />, iconBg: 'bg-purple-100', iconColor: 'text-green-600' },
    ];

    const getStatusColor = (status) => {
        if (status === 'Disetujui' || status === 'Selesai') return 'bg-green-100 text-green-700';
        if (status === 'Ditolak') return 'bg-red-100 text-red-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    const getDokumenColor = (dokumen) => {
        if (dokumen === 'Valid') return 'bg-green-100 text-green-600';
        if (dokumen === 'Tidak Valid') return 'bg-red-100 text-red-600';
        return 'bg-gray-100 text-gray-500';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat data dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
                        <div className={`p-3 rounded-full ${stat.iconBg}`}>
                            <div className={stat.iconColor}>{stat.icon}</div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-extrabold mt-1 text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="font-semibold text-gray-800">Daftar Semua Klaim</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#EBEBEB]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wide">NO. KLAIM</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wide">NASABAH</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wide">PRODUK</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wide">NILAI</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-black uppercase tracking-wide">DOKUMEN</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-black uppercase tracking-wide">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {klaimData.length > 0 ? (
                                klaimData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm font-bold text-sky-800">{item.no}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{item.nasabah}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{item.produk}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.nilai}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getDokumenColor(item.dokumen)}`}>
                                                {item.dokumen}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <ClipboardClock size={48} className="text-gray-300" />
                                            <p>Belum ada klaim yang diajukan.</p>
                                        </div>
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