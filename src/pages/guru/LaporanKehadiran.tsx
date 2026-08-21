import React, { useState, useEffect } from 'react';
import { callAppScript } from '../../lib/api';
import { Loader2, Calendar as CalIcon, Filter, Download } from 'lucide-react';

export default function LaporanKehadiran() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await callAppScript('get_semua_absensi');
      setData(result || []);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Action tidak dikenali')) {
        alert("PENTING: Google Apps Script Anda masih menggunakan versi lama. Silakan ikuti panduan: Buka Apps Script -> Terapkan (Deploy) -> Kelola deployment -> Edit -> Pilih 'Versi Baru' (New version) -> Terapkan.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    if (!item.tanggal) return false;
    const itemDate = new Date(item.tanggal).toISOString().split('T')[0];
    return itemDate >= startDate && itemDate <= endDate;
  }).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Kehadiran</h1>
          <p className="text-sm text-slate-500 italic mt-1">Rekap absensi siswa Ekstra TBTQ</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dari Tanggal</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sampai Tanggal</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </button>
            <button className="flex items-center px-4 py-2.5 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-100 transition-colors">
              <Download className="h-4 w-4 mr-2" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Nama Siswa</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" /></td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium text-sm">Tidak ada data kehadiran pada rentang tanggal tersebut.</td></tr>
              ) : filteredData.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="font-bold text-slate-900">{item.nama_siswa || item.siswa_id}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-slate-500">{item.kelas_siswa || '-'}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
