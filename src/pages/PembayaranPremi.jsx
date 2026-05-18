import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FaDownload, FaHome } from 'react-icons/fa';

export default function PembayaranPremi() {
  const location = useLocation();
  const navigate = useNavigate();
  const { transactionId: urlTransactionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const transactionId = location.state?.transactionId || urlTransactionId;

  useEffect(() => {
    const fetchPayment = async () => {
      if (!transactionId) {
        setError('ID transaksi tidak ditemukan');
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/pembayaran-premi/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Gagal mengambil data pembayaran');
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching payment:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [transactionId]);

  const handleSimpanQR = () => {
    alert('QR Code disimpan (simulasi).');
  };

  const handleKembali = () => {
    navigate(-1);
  };

  const handleLihatRiwayat = () => {
    navigate('/riwayat-transaksi');
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 flex justify-center items-center">
        <div className="text-center">Memuat data pembayaran...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen py-8 px-4 flex justify-center items-center">
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <p className="text-red-600">Error: {error || 'Data tidak ditemukan'}</p>
          <button onClick={() => navigate(-1)} className="mt-3 text-blue-600">Kembali</button>
        </div>
      </div>
    );
  }

  const { jenis, noPolis, total, transactionId: id } = data;

  return (
    <div className="min-h-screen py-8 px-4 relative">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-3">
          <button onClick={handleKembali} className="text-gray-600 hover:text-gray-900">
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Pembayaran Premi</h1>
        </div>

        <div className="p-5 space-y-5">
          <div className="border-b pb-3 flex items-center gap-3">
            <FaHome className="text-blue-300 text-3xl" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{jenis}</h2>
              <p className="text-sm text-gray-500">No. Polis: {noPolis}</p>
            </div>
          </div>

          {/* Total Pembayaran */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">Total premi yang harus dibayar bulan ini</p>
            <p className="text-3xl font-extrabold text-sky-950">
              Rp {total?.toLocaleString('id-ID')}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center border-y py-4">
            <QRCodeSVG value={id} size={180} />
            <p className="text-xs text-gray-500 mt-2 break-all text-center px-4">
              {id}
            </p>
          </div>

          {/* Petunjuk Pembayaran QRIS */}
          <div className="text-sm space-y-2">
            <h3 className="font-semibold text-gray-700">Petunjuk Pembayaran QRIS</h3>
            <ol className="list-decimal pl-5 space-y-1 text-gray-600 text-xs">
              <li>Simpan atau screenshot Kode QR, yang berlaku selama 20 menit. Kamu bisa muat ulang untuk dapatkan kode baru.</li>
              <li>Scan Kode QR dengan m-banking, dompet elektronik, atau aplikasi pembayaran lain.</li>
              <li>Pastikan rincian pembayaran telah sesuai, lalu lanjutkan pembayaran.</li>
              <li>Transaksi akan secara otomatis terbayar dan diperbarui setelah pembayaran berhasil.</li>
              <li>Simpan bukti pembayaran untuk verifikasi lebih lanjut jika diperlukan.</li>
              <li>Pembayaran tidak dapat diproses jika menggunakan metode pembayaran yang tidak sah.</li>
            </ol>
          </div>

          {/* Tombol Simpan QR Code */}
          <button
            onClick={handleSimpanQR}
            className="w-full bg-sky-950 hover:bg-gray-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <FaDownload size={16} />
            Simpan Kode QR
          </button>

          {/* Tombol Lihat Riwayat Transaksi */}
          <button
            onClick={handleLihatRiwayat}
            className="w-full bg-sky-950 hover:bg-gray-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            Lihat Riwayat Transaksi
          </button>
        </div>
      </div>
    </div>
  );
}