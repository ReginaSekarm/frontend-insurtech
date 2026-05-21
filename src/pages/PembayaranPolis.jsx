import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FaDownload, FaArrowLeft } from 'react-icons/fa6';

export default function PembayaranPolis() {
  const location = useLocation();
  const navigate = useNavigate();
  const { transactionId: urlTransactionId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, success, failed
  const [countdown, setCountdown] = useState(0); // hitung mundur untuk polling (opsional)

  const pollingRef = useRef(null);
  const countdownRef = useRef(null);

  // Ambil transactionId dari state atau URL
  const transactionId = location.state?.transactionId || urlTransactionId;

  // Fungsi untuk mengecek status pembayaran ke backend
  const checkPaymentStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/pembayaran-polis/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Gagal mengecek status');
      const result = await response.json();
      // Asumsikan response memiliki field status: 'pending', 'paid', 'success', 'failed', 'expired'
      const status = result.data?.status || result.status || 'pending';
      return status;
    } catch (err) {
      console.error('Polling error:', err);
      return null;
    }
  };

  // Hentikan semua interval
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // Mulai polling dan hitung mundur (opsional, misal timeout 5 menit)
  const startPolling = (id) => {
    // Hentikan yang lama jika ada
    stopPolling();

    // Set timeout 5 menit (300 detik)
    let timeLeft = 300;
    setCountdown(timeLeft);

    countdownRef.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        // Waktu habis, hentikan polling dan tampilkan pesan expired
        stopPolling();
        setPaymentStatus('expired');
        setError('Waktu pembayaran habis. Silakan lakukan pemesanan ulang.');
      }
    }, 1000);

    // Polling setiap 5 detik
    pollingRef.current = setInterval(async () => {
      const status = await checkPaymentStatus(id);
      if (status === 'paid' || status === 'success') {
        setPaymentStatus('success');
        stopPolling();
        // Navigasi ke halaman Polis Saya setelah sukses
        navigate('/polis-saya', {
          replace: true,
          state: { paymentSuccess: true, transactionId: id }
        });
      } else if (status === 'failed' || status === 'expired') {
        setPaymentStatus('failed');
        stopPolling();
        setError('Pembayaran gagal atau kadaluwarsa. Silakan hubungi customer service.');
      }
    }, 5000);
  };

  // Fetch data awal
  useEffect(() => {
    const fetchPembayaran = async () => {
      // Jika data sudah ada di location.state, langsung pakai
      if (location.state && location.state.transactionId) {
        setData({
          total: location.state.total,
          productName: location.state.productName,
          transactionId: location.state.transactionId,
          namaPenerima: location.state.namaPenerima,
          nikPenerima: location.state.nikPenerima
        });
        setLoading(false);
        // Mulai polling dengan transactionId yang sudah ada
        startPolling(location.state.transactionId);
        return;
      }

      if (!transactionId) {
        setError('ID transaksi tidak ditemukan');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:8000/api/pembayaran-polis/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Gagal mengambil data pembayaran');
        const result = await response.json();
        const paymentData = result.data || result;
        setData(paymentData);
        const initialStatus = paymentData.status || 'pending';
        setPaymentStatus(initialStatus);

        // Jika status sudah success sejak awal, langsung redirect
        if (initialStatus === 'paid' || initialStatus === 'success') {
          navigate('/polis-saya', { replace: true, state: { paymentSuccess: true, transactionId } });
        } else if (initialStatus === 'pending') {
          // Mulai polling
          startPolling(transactionId);
        } else {
          // Status failed/expired, tampilkan error
          setError('Transaksi tidak valid atau sudah kadaluwarsa.');
        }
      } catch (err) {
        console.error('Error fetching payment:', err);
        setError(err.message || 'Gagal terhubung ke server');
      } finally {
        setLoading(false);
      }
    };

    fetchPembayaran();

    // Cleanup saat komponen unmount
    return () => {
      stopPolling();
    };
  }, [transactionId, location.state, navigate]);

  // Handler simpan QR (simulasi)
  const handleSimpanQR = () => {
    // Di sini bisa diimplementasikan download QR sebagai gambar
    alert('Kode QR berhasil disimpan (simulasi).');
  };

  const handleKembali = () => {
    stopPolling();
    navigate(-1);
  };

  const handleLihatPolis = () => {
    stopPolling();
    navigate('/polis-saya');
  };

  // Tampilkan loading
  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 flex justify-center items-center">
        <div className="text-center font-medium text-gray-600">Memuat data pembayaran...</div>
      </div>
    );
  }

  // Tampilkan error jika ada
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

          {/* Status pembayaran */}
          <div className="text-center">
            {paymentStatus === 'pending' && (
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                Menunggu pembayaran...
              </div>
            )}
            {paymentStatus === 'success' && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-flex items-center gap-2">
                <span>✓</span> Pembayaran berhasil! Mengalihkan...
              </div>
            )}
            {paymentStatus === 'failed' && (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                Pembayaran gagal. Silakan coba lagi.
              </div>
            )}
            {paymentStatus === 'expired' && (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                Waktu pembayaran habis.
              </div>
            )}
            {countdown > 0 && paymentStatus === 'pending' && (
              <p className="text-xs text-gray-500 mt-2">Sisa waktu: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')} menit</p>
            )}
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