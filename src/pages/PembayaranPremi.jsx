import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
// PERBAIKAN: Menambahkan FaArrowLeft ke dalam daftar import ikon
import { FaDownload, FaHome, FaArrowLeft } from 'react-icons/fa';

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
        
        // PERBAIKAN UTAMA: Menggunakan URL absolut ke server Laravel Anda
        const response = await fetch(`http://127.0.0.1:8000/api/pembayaran-premi/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
        
        if (!response.ok) throw new Error('Gagal mengambil data pembayaran dari server');
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
      <div className="min-h-screen py-8 px-4 flex justify-center items-center bg-gray-50">
        <div className="text-center font-medium text-gray-500">Memuat data pembayaran...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen py-8 px-4 flex justify-center items-center bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-md text-center border border-gray-100 max-w-sm w-full">
          <p className="text-red-600 font-semibold">Error: {error || 'Data tidak ditemukan'}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-sky-950 text-white rounded-xl text-sm font-medium transition hover:bg-sky-900">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const { jenis, noPolis, total, transactionId: id } = data;

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-3 bg-white">
          <button onClick={handleKembali} className="text-gray-600 hover:text-gray-900 transition p-1">
            <FaArrowLeft size={16} />
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
          <div className="text-center bg-gray-50 py-4 rounded-xl border border-gray-100">
            <p className="text-gray-500 text-sm">Total premi yang harus dibayar bulan ini</p>
            <p className="text-3xl font-extrabold text-sky-950 mt-1">
              Rp {total?.toLocaleString('id-ID')}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center border-y py-4 bg-white">
            <div className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
              <QRCodeSVG value={id || 'PAY-UNKNOWN'} size={180} />
            </div>
            <p className="text-xs text-gray-400 font-mono mt-3 break-all text-center px-4 tracking-wide bg-gray-50 py-1 rounded-full">
              {id}
            </p>
          </div>

          {/* Petunjuk Pembayaran QRIS */}
          <div className="text-sm space-y-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100/30">
            <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wider">Petunjuk Pembayaran QRIS</h3>
            <ol className="list-decimal pl-4 space-y-1.5 text-gray-600 text-xs leading-relaxed">
              <li>Simpan atau screenshot Kode QR, yang berlaku selama 20 menit. Kamu bisa muat ulang untuk dapatkan kode baru.</li>
              <li>Scan Kode QR dengan m-banking, dompet elektronik, atau aplikasi pembayaran lain.</li>
              <li>Pastikan rincian pembayaran telah sesuai, lalu lanjutkan pembayaran.</li>
              <li>Transaksi akan secara otomatis terbayar dan diperbarui setelah pembayaran berhasil.</li>
              <li>Simpan bukti pembayaran untuk verifikasi lebih lanjut jika diperlukan.</li>
              <li>Pembayaran tidak dapat diproses jika menggunakan metode pembayaran yang tidak sah.</li>
            </ol>
          </div>

          {/* Tombol Aksi */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSimpanQR}
              className="w-full bg-sky-950 hover:bg-sky-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 shadow transition text-sm"
            >
              <FaDownload size={14} />
              Simpan Kode QR
            </button>

            <button
              onClick={handleLihatRiwayat}
              className="w-full bg-white hover:bg-gray-50 text-sky-950 border border-gray-200 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition text-sm"
            >
              Lihat Riwayat Transaksi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}