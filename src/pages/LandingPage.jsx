import { useNavigate } from 'react-router-dom';
import keluarga from '../assets/keluarga.jpeg';
import asuransiBox from '../assets/asuransibox.jpeg';
import agen from '../assets/agen.png';
import { FaHeartbeat, FaHome, FaCar, FaGraduationCap } from 'react-icons/fa';
import { Shield, MapPin, Phone, Mail, Clock, FileText, Lock } from 'lucide-react';

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="font-sans">
      <Hero />
      <TentangKami />
      <Produk />
      <Footer />
    </div>
  );
}

// ─── DATA ───────────────────────────────────────────────────────────────────
const stats = [
  { value: '50+', label: 'Pelanggan Aktif' },
  { value: '25+', label: 'Klaim Diproses' },
  { value: '15+', label: 'Penghargaan Nasional' },
  { value: '98%', label: 'Kepuasan Pelanggan' },
];

const products = [
  {
    icon: <FaHeartbeat className="text-red-500 text-2xl"/>,
    title: 'Asuransi Kesehatan',
    desc: 'Perlindungan kesehatan menyeluruh dengan coverage rawat inap, rawat jalan, dan obat-obatan.',
    color: 'bg-neutral-100',
    iconBg: 'bg-neutral-200',
  },
  {
    icon: <FaHome className="text-blue-300 text-2xl"/>,
    title: 'Asuransi Properti',
    desc: 'Lindungi rumah dan properti Anda dari risiko kebakaran, banjir, dan bencana alam.',
    color: 'bg-neutral-100',
    iconBg: 'bg-neutral-200',
  },
  {
    icon: <FaCar className="text-amber-300 text-2xl"/>,
    title: 'Asuransi Kendaraan',
    desc: 'Perlindungan komprehensif untuk kendaraan Anda dengan coverage kecelakaan dan kehilangan.',
    color: 'bg-neutral-100',
    iconBg: 'bg-neutral-200',
  },
  {
    icon: <FaGraduationCap className="text-zinc-600 text-2xl" />,
    title: 'Asuransi Pendidikan',
    desc: 'Pastikan pendidikan anak tetap berjalan hingga perguruan tinggi dengan manfaat asuransi terjamin.',
    color: 'bg-neutral-100',
    iconBg: 'bg-neutral-200',
  },
];

// Icon //
const keunggulan = [
  { icon: <Clock size={20} className="text-white" />, label: 'Proses Cepat' },
  { icon: <FileText size={20} className="text-white" />, label: 'Transparansi Polis' },
  { icon: <Lock size={20} className="text-white" />, label: 'Keamanan Tinggi' },
];

