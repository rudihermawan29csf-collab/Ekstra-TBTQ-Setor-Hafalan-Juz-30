import React, { useState, useEffect } from 'react';
import { callAppScript } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { getSurahName, SURAH_NAMES } from '../../lib/constants';
import { Loader2, BarChart } from 'lucide-react';

export default function ProgressDetailSiswa() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const setoranRes = await callAppScript('get_setoran');
      const studentRecords = (setoranRes || []).filter((s: any) => s.siswa_id === user?.siswa_id);
      setData(studentRecords);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group by surah
  const surahProgress = Object.entries(SURAH_NAMES).map(([id, name]) => {
    const surahRecords = data.filter(r => r.surah === id);
    const isStarted = surahRecords.length > 0;
    
    // Simplification for progress: just check if there's any record for this surah.
    // In a real scenario, you'd calculate based on ayat_selesai vs total ayat.
    return {
      id,
      name,
      status: isStarted ? 'Disetor' : 'Belum Mulai',
      records: surahRecords
    };
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Progress Hafalan (Juz 30)</h1>
      <p className="text-sm text-slate-500 italic mt-1">Pantau perkembangan hafalan setiap surah Anda.</p>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <BarChart className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-900">Daftar Surah Juz 30</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {surahProgress.map((surah) => (
              <div key={surah.id} className={`p-4 rounded-2xl border ${surah.status === 'Disetor' ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="font-bold text-slate-900">{surah.name}</div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${surah.status === 'Disetor' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {surah.status}
                  </span>
                </div>
                {surah.records.length > 0 ? (
                  <div className="space-y-2 mt-3 pt-3 border-t border-slate-200/60">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Riwayat Setoran:</p>
                    {surah.records.map((r, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">Ayat {r.ayat_mulai}-{r.ayat_selesai}</span>
                        <span className="font-medium text-emerald-600">{new Date(r.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-2">Belum ada hafalan disetor.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
