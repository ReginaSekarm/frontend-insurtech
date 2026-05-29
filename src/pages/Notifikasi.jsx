import { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaAngleLeft } from 'react-icons/fa';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifikasi() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({ hariIni: [], kemarin: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // PERBAIKAN UTAMA: Hubungkan ke alamat url absolut server Laravel Anda
        const response = await fetch('http://127.0.0.1:8000/api/nasabah/notifikasi', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Gagal mengambil data notifikasi dari server');
        const data = await response.json();
        
        // Amankan jika sewaktu-waktu objek dibungkus data wrapper kembali
        const resData = data.data || data;
        setNotifications({
          hariIni: resData.hariIni || [],
          kemarin: resData.kemarin || []
        });
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getIconByType = (type) => {
    switch (type) {
      case 'warning': return <FaClock className="text-yellow-500 text-2xl" />;
      case 'success': return <FaCheckCircle className="text-green-500 text-2xl" />;
      case 'error': return <FaTimesCircle className="text-red-500 text-2xl" />;
      case 'info': return <AlertTriangle className="text-blue-500 text-2xl" />;
      default: return <FaInfoCircle className="text-gray-500 text-2xl" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        <div className="flex items-center gap-3 border-b pb-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <FaAngleLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Notifikasi</h1>
        </div>
        <div className="text-center py-10 font-medium text-gray-500">Memuat notifikasi Anda...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        <div className="flex items-center gap-3 border-b pb-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <FaAngleLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Notifikasi</h1>
        </div>
        <div className="text-center py-10 text-red-600 font-semibold">Error: {error}</div>
      </div>
    );
  }

  const totalNotif = (notifications.hariIni?.length || 0) + (notifications.kemarin?.length || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-3 border-b pb-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 transition p-1">
          <FaAngleLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Notifikasi</h1>
      </div>

      {totalNotif === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 font-medium">Tidak ada notifikasi terbaru.</p>
        </div>
      )}

      {/* HARI INI */}
      {notifications.hariIni?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">HARI INI</h2>
          </div>
          <div className="space-y-3">
            {notifications.hariIni.map((notif) => (
              <div
                key={notif.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4 items-start hover:border-gray-200 transition"
              >
                <div className="mt-1">{getIconByType(notif.type)}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{notif.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-2 font-medium">{notif.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KEMARIN */}
      {notifications.kemarin?.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">KEMARIN</h2>
          </div>
          <div className="space-y-3">
            {notifications.kemarin.map((notif) => (
              <div
                key={notif.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4 items-start hover:border-gray-200 transition"
              >
                <div className="mt-1">{getIconByType(notif.type)}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{notif.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-2 font-medium">{notif.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}