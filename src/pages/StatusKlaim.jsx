import { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';
import { FaHome, FaHeartbeat, FaCar, FaGraduationCap } from 'react-icons/fa';
import { api } from '../lib/api'; 
import jsPDF from 'jspdf'; // Wajib
import html2canvas from 'html2canvas'; // TAMBAHAN Wajib untuk metode HTML-to-PDF

export default function StatusKlaim() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const { data } = await api('/klaim/saya', 'GET', null, token);
        
        const klaimArray = Array.isArray(data) ? data : (data?.claims || data?.data || []);
        const validClaims = klaimArray.filter(claim => claim); 
        
        const withIcons = validClaims.map(claim => ({
          ...claim,
          jenis: claim.jenis || claim.Jenis_Klaim || 'Klaim Umum',
          noPolis: claim.noPolis || claim.ID_Polis || '-',
          status: claim.status || claim.Status_Klaim || 'DIPROSES',
          tglPengajuan: claim.tglPengajuan || claim.Tanggal_Pengajuan || '-',
          tglPencairan: claim.tglPencairan || claim.Tanggal_Pencairan || '-',
          jumlah_raw: claim.Jumlah_Klaim || claim.jumlah || 0, // Simpan angka mentah untuk kalkulasi
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
  // PERUBAHAN UTAMA: Fungsi untuk mengunduh dokumen klaim dari Backend Laravel
  // ====================================================================
  const handleDownload = async (claim) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Teks paragraf surat yang panjang, menggunakan placeholder dinamis
    const paragrafSurat = `Melalui surat ini, kami dari PT InsurTech Asuransi Indonesia dengan bangga menyampaikan bahwa klaim asuransi ${claim.jenis.toLowerCase()} yang Bapak/Ibu ajukan pada tanggal <strong>${claim.tglPengajuan}</strong> telah melalui proses verifikasi dan evaluasi secara menyeluruh oleh tim kami. Berdasarkan hasil penilaian tersebut, kami dengan senang hati menginformasikan bahwa klaim Bapak/Ibu <strong>DISETUJUI</strong> dengan rincian sebagai berikut:`;

    // 1. BUAT HTML TEMPLATE SESUAI GAMBAR CONTOH
    const htmlString = `
      <div style="font-family: Arial, sans-serif; width: 700px; padding: 60px; color: black; line-height: 1.6; background: white;">
        
        <div style="text-align: center; border-bottom: 2px solid black; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #1B3A5C; margin: 0; font-size: 28px;">PT INSURTECH ASURANSI INDONESIA</h1>
          <p style="margin: 5px 0; font-size: 14px; color: #444;">Jl. Sudirman Kav. 52-53, Jakarta Selatan 12190 | Telp. (021) 555-0100 | www.insurtech.co.id</p>
        </div>

        <div style="margin-bottom: 25px; display: flex; justify-content: space-between; font-size: 14px;">
          <div>No. Surat: IST/KL/2026/${String(claims.indexOf(claim) + 1).padStart(3, '0')}</div>
          <div style="text-align: right;">Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>

        <div style="background-color: #D1FAE5; color: #065F46; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; margin-bottom: 30px; letter-spacing: 1px;">KLAIM DISETUJUI</div>

        <div style="display: flex; gap: 40px; margin-bottom: 40px; font-size: 14px;">
          <div style="flex: 1; font-weight: bold;">
            <p style="margin: 6px 0;">No. Polis</p>
            <p style="margin: 6px 0;">Jenis Asuransi</p>
            <p style="margin: 6px 0;">Tgl. Pengajuan</p>
            <p style="margin: 6px 0;">Tgl. Pencairan</p>
          </div>
          <div style="flex: 2;">
            <p style="margin: 6px 0;">:${claim.noPolis}</p>
            <p style="margin: 6px 0;">:${claim.jenis}</p>
            <p style="margin: 6px 0;">:${claim.tglPengajuan}</p>
            <p style="margin: 6px 0;">:${claim.tglPencairan && claim.tglPencairan !== '-' ? claim.tglPencairan : 'Maksimal 3 hari kerja'}</p>
          </div>
        </div>

        <div style="border-top: 1px solid #ccc; margin-bottom: 35px;"></div>

        <div style="font-size: 14px; margin-bottom: 30px; text-align: justify;">
          <p>Kepada Yth.<br/>Bapak/Ibu Tertanggung<br/>Pemegang Polis #${claim.noPolis}</p>
          <p style="margin-top: 25px;">Dengan hormat,</p>
          <p style="margin-top: 15px;">${paragrafSurat}</p>
        </div>

        <div style="margin-bottom: 45px; font-size: 14px;">
          <p style="font-weight: bold; color: #1B3A5C; margin-bottom: 8px;">Jumlah Klaim Disetujui</p>
          <p style="font-size: 24px; font-weight: bold; color: #1B3A5C; margin: 0;">${claim.jumlah}</p>
        </div>

        <div style="font-size: 14px; margin-bottom: 100px; text-align: justify; color: #444;">
          <p>Dana tersebut akan ditransfer ke rekening bank yang telah Bapak/Ibu daftarkan dalam waktu 1-3 hari kerja sejak tanggal surat ini diterbitkan.</p>
          <p style="margin-top: 15px;">Kami menghargai kepercayaan Bapak/Ibu kepada InsurTech. Jika terdapat pertanyaan lebih lanjut, jangan ragu menghubungi kami melalui layanan pelanggan di nomor (021) 555-0100 atau email cs@insurtech.co.id.</p>
          <p style="margin-top: 15px;">Demikian surat pemberitahuan ini kami sampaikan. Terima kasih.</p>
        </div>

        <div style="text-align: right; font-size: 14px;">
          <p>Hormat kami,</p>
          <br/><br/><br/>
          <p style="font-weight: bold;">Andi Prasetyo, S.E., M.M.</p>
          <p style="color: #444;">Kepala Divisi Klaim</p>
          <p style="color: #444;">PT InsurTech Asuransi Indonesia</p>
        </div>

      </div>
    `;

    // 2. RENDER HTML KE PDF MENGGUNAKAN JSPDF
    // Buat elemen div sementara untuk merender HTML di DOM
    const tempDiv = document.body.appendChild(document.createElement('div'));
    tempDiv.innerHTML = htmlString;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px'; // Sembunyikan div

    try {
        // Konversi div tersebut menjadi PDF
        await doc.html(tempDiv, {
            callback: function (doc) {
                doc.save(`Surat_Persetujuan_Klaim_${claim.noPolis}.pdf`);
                // Bersihkan div sementara
                document.body.removeChild(tempDiv);
            },
            x: 10, // Margin kiri PDF
            y: 10, // Margin atas PDF
            width: 190, // Lebar konten HTML di PDF
            windowWidth: 700 // Sesuaikan dengan lebar div HTML di atas
        });
    } catch (error) {
        console.error("Gagal membuat PDF:", error);
        alert("Terjadi kesalahan saat membuat file PDF.");
        document.body.removeChild(tempDiv); // Pastikan div bersih
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

                {/* Tombol hanya muncul JIKA status klaim DISETUJUI */}
                {claim.status === 'DISETUJUI' && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleDownload(claim)} // Mengirim object klaim lengkap
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-sky-950 hover:bg-sky-800 text-white transition shadow-sm"
                    >
                      <FaDownload size={14} />
                      Unduh Surat Persetujuan (PDF)
                    </button>
                  </div>
                )}

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}