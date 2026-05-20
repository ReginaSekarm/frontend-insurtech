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

            const [penggunaRes, klaimRes] = await Promise.all([
                api('/pengguna', 'GET', null, token),
                api('/klaim', 'GET', null, token),
            ]);

            const totalPengguna = penggunaRes.data?.length || 0;
            const semuaKlaim = klaimRes.data?.data || [];
            const klaimPending = semuaKlaim.filter(k => k.Status_Klaim === 'Proses').length;

            const formattedKlaim = semuaKlaim
                .filter(k => k.Status_Klaim === 'Proses')
                .map((klaim) => ({
                    no: klaim.ID_Klaim,
                    nasabah: klaim.ID_Polis,
                    produk: klaim.Jenis_Klaim,
                    nilai: '-',
                    status: klaim.Status_Klaim
                }));

            setKlaimData(formattedKlaim);
            setStats({
                pengguna: totalPengguna,
                polisAktif: 0,
                klaimPending: klaimPending,
                premiBulanIni: 0
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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
        if (status === 'Selesai') return 'text-green-600 bg-green-50';
        if (status === 'Ditolak') return 'text-red-600 bg-red-50';
        return 'text-yellow-600 bg-yellow-50';
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
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

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Klaim Pending</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-300">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase">NO. KLAIM</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase">POLIS</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase">JENIS KLAIM</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {klaimData.length > 0 ? (
                                klaimData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm font-medium text-sky-900">{item.no}</td>
                                        <td className="px-6 py-4 text-sm text-black">{item.nasabah}</td>
                                        <td className="px-6 py-4 text-sm text-black">{item.produk}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
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