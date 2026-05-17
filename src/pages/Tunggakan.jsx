import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

export default function Tunggakan() {
  // Data dummy (dapat diambil dari localStorage nanti)
  const totalTunggakan = 0;
  const jumlahTagihan = 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-sky-950 rounded-2xl p-6 text-white shadow-lg flex items-center gap-4">
        <Link to="/dashboard" className="text-white hover:text-gray-300 transition">
            <FaArrowLeft size={18} />
        </Link>
        <h2 className="text-2xl font-semibold">Tunggakan</h2>
      </div>

      {/* TOTAL TUNGGAKAN & JUMLAH TAGIHAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kartu Total Tunggakan */}
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Tunggakan</p>
          <p className="text-4xl font-extrabold text-sky-900 mt-2">
            Rp {totalTunggakan.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Kartu Jumlah Tagihan */}
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Jumlah Tagihan</p>
          <p className="text-4xl font-extrabold text-sky-900 mt-2">
            {jumlahTagihan} polis
          </p>
        </div>
      </div>

      {/* Pesan jika tidak ada tunggakan */}
      {totalTunggakan === 0 && (
        <div className="bg-white/10 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-3">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
          <p className="text-lg font-semibold text-black">Semua Tagihan Lunas</p>
          <p className="text-sm text-black/80 mt-1">
            Tidak ada tunggakan saat ini. Polis aktif dan terlindungi.
          </p>
        </div>
      )}
    </div>
  );
}