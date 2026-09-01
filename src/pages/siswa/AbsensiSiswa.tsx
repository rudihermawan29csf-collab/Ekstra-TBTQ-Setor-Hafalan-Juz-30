import React, { useState, useEffect } from 'react';
import { callAppScript } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { Loader2, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function AbsensiSiswa() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const [tanggal, setTanggal] = useState(today);
  const [status, setStatus] = useState('Hadir');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await callAppScript('get_absensi_siswa', { siswa_id: user?.siswa_id });
      setHistory(data || []);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('Action tidak dikenali')) {
         alert("PENTING: Google Apps Script Anda masih menggunakan versi lama. Silakan ikuti panduan: Buka Apps Script -> Terapkan (Deploy) -> Kelola deployment -> Edit -> Pilih 'Versi Baru' (New version) -> Terapkan.");
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await callAppScript('simpan_absensi', {
        siswa_id: user?.siswa_id,
        tanggal,
        status
      });
      alert('Kehadiran berhasil disimpan!');
      fetchHistory();
    } catch (error: any) {
      alert('Gagal menyimpan kehadiran: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (s: string) => {
    switch(s?.toLowerCase()) {
      case 'hadir': return 'bg-emerald-50 text-emerald-600';
      case 'sakit': return 'bg-amber-50 text-amber-600';
      case 'ijin': return 'bg-blue-50 text-blue-600';
      case 'alpa': return 'bg-rose-50 text-rose-600';
      case 'pulang': return 'bg-purple-50 text-purple-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kehadiran Siswa</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-fit md:col-span-1">
          <h2 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" /> Form Absensi
          </h2>
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
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 md:col-span-2">
          <h2 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" /> Riwayat Kehadiran Anda
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase">Waktu Simpan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyLoading ? (
                  <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" /></td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-slate-500 text-sm">Belum ada riwayat kehadiran.</td></tr>
                ) : history.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-slate-700">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-slate-400">
                      {new Date(item.timestamp).toLocaleString('id-ID')}
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
