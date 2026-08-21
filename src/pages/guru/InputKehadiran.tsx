import React, { useState, useEffect } from 'react';
import { callAppScript } from '../../lib/api';
import { Loader2, CheckCircle, Save } from 'lucide-react';

export default function InputKehadiran() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  const today = new Date().toISOString().split('T')[0];
  const [tanggal, setTanggal] = useState(today);
  
  // State for storing attendance status of each student
  // Default is implicitly 'Hadir' if not in this object
  const [attendances, setAttendances] = useState<Record<string, string>>({});
  const [savingProgress, setSavingProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await callAppScript('get_siswa');
      setStudents(data || []);
      
      // Initialize everyone to Hadir
      const initial: Record<string, string> = {};
      (data || []).forEach((s: any) => {
        initial[s.id] = 'Hadir';
      });
      setAttendances(initial);
      
    } catch (error) {
      console.error(error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleStatusChange = (siswaId: string, status: string) => {
    setAttendances(prev => ({
      ...prev,
      [siswaId]: status
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSavingProgress({ current: 0, total: students.length });
    
    try {
      let successCount = 0;
      for (const s of students) {
        const status = attendances[s.id] || 'Hadir';
        await callAppScript('simpan_absensi', {
          siswa_id: s.id,
          tanggal,
          status
        });
        successCount++;
        setSavingProgress({ current: successCount, total: students.length });
      }
      
      alert('Semua data kehadiran berhasil disimpan!');
    } catch (error: any) {
      alert('Gagal menyimpan kehadiran pada beberapa siswa: ' + error.message);
      if (error.message?.includes('Action tidak dikenali')) {
        alert("PENTING: Pastikan Google Apps Script Anda sudah di-Deploy sebagai VERSI BARU.");
      }
    } finally {
      setLoading(false);
      setSavingProgress({ current: 0, total: 0 });
    }
  };

  const statusOptions = ['Hadir', 'Sakit', 'Ijin', 'Alpa', 'Pulang'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Input Kehadiran</h1>
      <p className="text-sm text-slate-500 italic mt-1">Isi presensi harian untuk seluruh siswa Ekstra TBTQ.</p>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div className="w-full sm:max-w-xs">
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Tanggal Kehadiran</label>
            <input 
              type="date" 
              required 
              value={tanggal} 
              onChange={e => setTanggal(e.target.value)} 
              className="w-full border border-slate-300 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-slate-50" 
            />
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={loading || students.length === 0}
            className="w-full sm:w-auto flex justify-center items-center px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm shadow-emerald-200"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
                Menyimpan ({savingProgress.current}/{savingProgress.total})
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="h-4 w-4 mr-2" /> Simpan Semua Kehadiran
              </span>
            )}
          </button>
        </div>
        
        {fetchLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-medium">Belum ada data siswa.</div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider w-12">No</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Nama Siswa</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {students.map((s, index) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{s.nama}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleStatusChange(s.id, opt)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${
                              (attendances[s.id] || 'Hadir') === opt 
                                ? opt === 'Hadir' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/30'
                                : opt === 'Sakit' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-500/30'
                                : opt === 'Ijin' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/30'
                                : opt === 'Alpa' ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-500/30'
                                : 'bg-purple-100 text-purple-700 ring-1 ring-purple-500/30'
                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
