#!/bin/bash

# 1. Create InputKehadiran for Guru
cat << 'INNER_EOF' > src/pages/guru/InputKehadiran.tsx
import React, { useState, useEffect } from 'react';
import { callAppScript } from '../../lib/api';
import { Loader2, CheckCircle } from 'lucide-react';

export default function InputKehadiran() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const [tanggal, setTanggal] = useState(today);
  const [siswaId, setSiswaId] = useState('');
  const [status, setStatus] = useState('Hadir');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await callAppScript('get_siswa');
      setStudents(data || []);
      if (data && data.length > 0) setSiswaId(data[0].id);
    } catch (error) {
      console.error(error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await callAppScript('simpan_absensi', {
        siswa_id: siswaId,
        tanggal,
        status
      });
      alert('Kehadiran berhasil disimpan!');
    } catch (error: any) {
      alert('Gagal menyimpan kehadiran: ' + error.message);
      if (error.message?.includes('Action tidak dikenali')) {
        alert("PENTING: Pastikan Google Apps Script Anda sudah di-Deploy sebagai VERSI BARU.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Input Kehadiran</h1>
      <p className="text-sm text-slate-500 italic mt-1">Masukkan data presensi Ekstra TBTQ untuk siswa.</p>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 max-w-xl">
        <h2 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" /> Form Input Absensi
        </h2>
        
        {fetchLoading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
              <input 
                type="date" 
                required 
                value={tanggal} 
                onChange={e => setTanggal(e.target.value)} 
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Siswa</label>
              <select 
                value={siswaId} 
                onChange={e => setSiswaId(e.target.value)} 
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.nama} ({s.kelas})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Status Kehadiran</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)} 
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
              >
                <option value="Hadir">Hadir</option>
                <option value="Sakit">Sakit</option>
                <option value="Ijin">Ijin</option>
                <option value="Alpa">Alpa</option>
                <option value="Pulang">Pulang</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Kehadiran'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
INNER_EOF

# 2. Update RiwayatHafalan to show names properly and add Modal Detail
cat << 'INNER_EOF' > src/pages/guru/RiwayatHafalan.tsx
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
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-slate-600">Surah {item.surah}</div><div className="text-[11px] text-slate-400">Ayat {item.ayat_mulai} - {item.ayat_selesai}</div></td>
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
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-slate-700">{s.surah}</td>
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
INNER_EOF

# 3. Create ProgressSiswa with similar functionality
cat << 'INNER_EOF' > src/pages/guru/ProgressSiswa.tsx
import React, { useState, useEffect } from 'react';
import { callAppScript } from '../../lib/api';
import { Loader2, Search, X, BarChart } from 'lucide-react';

export default function ProgressSiswa() {
  const [setoran, setSetoran] = useState<any[]>([]);
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
      setSetoran(setoranRes || []);
      setStudents(siswaRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const progressData = students.map(student => {
    const studentSetoran = setoran.filter(s => s.siswa_id === student.id);
    const lastSetoran = studentSetoran.length > 0 
      ? studentSetoran.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0]
      : null;
    
    return {
      ...student,
      totalSetoran: studentSetoran.length,
      lastSetoranDate: lastSetoran ? lastSetoran.tanggal : null,
      lastSurah: lastSetoran ? lastSetoran.surah : '-'
    };
  });

  const filtered = progressData.filter(item => 
    item.nama.toLowerCase().includes(search.toLowerCase()) || 
    item.kelas.toLowerCase().includes(search.toLowerCase())
  );

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedStudentSetoran = setoran.filter(item => item.siswa_id === selectedStudentId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Progress Siswa</h1>
      
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
            <input type="text" placeholder="Cari nama siswa..." className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl sm:text-sm font-medium" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Nama Siswa / Kelas</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Setoran</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Setoran Terakhir</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium">Data tidak ditemukan.</td></tr>
              ) : filtered.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{item.nama}</div>
                    <div className="text-xs text-emerald-600 font-bold">{item.kelas}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-black text-sm">
                      {item.totalSetoran}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.lastSetoranDate ? (
                      <div>
                        <div className="text-sm font-bold text-slate-700">Surah {item.lastSurah}</div>
                        <div className="text-[11px] text-slate-400">{new Date(item.lastSetoranDate).toLocaleDateString('id-ID')}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Belum ada</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => setSelectedStudentId(item.id)} 
                      className="inline-flex items-center text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <BarChart className="h-3 w-3 mr-1.5" /> Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Sama seperti di Riwayat */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold uppercase tracking-tight text-slate-800">Detail Progress Siswa</h3>
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
                <div className="mb-6 text-sm text-slate-500 italic">Data siswa tidak ditemukan.</div>
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
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-slate-700">{s.surah}</td>
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
INNER_EOF

# 4. Update AppLayout
sed -i '/name: .Laporan Kehadiran./i \    { name: '"'"'Input Kehadiran'"'"', to: '"'"'/guru/input-kehadiran'"'"', icon: Calendar },' src/components/AppLayout.tsx

# 5. Update App.tsx
sed -i '/import LaporanKehadiran/i import InputKehadiran from '"'"'./pages/guru/InputKehadiran'"'"';' src/App.tsx
sed -i '/<Route path="guru\/kehadiran"/i \        <Route path="guru/input-kehadiran" element={<ProtectedRoute role="teacher"><InputKehadiran /></ProtectedRoute>} />' src/App.tsx

