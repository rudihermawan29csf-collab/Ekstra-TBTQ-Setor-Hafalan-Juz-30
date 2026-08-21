import { getSurahName } from '../../lib/constants';
import React, { useState, useEffect } from 'react';
import { callAppScript } from '../../lib/api';
import { Loader2, Search, X } from 'lucide-react';

export default function RiwayatHafalan() {
  const [data, setData] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [setoranRes, siswaRes] = await Promise.all([
        callAppScript('get_setoran'),
        callAppScript('get_siswa')
      ]);
      setData(setoranRes || []);
      setStudents(siswaRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (siswa_id: string, nama_siswa: string) => {
    if (nama_siswa) return nama_siswa;
    const student = students.find(s => s.id === siswa_id);
    return student ? student.nama : siswa_id;
  };

  const getStudentKelas = (siswa_id: string, kelas_siswa: string) => {
    if (kelas_siswa) return kelas_siswa;
    const student = students.find(s => s.id === siswa_id);
    return student ? student.kelas : '-';
  };

  const filtered = data.filter(item => {
    const namaMatch = String(getStudentName(item.siswa_id, item.nama_siswa)).toLowerCase().includes(search.toLowerCase());
    const surahMatch = String(item.surah || '').toLowerCase().includes(search.toLowerCase());
    return namaMatch || surahMatch;
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedStudentSetoran = data.filter(item => item.siswa_id === selectedStudentId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat Hafalan</h1>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
            <input type="text" placeholder="Cari nama atau surah..." className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl sm:text-sm font-medium" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Nama Siswa</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Surah & Ayat</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Nilai</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-medium">Belum ada riwayat setoran.</td></tr>
              ) : filtered.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => setSelectedStudentId(item.siswa_id)} className="font-bold text-emerald-600 hover:text-emerald-800 text-left hover:underline">
                      {getStudentName(item.siswa_id, item.nama_siswa)}
                    </button>
                    <div className="text-xs text-slate-400">{getStudentKelas(item.siswa_id, item.kelas_siswa)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-slate-600">{getSurahName(item.surah)}</div><div className="text-[11px] text-slate-400">Ayat {item.ayat_mulai} - {item.ayat_selesai}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.jenis}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-1 rounded">{item.nilai}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Siswa */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold uppercase tracking-tight text-slate-800">Detail Riwayat Siswa</h3>
              <button onClick={() => setSelectedStudentId(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              {selectedStudent ? (
                <div className="mb-6 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex gap-4 items-center">
                   <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 font-black text-xl">
                     {selectedStudent.nama.charAt(0)}
                   </div>
                   <div>
                     <h2 className="text-lg font-bold text-slate-900">{selectedStudent.nama}</h2>
                     <p className="text-sm text-slate-600 font-medium">NISN: {selectedStudent.nisn} • Kelas: <span className="text-emerald-700 font-bold">{selectedStudent.kelas}</span></p>
                   </div>
                </div>
              ) : (
                <div className="mb-6 text-sm text-slate-500 italic">Data siswa tidak ditemukan secara lengkap. ID: {selectedStudentId}</div>
              )}
              
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-3">Daftar Setoran ({selectedStudentSetoran.length})</h4>
              {selectedStudentSetoran.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada setoran.</p>
              ) : (
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase">Tanggal</th>
                        <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase">Surah</th>
                        <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase">Ayat</th>
                        <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase">Nilai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedStudentSetoran.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map((s, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-slate-600">{new Date(s.tanggal).toLocaleDateString('id-ID')}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-slate-700">{getSurahName(s.surah)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{s.ayat_mulai} - {s.ayat_selesai}</td>
                          <td className="px-4 py-3 whitespace-nowrap"><span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-1 rounded">{s.nilai}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
