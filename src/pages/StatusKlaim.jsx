import { FaDownload } from 'react-icons/fa';
import { FaHome, FaHeartbeat, FaCar } from 'react-icons/fa';

export default function StatusKlaim() {
  const claims = [
    {
      id: 1,
      jenis: 'Asuransi Properti',
      noPolis: 'EA-99281-X',
      tglPengajuan: '12 Okt 2025',
      tglPencairan: '20 Okt 2025',
      status: 'DISETUJUI',
      jumlah: 'Rp 14.500.000',
      icon: <FaHome className="text-blue-300 text-3xl" />,
    },
    {
      id: 2,
      jenis: 'Asuransi Kesehatan',
      noPolis: 'EA-99345-L',
      tglPengajuan: '28 Okt 2025',
      tglPencairan: 'Menunggu Verifikasi',
      status: 'DIPROSES',
      jumlah: 'Rp 4.250.000',
      icon: <FaHeartbeat className="text-red-500 text-3xl" />,
    },
    {
      id: 3,
      jenis: 'Asuransi Kendaraan',
      noPolis: 'EA-99512-Z',
      tglPengajuan: '05 Nov 2023',
      tglPencairan: '-',
      status: 'DITOLAK',
      jumlah: 'Rp 8.900.000',
      icon: <FaCar className="text-amber-300 text-3xl" />,
    },
  ];

  const handleDownload = (claimNo) => {
    alert(`Mengunduh surat klaim untuk polis ${claimNo}`);
  };

  const getButtonStyle = (status) => {
    if (status === 'DITOLAK') {
      return 'bg-gray-200 hover:bg-gray-300 text-gray-400';
    }
    return 'bg-gray-300 hover:bg-gray-500 text-sky-950';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <h1 className="text-2xl font-bold text-gray-800">Status Klaim</h1>

      <div className="space-y-5">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
          >
            <div className="p-5 space-y-4">
              {/* Baris 1: Ikon + Jenis Asuransi (kiri) dan Status (kanan) */}
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
                      : claim.status === 'DIPROSES'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {claim.status}
                </p>
              </div>

              {/* Baris 2: Tanggal Pengajuan (kiri) dan Jumlah Klaim (kanan) */}
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

              {/* Baris 3: Tanggal Pencairan - sekarang selalu biru (kecuali DITOLAK tetap strip) */}
              <div>
                <p className="text-black font-semibold text-sm">TANGGAL PENCAIRAN</p>
                {claim.status === 'DITOLAK' ? (
                  <p className="text-red-600 text-lg font-bold">-</p>
                ) : (
                  <p className="font-medium text-blue-500">
                    {claim.tglPencairan === '-'
                      ? '-'
                      : claim.tglPencairan === 'Menunggu Verifikasi'
                      ? <span className="italic">{claim.tglPencairan}</span>
                      : claim.tglPencairan}
                  </p>
                )}
              </div>

              {/* Tombol Unduh PDF - Full width */}
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
        ))}

        {claims.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-gray-500">Belum ada klaim yang diajukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}