//* Section */
function Navbar() {
  const navigate = useNavigate(); // ✅ tambahkan hook navigasi
  return (
    <nav className="flex items-center justify-between px-8 py-4">
      <div className="flex items-center gap-2 font-bold text-sky-900 text-lg">
        <Shield size={20} className="text-sky-700" strokeWidth={1.5} />
        InsurTech
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-1.5 rounded-lg border border-sky-900 text-sm font-semibold text-sky-900 hover:bg-gray-50 transition"
        >
          Masuk
        </button>
        <button
          onClick={() => navigate('/register')}
          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-sky-900 to-sky-400 text-white text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
        >
          Daftar
        </button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-200 via-blue-150 to-slate-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-nowrap items-center justify-between gap-4 md:gap-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-sky-950 leading-tight mb-3">
            Perlindungan<br />Masa Depan<br />
            <span className="text-white">Dimulai Hari Ini</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-xs">
            Asuransi kesehatan, jiwa, dan properti dalam satu platform digital.
            Proses klaim cepat, premi terjangkau, dan dukungan 24/7.
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center justify-end gap-0 md:gap-1">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="bg-sky-300 rounded-1xl w-28 h-44 sm:w-36 sm:h-52 md:w-40 md:h-60 absolute bottom-0 left-1/2 -translate-x-1/2" />
              <img
                src={agen}
                alt="Agen InsurTech"
                className="relative z-10 w-36 h-48 sm:w-44 sm:h-56 md:w-52 md:h-72 object-contain drop-shadow-xl"
              />
            </div>
            <div className="bg-white rounded-full px-2 py-1 sm:px-3 sm:py-1.5 shadow text-[10px] sm:text-xs font-semibold text-sky-800 flex items-center gap-1 whitespace-nowrap -mt-2 z-20">
              <Shield size={10} className="text-sky-600" />
              Asuransi Digital Terpercaya
            </div>
          </div>
          <img
            src={asuransiBox}
            alt="Produk Asuransi"
            className="w-36 h-48 sm:w-44 sm:h-56 md:w-52 md:h-72 object-contain drop-shadow-lg"
          />
        </div>
      </div>
      <div className="bg-sky-950 shadow-lg mt-4">
        <div className="max-w-5xl mx-auto px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-white text-3xl font-extrabold">{value}</p>
              <p className="text-white text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TentangKami() {
  return (
    <section className="bg-stone-50 py-20 px-8">
      <div className="max-w-5xl mx-auto flex flex-row items-center gap-6 md:gap-12">
        <div className="flex-1">
          <p className="text-sm text-gray-400 font-semibold mb-3">Tentang Kami</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 leading-snug mb-5">
            <span className="text-sky-700">InsurTech</span> adalah<br />
            asuransi digital<br />terpercaya
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Kami percaya bahwa setiap orang berhak mendapatkan perlindungan finansial
            yang mudah, cepat, dan transparan. InsurTech hadir untuk merevolusi industri
            asuransi di Indonesia melalui teknologi.
          </p>
        </div>
        <img
          src={keluarga}
          alt="Keluarga"
          className="w-32 sm:w-48 md:w-64 object-contain flex-shrink-0"
        />
      </div>
    </section>
  );
}

function Produk() {
  return (
    <section className="bg-stone-50 py-16 px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Perlindungan Untuk <span className="text-sky-700">Setiap Kebutuhan</span>
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Pilih perlindungan yang sesuai dengan kebutuhan Anda. Premi terjangkau, manfaat maksimal.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          {products.map(({ icon, title, desc, color, iconBg }) => (
            <div key={title} className={`${color} border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition`}>
              <div className={`${iconBg} w-10 h-10 rounded-xl flex items-center justify-center text-xl`}>
                {icon}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              <p className="text-sm font-bold text-gray-800 mt-auto">{title}</p>
            </div>
          ))}
        </div>

        {/* card keunggulan */}
        <div className="bg-blue-400 rounded-2xl p-8">
          <h3 className="text-white text-2xl font-extrabold text-center mb-6">
            Keunggulan Kami Untuk Anda
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {keunggulan.map(({ icon, label }) => (
              <div key={label} className="bg-white/40 rounded-xl px-4 py-2 flex items-center gap-2 w-auto">
                {icon}
                <span className="text-sky-950 font-semibold text-sm whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-950 py-14 px-8">
      <div className="max-w-5xl mx-auto text-center">
        <h3 className="text-white text-2xl font-bold mb-8">Hubungi Kami</h3>
        <div className="flex flex-col items-center gap-4 text-gray-400 text-sm">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-500" />
            <span>Jl. Gatot Subroto No. 88, Jakarta 12190, Indonesia</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-gray-500" />
            <span>1500-888</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-gray-500" />
            <span>support@insurtech.com</span>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-xs text-gray-600">
          © 2025 InsurTech. Hak Cipta Dilindungi.{' '}
          <a href="#" className="text-gray-600 hover:underline">Kebijakan Privasi</a>{' '}
          &{' '}
          <a href="#" className="text-gray-600 hover:underline">Syarat & Ketentuan</a>
        </div>
      </div>
    </footer>
  );
}