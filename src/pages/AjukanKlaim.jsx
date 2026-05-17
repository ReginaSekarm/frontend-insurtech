import { useState, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function AjukanKlaim() {
  const navigate = useNavigate();
  const [userPolisList, setUserPolisList] = useState([]);
  const [formData, setFormData] = useState({
    polisId: '',
    polisJenis: '',
    jenisKlaim: '',
    jumlah: '',
    tanggalKejadian: '',
    deskripsi: '',
    dokumen: null,
  });
  const [fileName, setFileName] = useState('');
  const [statusDraft, setStatusDraft] = useState('Draft Tersimpan');
  const [showPopup, setShowPopup] = useState(false);

  
  useEffect(() => {
    const stored = localStorage.getItem('userPolis');
    if (stored) {
      const polisArray = JSON.parse(stored);
      setUserPolisList(polisArray);
    } else {
      setUserPolisList([]);
    }
  }, []);

  const getAvailableClaimsByJenis = (jenis) => {
    if (jenis.includes('Kesehatan')) return ['Rawat Inap', 'Kecelakaan', 'Kerusakan Fisik'];
    if (jenis.includes('Properti')) return ['Kebakaran', 'Pencurian', 'Kerusakan'];
    if (jenis.includes('Kendaraan')) return ['Kecelakaan', 'Pencurian', 'Kerusakan'];
    if (jenis.includes('Pendidikan')) return ['Klaim Biaya Pendidikan', 'Kecelakaan Anak'];
    return [];
  };

  const formatTanggalForTransaction = (date) => {
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTanggalFull = (date) => {
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handlePolisChange = (e) => {
    const polisId = e.target.value;
    const selectedPolis = userPolisList.find(p => p.id.toString() === polisId);
    if (selectedPolis) {
      setFormData(prev => ({
        ...prev,
        polisId,
        polisJenis: selectedPolis.jenis,
        jenisKlaim: ''
      }));
    } else {
      setFormData(prev => ({ ...prev, polisId, polisJenis: '', jenisKlaim: '' }));
    }
    setStatusDraft('Draft Tersimpan');
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'dokumen' && files && files[0]) {
      setFormData({ ...formData, dokumen: files[0] });
      setFileName(files[0].name);
    } else if (name === 'polisId') {
      handlePolisChange(e);
    } else {
      setFormData({ ...formData, [name]: value });
      setStatusDraft('Draft Tersimpan');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.polisId || !formData.jenisKlaim || !formData.jumlah || !formData.tanggalKejadian || !formData.deskripsi || !formData.dokumen) {
      alert('Harap lengkapi semua data!');
      return;
    }

    const selectedPolis = userPolisList.find(p => p.id.toString() === formData.polisId);
    if (!selectedPolis) {
      alert('Polis tidak valid');
      return;
    }

    const newClaim = {
      id: Date.now(),
      jenis: selectedPolis.jenis,
      noPolis: selectedPolis.noPolis,
      tglPengajuan: formatTanggalFull(new Date()),
      tglPencairan: 'Menunggu Verifikasi',
      status: 'DIPROSES',
      jumlah: `Rp ${parseInt(formData.jumlah || 0).toLocaleString('id-ID')}`,
    };
    const existingClaims = JSON.parse(localStorage.getItem('userKlaim') || '[]');
    existingClaims.push(newClaim);
    localStorage.setItem('userKlaim', JSON.stringify(existingClaims));

    const newTransaction = {
    id: Date.now(),
    nama: `Klaim ${selectedPolis.jenis}`,
    nominal: parseInt(formData.jumlah),
    tanggal: formatTanggalForTransaction(new Date()),
    tipe: 'klaim',
    noPolis: selectedPolis.noPolis,
    };
    const existingTrans = JSON.parse(localStorage.getItem('userTransaksi') || '[]');
    existingTrans.push(newTransaction);
    localStorage.setItem('userTransaksi', JSON.stringify(existingTrans));

    console.log('Data Klaim:', formData);
    setStatusDraft('Draft Terkirim');
    setShowPopup(true);
  };

  const handleGoToStatus = () => {
    setShowPopup(false);
    navigate('/status-klaim');
  };

  const availableClaims = formData.polisId ? getAvailableClaimsByJenis(
    userPolisList.find(p => p.id.toString() === formData.polisId)?.jenis || ''
  ) : [];

  return (
    <div className="min-h-screen py-10 px-4 relative">
      <div className="bg-gray-100 max-w-4xl mx-auto rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-sky-950 to-sky-800 px-6 py-5">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Ajukan Klaim</h1>
          <p className="text-blue-100 text-sm mt-1">Isi formulir klaim dengan data yang benar dan lengkap.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 md:p-8 space-y-5">
            {/* Pilih Polis */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Polis</label>
              <select
                name="polisId"
                value={formData.polisId}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-stone-300"
              >
                <option value="">Pilih polis</option>
                {userPolisList.map(polis => (
                  <option key={polis.id} value={polis.id}>{polis.noPolis} - {polis.jenis}</option>
                ))}
              </select>
              {userPolisList.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Anda belum memiliki polis. Silakan beli produk terlebih dahulu.</p>
              )}
            </div>

            {/* Jenis Klaim */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Klaim</label>
              <select
                name="jenisKlaim"
                value={formData.jenisKlaim}
                onChange={handleChange}
                required
                disabled={!formData.polisId}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-stone-300 disabled:bg-gray-200"
              >
                <option value="">Pilih jenis klaim</option>
                {availableClaims.map((claim, idx) => (
                  <option key={idx} value={claim}>{claim}</option>
                ))}
              </select>
              {!formData.polisId && (
                <p className="text-xs text-gray-500 mt-1">Pilih polis terlebih dahulu</p>
              )}
            </div>

            {/* Jumlah & Tanggal Kejadian */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah (Rp)</label>
                <input
                  type="number"
                  name="jumlah"
                  value={formData.jumlah}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-stone-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Kejadian</label>
                <input
                  type="date"
                  name="tanggalKejadian"
                  value={formData.tanggalKejadian}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-stone-300"
                />
              </div>
            </div>

            {/* Deskripsi Kejadian */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Kejadian</label>
              <textarea
                name="deskripsi"
                rows="4"
                value={formData.deskripsi}
                onChange={handleChange}
                placeholder="Ceritakan kronologi kejadian secara lengkap..."
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-stone-300"
              />
            </div>

            {/* Dokumen Pendukung */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dokumen Pendukung</label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  name="dokumen"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleChange}
                  className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">📸 FOTO</span>
                  <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">📄 KTP.pdf</span>
                  {fileName && (
                    <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">📄 {fileName}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">Format: JPG, PNG, PDF (maks 5MB)</p>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-200">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Estimasi Verifikasi</p>
                <p className="text-sm font-bold text-sky-900 mt-0.5">24 - 48 Jam Kerja</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</p>
                <p className="text-sm font-bold text-blue-400 mt-0.5">{statusDraft}</p>
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-sky-950 hover:bg-sky-800 text-white font-bold py-3 px-4 rounded-xl transition"
            >
              Ajukan Klaim
              <FaPaperPlane />
            </button>
          </div>
        </form>
      </div>

      {/* Popup sukses */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Klaim Berhasil Diajukan!</h3>
              <p className="text-gray-600 text-sm mt-2">Status klaim akan diperbarui dalam 24-48 jam.</p>
              <div className="mt-6">
                <button
                  onClick={handleGoToStatus}
                  className="w-full bg-sky-950 hover:bg-sky-800 text-white font-semibold py-2 rounded-lg transition"
                >
                  Lihat Status Klaim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}