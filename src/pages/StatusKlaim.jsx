import { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';
import { FaHome, FaHeartbeat, FaCar, FaGraduationCap } from 'react-icons/fa';
import { api } from '../lib/api'; // TAMBAHAN: Import fungsi api

export default function StatusKlaim() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ====================================================================
  // PERUBAHAN: Memperbarui deteksi ikon berdasarkan kata kunci jenis klaim
  // ====================================================================
  const getIconByJenis = (jenis) => {
    if (!jenis) return <FaHome className="text-gray-400 text-3xl" />;
    
    // Ubah ke huruf kecil semua agar pengecekan lebih mudah dan tidak sensitif huruf besar/kecil
    const j = jenis.toLowerCase();

    // Kategori Kesehatan
    if (j.includes('kesehatan') || j.includes('rawat inap') || j.includes('fisik') || j.includes('kecelakaan')) {
      return <FaHeartbeat className="text-red-500 text-3xl" />;
    }
    // Kategori Kendaraan
    if (j.includes('kendaraan') || j.includes('mobil') || j.includes('motor')) {
      return <FaCar className="text-amber-300 text-3xl" />;
    }
    // Kategori Pendidikan
    if (j.includes('pendidikan') || j.includes('anak')) {
      return <FaGraduationCap className="text-zinc-600 text-3xl" />;
    }
    // Kategori Properti / Default Asuransi Umum
    if (j.includes('properti') || j.includes('kebakaran') || j.includes('pencurian') || j.includes('kerusakan')) {
      return <FaHome className="text-blue-300 text-3xl" />;
    }
    
    return <FaHome className="text-gray-400 text-3xl" />;
  };

  const getCatatanAdmin = (status) => {
    if (status === 'DISETUJUI') {
      return 'Klaim telah diverifikasi dan diproses. Dana akan ditransfer ke rekening terdaftar dalam 1–3 hari kerja.';
    }
    if (status === 'DIPROSES') {
      return 'Klaim sedang dalam proses verifikasi oleh tim kami. Status akan diperbarui dalam 24-48 jam.';
    }
    if (status === 'DITOLAK') {
      return 'Klaim ditolak karena dokumen tidak memenuhi persyaratan. Silakan hubungi layanan pelanggan.';
    }
    return '';
  };

  useEffect(() => {
    const fetchKlaim = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // PERUBAHAN: Gunakan fungsi api() dan arahkan ke '/klaim/saya' sesuai dengan rute Laravel
        const { data } = await api('/klaim/saya', 'GET', null, token);
        
        // Pastikan data adalah array (handling struktur respons yang bervariasi)
        const klaimArray = Array.isArray(data) ? data : (data?.claims || data?.data || []);
        
        const validClaims = klaimArray.filter(claim => claim); // Filter agar tidak ada object null
        
        const withIcons = validClaims.map(claim => ({
          ...claim,
          // Menyesuaikan mapping field jika data dari backend berbeda nama key-nya
          jenis: claim.jenis || claim.Jenis_Klaim || 'Klaim Umum',
          noPolis: claim.noPolis || claim.ID_Polis || '-',
          status: claim.status || claim.Status_Klaim || 'DIPROSES',
          tglPengajuan: claim.tglPengajuan || claim.Tanggal_Pengajuan || '-',
          jumlah: claim.jumlah || (claim.Jumlah_Klaim ? `Rp ${Number(claim.Jumlah_Klaim).toLocaleString('id-ID')}` : 'Rp 0'),
          icon: getIconByJenis(claim.jenis || claim.Jenis_Klaim || '')
        }));
        
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

  // ====================================================================
  // PERUBAHAN: Fungsi untuk mengunduh dokumen klaim dari Backend Laravel
  // ====================================================================
  const handleDownload = async (claimNo) => {
    try {
      const token = localStorage.getItem('token');
      
      // Request ke endpoint download Laravel (Sesuaikan '/api/klaim/unduh/' dengan route backend Anda)
      const response = await fetch(`http://127.0.0.1:8000/api/klaim/unduh/${claimNo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Gagal mengunduh surat klaim.');
      }

      // Mengubah response dari server menjadi file Blob (binary large object)
      const blob = await response.blob();
      
      // Membuat URL sementara untuk file blob tersebut
      const url = window.URL.createObjectURL(blob);
      
      // Membuat elemen <a> secara virtual untuk memicu download otomatis
      const link = document.createElement('a');
      link.href = url;
      link.download = `Surat_Klaim_${claimNo}.pdf`; // Nama file saat tersimpan di device
      document.body.appendChild(link);
      link.click();
      
      // Membersihkan elemen dan URL memori setelah selesai
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error saat unduh:', error);
      alert('Terjadi kesalahan saat mengunduh surat klaim. Pastikan file tersedia di server.');
    }
  };

  const getButtonStyle = (status) => {
    if (status === 'DITOLAK') {
      return 'bg-gray-200 hover:bg-gray-300 text-gray-400';
    }
    return 'bg-gray-300 hover:bg-gray-500 text-sky-950';
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6 text-center">Memuat status klaim...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-6 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <h1 className="text-2xl font-bold text-gray-800">Status Klaim</h1>

      <div className="space-y-5">
        {claims.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-gray-500">Belum ada klaim yang diajukan.</p>
          </div>
        ) : (
          claims.map((claim, index) => (
            <div
              key={claim.id || claim.ID_Klaim || index}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
            >
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-start">
                    <div className="text-3xl mt-1">{claim.icon}</div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{claim.jenis}</h2>
                      <p className="text-sm text-gray-500">#{claim.noPolis}</p>
                    </div>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      claim.status === 'DISETUJUI'
                        ? 'text-green-700'
                        : claim.status === 'DIPROSES' || claim.status === 'PENDING'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {claim.status}
                  </p>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-black font-semibold text-sm">TANGGAL PENGAJUAN</p>
                    <p className="font-medium text-sky-950">{claim.tglPengajuan}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-black font-semibold text-sm">JUMLAH KLAIM</p>
                    <p className="text-xl font-bold text-sky-950">{claim.jumlah}</p>
                  </div>
                </div>

                <div>
                  <p className="text-black font-semibold text-sm">TANGGAL PENCAIRAN</p>
                  {claim.status === 'DITOLAK' ? (
                    <p className="text-red-600 text-lg font-bold">-</p>
                  ) : (
                    <p className="font-medium text-blue-500">
                      {claim.tglPencairan === '-' || !claim.tglPencairan
                        ? '-'
                        : claim.tglPencairan === 'Menunggu Verifikasi'
                        ? <span className="italic">{claim.tglPencairan}</span>
                        : claim.tglPencairan}
                    </p>
                  )}
                </div>

                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CATATAN ADMIN</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {claim.catatanAdmin || getCatatanAdmin(claim.status)}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleDownload(claim.noPolis)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm ${getButtonStyle(claim.status)}`}
                  >
                    <FaDownload size={14} />
                    Unduh Surat Klaim (PDF)
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}