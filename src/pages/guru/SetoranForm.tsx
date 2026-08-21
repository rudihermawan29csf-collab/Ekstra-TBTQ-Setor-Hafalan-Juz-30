import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { SURAH_NAMES } from '../../lib/constants';
import { callAppScript } from '../../lib/api';

interface Student {
  id: string;
  nama: string;
  kelas: string;
}

export default function SetoranForm() {
  const [siswa, setSiswa] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [surah, setSurah] = useState('');
  const [ayatMulai, setAyatMulai] = useState('');
  const [ayatSelesai, setAyatSelesai] = useState('');
  const [jenis, setJenis] = useState('Hafalan Baru');
  const [nilai, setNilai] = useState('Lancar');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const data = await callAppScript('get_siswa');
      setStudents(data || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswa) {
      alert('Silakan pilih siswa terlebih dahulu.');
      return;
    }
    setIsSubmitting(true);
    try {
      await callAppScript('simpan_setoran', {
        siswa_id: siswa,
        tanggal,
        surah,
        ayat_mulai: ayatMulai,
        ayat_selesai: ayatSelesai,
        jenis,
        nilai,
        catatan
      });
      alert('Berhasil! Data setoran telah disimpan ke Spreadsheet.');
      
      // Reset form sebagian
      setSurah('');
      setAyatMulai('');
      setAyatSelesai('');
      setCatatan('');
      setNilai('Lancar');
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Setor Hafalan</h1>
        <p className="text-sm text-slate-500 italic mt-1">Catat setoran hafalan baru atau murojaah siswa.</p>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSimpan} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Siswa</label>
              <div className="relative">
                <select 
                  required
                  value={siswa}
                  onChange={e => setSiswa(e.target.value)}
                  disabled={isLoadingStudents}
                  className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium disabled:bg-slate-50"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.kelas})</option>
                  ))}
                </select>
                {isLoadingStudents && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal Setoran</label>
              <input 
                type="date"
                required
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Surah</label>
              <select 
                required
                value={surah}
                onChange={e => setSurah(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium"
              >
                <option value="">-- Pilih Surah --</option>
                {Object.entries(SURAH_NAMES).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ayat Mulai</label>
                <input 
                  type="number"
                  min="1"
                  required
                  value={ayatMulai}
                  onChange={e => setAyatMulai(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ayat Selesai</label>
                <input 
                  type="number"
                  min="1"
                  required
                  value={ayatSelesai}
                  onChange={e => setAyatSelesai(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jenis Setoran</label>
              <select 
                value={jenis}
                onChange={e => setJenis(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium"
              >
                <option value="Hafalan Baru">Hafalan Baru</option>
                <option value="Murojaah">Murojaah</option>
                <option value="Mengulang Setoran">Mengulang Setoran</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Penilaian</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Sangat Lancar', 'Lancar', 'Cukup', 'Perlu Perbaikan'].map(opt => (
                  <label key={opt} className={`
                    border rounded-xl px-3 py-3 flex items-center justify-center cursor-pointer text-sm font-bold transition-colors
                    ${nilai === opt ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}
                  `}>
                    <input 
                      type="radio" 
                      name="nilai" 
                      value={opt} 
                      checked={nilai === opt}
                      onChange={() => setNilai(opt)}
                      className="sr-only" 
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Catatan Guru (Opsional)</label>
              <textarea 
                rows={3}
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium"
                placeholder="Contoh: Sudah lancar, perlu memperbaiki panjang pendek bacaan."
              ></textarea>
            </div>
          </div>
          <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 uppercase tracking-wider transition-colors shadow-emerald-200 disabled:opacity-50"
            >
              <Save className="mr-2 -ml-1 h-5 w-5" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Setoran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
