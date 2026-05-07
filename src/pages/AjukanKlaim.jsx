import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

export default function AjukanKlaim() {
  const polisList = [
    { id: 'P-101', name: 'Asuransi Kesehatan' },
    { id: 'P-102', name: 'Asuransi Properti' },
    { id: 'P-205', name: 'Asuransi Kendaraan' },
  ];

  const jenisKlaimList = ['Rawat Inap', 'Kecelakaan', 'Kebakaran', 'Pencurian', 'Kerusakan'];

  const [formData, setFormData] = useState({
    polisId: '',
    jenisKlaim: '',
    jumlah: '',
    tanggalKejadian: '',
    deskripsi: '',
    dokumen: null,
  });

  const [fileName, setFileName] = useState('');
  const [statusDraft, setStatusDraft] = useState('Draft Tersimpan');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'dokumen' && files && files[0]) {
      setFormData({ ...formData, dokumen: files[0] });
      setFileName(files[0].name);
    } else {
      setFormData({ ...formData, [name]: value });
      setStatusDraft('Draft Tersimpan');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Data Klaim:', formData);
    alert('Klaim berhasil diajukan! Status akan diperbarui dalam 24-48 jam.');
    setStatusDraft('Draft Terkirim');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 to-sky-800 px-6 py-5">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Ajukan Klaim</h1>
          <p className="text-blue-100 text-sm mt-1">Isi formulir klaim dengan data yang benar dan lengkap.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 md:p-8 space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Polis</label>
              <select
                name="polisId"
                value={formData.polisId}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-stone-300"
              >
                <option value="">-- Pilih polis --</option>
                {polisList.map(polis => (
                  <option key={polis.id} value={polis.id}>{polis.id} - {polis.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Klaim</label>
              <select
                name="jenisKlaim"
                value={formData.jenisKlaim}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-stone-300"
              >
                <option value="">-- Pilih jenis klaim --</option>
                {jenisKlaimList.map((jk, idx) => (
                  <option key={idx} value={jk}>{jk}</option>
                ))}
              </select>
            </div>

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

          {/* Footer Bar - Estimasi, Status, Tombol */}
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
              className="w-full flex items-center justify-center gap-2 bg-sky-950 hover:bg-sky-800 text-white font-bold py-3 px-4 rounded-xl transition transform hover:scale-105"
            >
              Ajukan Klaim
              <FaPaperPlane />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}