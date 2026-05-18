import { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaArrowLeft, FaUpload, FaMoneyBillWave } from 'react-icons/fa';
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
        const response = await fetch('/api/notifikasi', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Gagal mengambil notifikasi');
        const data = await response.json();
        setNotifications(data);
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
      case 'info': return <AlertTriangle className="text-yellow-500 text-2xl" />;
      default: return <FaInfoCircle className="text-gray-500 text-2xl" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        <div className="flex items-center gap-3 border-b pb-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Notifikasi</h1>
        </div>
        <div className="text-center py-10">Memuat notifikasi...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        <div className="flex items-center gap-3 border-b pb-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Notifikasi</h1>
        </div>
        <div className="text-center py-10 text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-3 border-b pb-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Notifikasi</h1>
      </div>

      {/* HARI INI */}
      {notifications.hariIni?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-gray-700">HARI INI</h2>
          </div>
          <div className="space-y-3">
            {notifications.hariIni.map((notif) => (
              <div
                key={notif.id}
                className="bg-white rounded-xl shadow-sm p-4 flex gap-4 items-start"
              >
                <div className="mt-1">{getIconByType(notif.type)}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{notif.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{notif.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KEMARIN */}
      {notifications.kemarin?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-gray-700">KEMARIN</h2>
          </div>
          <div className="space-y-3">
            {notifications.kemarin.map((notif) => (
              <div
                key={notif.id}
                className="bg-white rounded-xl shadow-sm p-4 flex gap-4 items-start"
              >
                <div className="mt-1">{getIconByType(notif.type)}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{notif.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{notif.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}