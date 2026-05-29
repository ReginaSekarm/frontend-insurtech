import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FaDownload, FaAngleLeft} from 'react-icons/fa';

export default function PembayaranPolis() {
  const location = useLocation();
  const navigate = useNavigate();
  const { transactionId: urlTransactionId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, success, failed, expired
  const [countdown, setCountdown] = useState(0); // hitung mundur 24 Jam

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

  // LOGIKA WAKTU
  const startPolling = (id) => {
    // Hentikan yang lama jika ada
    stopPolling();

    // Set timeout 1 x 24 Jam dalam detik (24 jam * 60 menit * 60 detik)
    let timeLeft = 24 * 60 * 60; 
    setCountdown(timeLeft);

    countdownRef.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        stopPolling();
        setPaymentStatus('expired');
        // HAPUS setError di sini
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
        // HAPUS setError di sini
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
        } else if (initialStatus === 'failed' || initialStatus === 'expired') {
          // JANGAN setError, biarkan halaman tetap tampil
          // Tidak melakukan apa-apa, hanya menampilkan status failed/expired
        } else {
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

  // PERUBAHAN UNDUH QR: Logika untuk mendownload QR ke Device
  const handleSimpanQR = () => {
    // Cegah download QR jika status gagal/expired
    if (paymentStatus === 'failed' || paymentStatus === 'expired') {
      return;
    }
    
    const svgElement = document.getElementById('qr-code-svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width + 40;
        canvas.height = img.height + 40;
        ctx.fillStyle = "#FFFFFF"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20); 

        // Buat file PNG
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR_Pembayaran_${transactionId || 'Polis'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      // Render SVG ke Base64 Image
      img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
    }
  };

  const handleKembali = () => {
    stopPolling();
    navigate(-1);
  };

  const handleLihatPolis = () => {
    stopPolling();
    navigate('/polis-saya');
  };

  // Fungsi format waktu
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')} Jam ${minutes.toString().padStart(2, '0')} Menit ${seconds.toString().padStart(2, '0')} Detik`;
  };

  // Tampilkan loading
  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 flex justify-center items-center">
        <div className="text-center font-medium text-gray-600">Memuat data pembayaran...</div>
      </div>
    );
  }

  // Tampilkan error hanya jika error ada DAN status BUKAN failed/expired
  if (error && paymentStatus !== 'failed' && paymentStatus !== 'expired') {
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
            <FaAngleLeft size={18} />
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
          </div>

          {/* Status pembayaran - TAMBAHKAN status failed dan expired */}
          <div className="text-center">
            {paymentStatus === 'pending' && (
              <p className="text-sm font-medium text-gray-600 mb-1">Menunggu pembayaran...</p>
            )}
            {paymentStatus === 'success' && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-flex items-center gap-2">
                <span>✓</span> Pembayaran berhasil! Mengalihkan...
              </div>
            )}
            {/* TAMBAHKAN status failed */}
            {paymentStatus === 'failed' && (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                Pembayaran gagal. Silakan coba lagi.
              </div>
            )}
            {/* TAMBAHKAN status expired */}
            {paymentStatus === 'expired' && (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                 Pembayaran Gagal - Waktu Habis
              </div>
            )}

            {/* Tampilan Visual Waktu Mundur Ditampilkan Kembali */}
            {countdown > 0 && paymentStatus === 'pending' && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Batas waktu bayar:</p>
                <p className="text-sm font-bold text-amber-700 bg-amber-50 inline-block px-3 py-1 rounded-md border border-amber-200 shadow-sm"> {formatTime(countdown)}
                </p>
              </div>
            )}
          </div>

          {/* QR Code - UBAH: QR menjadi blur/tidak tersedia saat gagal/expired */}
          <div className="flex flex-col items-center border-y py-4 bg-gray-50 rounded-xl">
            {(paymentStatus === 'failed' || paymentStatus === 'expired') ? (
              // QR tidak tersedia
              <div className="h-[180px] w-[180px] flex items-center justify-center border-2 border-dashed border-red-300 rounded-lg p-4 text-center bg-white">
                <span className="text-red-500 font-bold">QR Tidak Tersedia</span>
              </div>
            ) : (
              <QRCodeSVG id="qr-code-svg" value={id || 'DUMMY_TX_ID'} size={180} />
            )}
            <p className="text-xs text-gray-500 mt-3 break-all text-center px-4 font-mono">
              {id || 'ID Transaksi Tidak Valid'}
            </p>
          </div>

          {/* Petunjuk Pembayaran QRIS - TETAP DITAMPILKAN (tidak diubah) */}
          <div className="text-sm space-y-2">
            <h3 className="font-semibold text-gray-700">Petunjuk Pembayaran QRIS</h3>
            <ol className="list-decimal pl-5 space-y-1 text-gray-600 text-xs leading-relaxed">
              <li>Simpan atau screenshot Kode QR. Kamu bisa muat ulang untuk dapatkan kode baru.</li>
              <li>Scan Kode QR dengan m-banking, dompet elektronik, atau aplikasi pembayaran lain.</li>
              <li>Pastikan rincian pembayaran telah sesuai, lalu lanjutkan pembayaran.</li>
              <li>Transaksi akan secara otomatis terbayar dan diperbarui setelah pembayaran berhasil.</li>
              <li>Simpan bukti pembayaran untuk verifikasi lebih lanjut jika diperlukan.</li>
              <li>Pembayaran tidak dapat diproses jika menggunakan metode pembayaran yang tidak didukung.</li>
            </ol>
          </div>

          {/* Tombol Aksi - TETAP SAMA (tidak diubah) */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSimpanQR}
              disabled={(paymentStatus === 'failed' || paymentStatus === 'expired')}
              className={`w-full font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition ${
                (paymentStatus === 'failed' || paymentStatus === 'expired') 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-sky-950 hover:bg-sky-900 text-white shadow-md'
              }`}
            >
              <FaDownload size={14} />
              Simpan Kode QR
            </button>

            <button
              onClick={handleLihatPolis}
              className="w-full bg-white hover:bg-gray-50 text-sky-950 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition border-2 border-gray-200 shadow-sm"
            >
              Lihat Polis Saya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}