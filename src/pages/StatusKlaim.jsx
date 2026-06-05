import { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';
import { FaHome, FaHeartbeat, FaCar, FaGraduationCap } from 'react-icons/fa';

export default function StatusKlaim() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi Helper untuk mengubah format tanggal
  const formatTanggal = (tanggalString) => {
    if (!tanggalString || tanggalString === '-') return '-';
    try {
      const date = new Date(tanggalString);
      if (isNaN(date.getTime())) return tanggalString;
      
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return tanggalString;
    }
  };

  const getIconByJenis = (jenis) => {
    if (!jenis) return <FaHome className="text-gray-400 text-3xl" />;
    const j = jenis.toLowerCase();

    if (j.includes('kesehatan') || j.includes('rawat inap') || j.includes('fisik') || j.includes('kecelakaan')) {
      return <FaHeartbeat className="text-red-500 text-3xl" />;
    }
    if (j.includes('kendaraan') || j.includes('mobil') || j.includes('motor')) {
      return <FaCar className="text-amber-300 text-3xl" />;
    }
    if (j.includes('pendidikan') || j.includes('anak')) {
      return <FaGraduationCap className="text-zinc-600 text-3xl" />;
    }
    if (j.includes('properti') || j.includes('kebakaran') || j.includes('pencurian') || j.includes('kerusakan')) {
      return <FaHome className="text-blue-300 text-3xl" />;
    }
    
    return <FaHome className="text-gray-400 text-3xl" />;
  };

  const getCatatanAdmin = (status) => {
    if (status === 'DISETUJUI' || status === 'Selesai') {
      return 'Klaim telah diverifikasi dan diproses. Dana akan ditransfer ke rekening terdaftar dalam 1–3 hari kerja.';
    }
    if (status === 'DIPROSES' || status === 'Proses' || status === 'Pending') {
      return 'Klaim sedang dalam proses verifikasi oleh tim kami. Status akan diperbarui dalam 24-48 jam.';
    }
    if (status === 'DITOLAK' || status === 'Ditolak') {
      return 'Klaim ditolak karena dokumen tidak memenuhi persyaratan. Silakan hubungi layanan pelanggan.';
    }
    return '';
  };

  useEffect(() => {
    const fetchKlaim = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching klaim with token:', token);
        
        const response = await fetch('http://127.0.0.1:8000/api/klaim/saya', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data klaim');
        }

        const result = await response.json();
        console.log('Data klaim dari server:', result);
        
        const klaimArray = result.data || result;
        const validClaims = Array.isArray(klaimArray) ? klaimArray : [];
        
        const withIcons = validClaims.map(claim => {
          let rawStatus = claim.Status_Klaim || claim.status || 'Proses';
          
          let displayStatus = 'DIPROSES';
          if (rawStatus === 'Selesai' || rawStatus === 'DISETUJUI') displayStatus = 'DISETUJUI';
          if (rawStatus === 'Ditolak' || rawStatus === 'DITOLAK') displayStatus = 'DITOLAK';
          if (rawStatus === 'Proses' || rawStatus === 'proses') displayStatus = 'DIPROSES';

          let jumlahKlaim = claim.jumlah_klaim || claim.Jumlah_Klaim || claim.jumlah || 0;
          let formattedJumlah = `Rp ${Number(jumlahKlaim).toLocaleString('id-ID')}`;
          
          let tglPencairanFormatted = '-';
          const rawTglPencairan = claim.Tanggal_Pencairan || claim.tanggal_pencairan;
          
          if (displayStatus === 'DISETUJUI') {
            tglPencairanFormatted = rawTglPencairan ? formatTanggal(rawTglPencairan) : '-';
          } else if (displayStatus === 'DIPROSES') {
            tglPencairanFormatted = 'Menunggu Verifikasi';
          }

          return {
            id: claim.ID_Klaim || claim.id,
            jenis: claim.Jenis_Klaim || claim.jenis || 'Klaim Umum',
            noPolis: claim.ID_Polis || claim.noPolis || '-',
            status: displayStatus,
            tglPengajuan: formatTanggal(claim.Tanggal_Pengajuan || claim.tanggal_pengajuan),
            tglPencairan: tglPencairanFormatted,
            catatanAdmin: claim.alasan_penolakan || getCatatanAdmin(displayStatus),
            jumlah: formattedJumlah,
            icon: getIconByJenis(claim.Jenis_Klaim || claim.jenis || '')
          };
        });
        
        setClaims(withIcons);
      } catch (err) {
        console.error('Error fetching klaim:', err);
        setError(err.message || 'Gagal mengambil data status klaim.');
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchKlaim();
  }, []);

  const handleDownload = async (claimNo) => {
    if (!claimNo) {
      alert('Nomor klaim tidak ditemukan');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/klaim/unduh/${claimNo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Gagal mengunduh surat klaim.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Surat_Klaim_${claimNo}.pdf`; 
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saat unduh:', error);
      alert('Terjadi kesalahan saat mengunduh surat klaim. Pastikan file tersedia di server.');
    }
  };

  const getButtonStyle = (status) => {
    if (status === 'DITOLAK' || status === 'DIPROSES') {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }
    return 'bg-sky-950 hover:bg-sky-900 text-white';
  };

  const isDownloadDisabled = (status) => {
    return status === 'DITOLAK' || status === 'DIPROSES';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-950 mx-auto"></div>
        <p className="mt-3 text-gray-500">Memuat status klaim...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-sky-950 text-white rounded-lg"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <h1 className="text-2xl font-bold text-gray-800">Status Klaim</h1>

      <div className="space-y-5">
        {claims.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-gray-500">Belum ada klaim yang diajukan.</p>
            <button 
              onClick={() => window.location.href = '/ajukan-klaim'}
              className="mt-4 px-4 py-2 bg-sky-950 text-white rounded-lg"
            >
              Ajukan Klaim Sekarang
            </button>
          </div>
        ) : (
          claims.map((claim, index) => (
            <div
              key={claim.id || index}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
            >
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-start">
                    <div className="text-3xl mt-1">{claim.icon}</div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{claim.jenis}</h2>
                      <p className="text-sm text-gray-500">No. Polis: {claim.noPolis}</p>
                      <p className="text-xs text-gray-400 mt-1">No. Klaim: {claim.id}</p>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      claim.status === 'DISETUJUI'
                        ? 'bg-green-100 text-green-700'
                        : claim.status === 'DIPROSES'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {claim.status === 'DISETUJUI' ? 'DISETUJUI' : claim.status === 'DIPROSES' ? 'DIPROSES' : 'DITOLAK'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs font-semibold">TANGGAL PENGAJUAN</p>
                    <p className="font-medium text-blue-600">{claim.tglPengajuan}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs font-semibold">JUMLAH KLAIM</p>
                    <p className="text-xl font-bold text-sky-950">{claim.jumlah}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-xs font-semibold">TANGGAL PENCAIRAN</p>
                  {claim.status === 'DITOLAK' ? (
                    <p className="text-red-600 text-sm">-</p>
                  ) : (
                    <p className={`font-medium ${claim.tglPencairan === 'Menunggu Verifikasi' ? 'text-yellow-600 italic text-sm' : 'text-blue-600'}`}>
                      {claim.tglPencairan}
                    </p>
                  )}
                </div>

                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CATATAN ADMIN</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {claim.catatanAdmin}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleDownload(claim.id)}
                    disabled={isDownloadDisabled(claim.status)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm ${getButtonStyle(claim.status)}`}
                  >
                    <FaDownload size={14} />
                    Unduh Surat Klaim (PDF)
                  </button>
                  {isDownloadDisabled(claim.status) && (
                    <p className="text-xs text-gray-400 text-center mt-2">
                      *Surat klaim hanya dapat diunduh setelah klaim DISETUJUI
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}