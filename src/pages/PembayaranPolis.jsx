import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FaDownload, FaArrowLeft } from 'react-icons/fa6'; // PERBAIKAN: Gunakan icon yang sejenis

export default function PembayaranPolis() {
  const location = useLocation();
  const navigate = useNavigate();
  const { transactionId: urlTransactionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ambil transactionId dari state atau URL
  const transactionId = location.state?.transactionId || urlTransactionId;

  useEffect(() => {
    const fetchPembayaran = async () => {
      // JALAN PINTAS AMAN: Jika data sudah dikirim lengkap lewat Router state, langsung pakai!
      if (location.state && location.state.transactionId) {
        setData({
          total: location.state.total,
          productName: location.state.productName,
          transactionId: location.state.transactionId,
          namaPenerima: location.state.namaPenerima,
          nikPenerima: location.state.nikPenerima
        });
        setLoading(false);
        return;
      }

      if (!transactionId) {
        setError('ID transaksi tidak ditemukan');
        setLoading(false);
        return;
      }

      // Skenario cadangan jika halaman di-refresh manual (F5) oleh user
      try {
        const token = localStorage.getItem('token');
        // Gunakan base url penuh agar tidak salah tangkap HTML jika route Vite bermasalah
        const response = await fetch(`http://127.0.0.1:8000/api/pembayaran-polis/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Gagal mengambil data pembayaran');
        const result = await response.json();
        setData(result.data || result);
      } catch (err) {
        console.error('Error fetching payment:', err);
        setError(err.message || 'Gagal terhubung ke server');
      } finally {
        setLoading(false);
      }
    };

    fetchPembayaran();
  }, [transactionId, location.state]);

  const handleSimpanQR = () => {
    alert('QR Code disimpan (simulasi).');
  };

  const handleKembali = () => {
    navigate(-1);
  };

  const handleLihatPolis = () => {
    navigate('/polis-saya');
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 flex justify-center items-center">
        <div className="text-center font-medium text-gray-600">Memuat data pembayaran...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen py-8 px-4 flex justify-center items-center">
        <div className="bg-white p-6 rounded-xl shadow-md text-center max-w-sm w-full">
          <p className="text-red-600 font-semibold">Error: {error || 'Data tidak ditemukan'}</p>
          <button onClick={() => navigate(-1)} className="mt-4 bg-sky-950 text-white px-4 py-2 rounded-lg text-sm w-full">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const { total, productName, transactionId: id, namaPenerima, nikPenerima } = data;

  return (
    <div className="min-h-screen py-8 px-4 relative">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-3">
          <button onClick={handleKembali} className="text-gray-600 hover:text-gray-900 transition p-1">
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Pembayaran Polis</h1>
        </div>

        <div className="p-5 space-y-5">
          {/* Total pembayaran */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">Total polis yang harus dibayar</p>
            <p className="text-3xl font-extrabold text-sky-950 mt-1">
              Rp {Number(total || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-sm font-semibold text-gray-700 mt-2">{productName || 'Produk Asuransi'}</p>
            {namaPenerima && <p className="text-xs text-gray-500 mt-1">Penerima: {namaPenerima} ({nikPenerima || '-'})</p>}
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center border-y py-4 bg-gray-50 rounded-xl">
            <QRCodeSVG value={id || 'DUMMY_TX_ID'} size={180} />
            <p className="text-xs text-gray-500 mt-3 break-all text-center px-4 font-mono">
              {id || 'ID Transaksi Tidak Valid'}
            </p>
          </div>

          {/* Petunjuk Pembayaran QRIS */}
          <div className="text-sm space-y-2">
            <h3 className="font-semibold text-gray-700">Petunjuk Pembayaran QRIS</h3>
            <ol className="list-decimal pl-5 space-y-1 text-gray-600 text-xs leading-relaxed">
              <li>Simpan atau screenshot Kode QR, yang berlaku selama 20 menit. Kamu bisa muat ulang untuk dapatkan kode baru.</li>
              <li>Scan Kode QR dengan m-banking, dompet elektronik, atau aplikasi pembayaran lain.</li>
              <li>Pastikan rincian pembayaran telah sesuai, lalu lanjutkan pembayaran.</li>
              <li>Transaksi akan secara otomatis terbayar dan diperbarui setelah pembayaran berhasil.</li>
              <li>Simpan bukti pembayaran untuk verifikasi lebih lanjut jika diperlukan.</li>
              <li>Pembayaran tidak dapat diproses jika menggunakan metode pembayaran yang tidak didukung.</li>
            </ol>
          </div>

          {/* Tombol Aksi */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSimpanQR}
              className="w-full bg-sky-950 hover:bg-sky-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <FaDownload size={14} />
              Simpan Kode QR
            </button>

            <button
              onClick={handleLihatPolis}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition border border-gray-200"
            >
              Lihat Polis Saya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}