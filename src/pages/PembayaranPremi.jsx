import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FaDownload, FaHome, FaAngleLeft } from 'react-icons/fa';

export default function PembayaranPremi() {
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

  const transactionId = location.state?.transactionId || urlTransactionId;

  // Fungsi untuk mengecek status pembayaran ke backend
  const checkPaymentStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/pembayaran-premi/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Gagal mengecek status');
      const result = await response.json();
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

  // LOGIKA WAKTU: Timeout 1 x 24 Jam (86.400 detik)
   const startPolling = (id) => {
    stopPolling();

    let timeLeft = 86400; 
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

    pollingRef.current = setInterval(async () => {
      const status = await checkPaymentStatus(id);
      if (status === 'paid' || status === 'success') {
        setPaymentStatus('success');
        stopPolling();
        navigate('/riwayat-transaksi', {
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

  useEffect(() => {
    const fetchPayment = async () => {
      if (!transactionId) {
        setError('ID transaksi tidak ditemukan');
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:8000/api/pembayaran-premi/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
        
        if (!response.ok) throw new Error('Gagal mengambil data pembayaran dari server');
        const result = await response.json();
        
        // Asumsi result data langsung atau di dalam object data
        const paymentData = result.data || result;
        setData(paymentData);
        
        const initialStatus = paymentData.status || 'pending';
        setPaymentStatus(initialStatus);

        if (initialStatus === 'paid' || initialStatus === 'success') {
          navigate('/riwayat-transaksi', { replace: true, state: { paymentSuccess: true, transactionId } });
        } else if (initialStatus === 'pending') {
          startPolling(transactionId);
        } else if (initialStatus === 'failed' || initialStatus === 'expired') {
          // JANGAN setError, biarkan halaman tetap tampil
          // Tidak melakukan apa-apa, hanya menampilkan status failed/expired
        } else {
          setError('Transaksi tidak valid atau sudah kadaluwarsa.');
        }

      } catch (err) {
        console.error('Error fetching payment:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayment();

    return () => {
      stopPolling();
    };
  }, [transactionId, navigate]);

  // ====================================================================
  // LOGIKA UNDUH QR KE DEVICE
  // ====================================================================
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
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR_Premi_${transactionId || 'InsurTech'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
    }
  };

  const handleKembali = () => {
    stopPolling();
    navigate(-1);
  };

  const handleLihatRiwayat = () => {
    stopPolling();
    navigate('/riwayat-transaksi');
  };

  // Fungsi format waktu
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')} Jam ${minutes.toString().padStart(2, '0')} Menit ${seconds.toString().padStart(2, '0')} Detik`;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 flex justify-center items-center bg-gray-50">
        <div className="text-center font-medium text-gray-500">Memuat data pembayaran...</div>
      </div>
    );
  }

  // Tampilkan error hanya jika error ada DAN status BUKAN failed/expired
  if (error && paymentStatus !== 'failed' && paymentStatus !== 'expired') {
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

  // Jika data tidak ada, tampilkan error
  if (!data) {
    return (
      <div className="min-h-screen py-8 px-4 flex justify-center items-center bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-md text-center border border-gray-100 max-w-sm w-full">
          <p className="text-red-600 font-semibold">Error: Data tidak ditemukan</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-sky-950 text-white rounded-xl text-sm font-medium transition hover:bg-sky-900">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const { jenis, noPolis, total, transactionId: id } = data;

  return (
    <div className="min-h-screen py-8 px-4 relative">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {/* Header - Ganti FaArrowLeft dengan FaAngleLeft */}
        <div className="p-4 border-b flex items-center gap-3 bg-white">
          <button onClick={handleKembali} className="text-gray-600 hover:text-gray-900 transition p-1">
            <FaAngleLeft size={20} />
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

          {/* Total Pembayaran, Status & Tampilan Visual Waktu Mundur */}
          <div className="text-center py-4 rounded-xl">
            <p className="text-gray-500 text-sm">Total premi yang harus dibayar bulan ini</p>
            <p className="text-3xl font-extrabold text-sky-950 mt-1">
              Rp {total?.toLocaleString('id-ID')}
            </p>
            
            <div className="mt-3">
              {paymentStatus === 'pending' && (
                <p className="text-sm font-medium text-gray-600 mb-1">Menunggu pembayaran...</p>
              )}
              {paymentStatus === 'success' && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-flex items-center gap-2">
                  <span>✓</span> Pembayaran berhasil! Mengalihkan...
                </div>
              )}
              {paymentStatus === 'failed' && (
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm inline-flex">
                  Pembayaran gagal. Silakan coba lagi.
                </div>
              )}
              {paymentStatus === 'expired' && (
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold inline-flex">
                  Pembayaran Gagal - Waktu Habis
                </div>
              )}
            </div>

            {countdown > 0 && paymentStatus === 'pending' && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Batas waktu bayar:</p>
                <p className="text-sm font-bold text-amber-700 bg-amber-50 inline-block px-3 py-1 rounded-md border border-amber-200 shadow-sm">{formatTime(countdown)}
                </p>
              </div>
            )}
          </div>

          {/* QR Code - QR menjadi blur/tidak tersedia saat gagal/expired */}
          <div className="flex flex-col items-center border-y py-4 bg-white">
            <div className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
              {(paymentStatus === 'failed' || paymentStatus === 'expired') ? (
                <div className="h-[180px] w-[180px] flex items-center justify-center border-2 border-dashed border-red-300 rounded-lg p-4 text-center bg-white">
                  <span className="text-red-500 font-bold">QR Tidak Tersedia</span>
                </div>
              ) : (
                <QRCodeSVG id="qr-code-svg" value={id || 'PAY-UNKNOWN'} size={180} />
              )}
            </div>
            <p className="text-xs text-gray-400 font-mono mt-3 break-all text-center px-4 tracking-wide bg-gray-50 py-1 rounded-full">
              {id}
            </p>
          </div>

          {/* Petunjuk Pembayaran QRIS - TETAP DITAMPILKAN */}
          <div className="text-sm space-y-2 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wider">Petunjuk Pembayaran QRIS</h3>
            <ol className="list-decimal pl-4 space-y-1.5 text-gray-600 text-xs leading-relaxed">
              <li>Simpan atau screenshot Kode QR. Kamu bisa muat ulang untuk dapatkan kode baru.</li>
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
              disabled={paymentStatus === 'expired' || paymentStatus === 'failed'}
              className={`w-full font-semibold py-3 rounded-lg flex items-center justify-center gap-2 shadow transition text-sm ${
                (paymentStatus === 'expired' || paymentStatus === 'failed') 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-sky-950 hover:bg-sky-900 text-white'
              }`}
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