import { useAuth } from '../../lib/AuthContext';
import { Book, Award, Clock } from 'lucide-react';

export default function DashboardSiswa() {
  const { user } = useAuth();

  const surahProgress = [
    { name: "An-Naba'", current: 40, total: 40, status: 'Selesai' },
    { name: "An-Nazi'at", current: 28, total: 46, status: 'Sedang berjalan' },
    { name: "'Abasa", current: 0, total: 42, status: 'Belum mulai' },
  ];

  const recentRecords = [
    { date: '20-08-2026', surah: "An-Naba'", ayat: '1–5', type: 'Baru', note: 'Lancar' },
    { date: '27-08-2026', surah: "An-Naba'", ayat: '6–10', type: 'Baru', note: 'Sangat Lancar' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-1">Assalamu'alaikum</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">{user?.nama}</h1>
          <p className="text-emerald-50 mb-6 text-sm font-medium">Kelas VIII A • Tahun Pelajaran 2026/2027</p>
          
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-sm">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-emerald-50 uppercase tracking-wider">Progress Hafalan Juz 30</span>
              <span className="text-3xl font-black">45%</span>
            </div>
            <div className="w-full bg-emerald-800/50 rounded-full h-3 mb-2 overflow-hidden">
              <div className="bg-white h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
            <p className="text-[11px] font-bold text-emerald-100 text-right uppercase tracking-wider">180 / 564 ayat</p>
          </div>
        </div>
        
        {/* Decorative circle */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full opacity-50 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
            <Book size={24} />
          </div>
          <p className="text-3xl font-black text-slate-900">5</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Surah Selesai</p>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4">
            <Award size={24} />
          </div>
          <p className="text-3xl font-black text-slate-900">18</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Setoran</p>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4">
            <Clock size={24} />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1 mb-1">20 Agu 26</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Setoran Terakhir</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Target & Progress Surah</h2>
          </div>
          <div className="p-6 space-y-6">
            {surahProgress.map((surah, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${surah.status === 'Selesai' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : surah.status === 'Sedang berjalan' ? 'bg-amber-400' : 'bg-slate-300'}`}></span>
                    <span className="text-sm font-bold text-slate-800">{surah.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{surah.current} / {surah.total} ayat</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${surah.status === 'Selesai' ? 'bg-emerald-500' : 'bg-amber-400'}`} 
                    style={{ width: `${(surah.current / surah.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Riwayat Terakhir</h2>
          </div>
          <div className="p-0 flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-400 bg-slate-50 border-b border-slate-100 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Tanggal & Surah</th>
                  <th className="px-6 py-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRecords.map((record, idx) => (
                  <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{record.surah} <span className="text-slate-400 font-medium text-xs ml-1">ayat {record.ayat}</span></p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{record.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                        {record.note}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
