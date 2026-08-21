import React, { useState, useEffect } from 'react';
import { callAppScript } from '../../lib/api';
import { Loader2, Calendar as CalIcon, Filter, Download, Search, X, Edit2, Trash2 } from 'lucide-react';

export default function LaporanKehadiran() {
  const [data, setData] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [search, setSearch] = useState('');
  
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data absensi ini?')) return;
    setDeletingId(id);
    try {
      await callAppScript('delete_absensi', { id });
      setData(data.filter(item => item.id !== id));
      alert('Data berhasil dihapus');
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await callAppScript('edit_absensi', editingItem);
      setData(data.map(item => item.id === editingItem.id ? editingItem : item));
      setEditingItem(null);
      alert('Data berhasil diperbarui');
    } catch (err: any) {
      alert('Gagal memperbarui: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [absensiRes, siswaRes] = await Promise.all([
        callAppScript('get_semua_absensi'),
        callAppScript('get_siswa')
      ]);
      setData(absensiRes || []);
      setStudents(siswaRes || []);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Action tidak dikenali')) {
        alert("PENTING: Google Apps Script Anda masih menggunakan versi lama. Silakan ikuti panduan: Buka Apps Script -> Terapkan (Deploy) -> Kelola deployment -> Edit -> Pilih 'Versi Baru' (New version) -> Terapkan.");
      }
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

  const filteredData = data.filter(item => {
    if (!item.tanggal) return false;
    const itemDate = new Date(item.tanggal).toISOString().split('T')[0];
    const dateMatch = itemDate >= startDate && itemDate <= endDate;
    
    const namaMatch = String(getStudentName(item.siswa_id, item.nama_siswa)).toLowerCase().includes(search.toLowerCase());
    
    return dateMatch && namaMatch;
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

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedStudentAbsensi = data.filter(item => item.siswa_id === selectedStudentId);

  // Hitung rekap untuk siswa terpilih
  const rekap = {
    hadir: selectedStudentAbsensi.filter(a => a.status?.toLowerCase() === 'hadir').length,
    sakit: selectedStudentAbsensi.filter(a => a.status?.toLowerCase() === 'sakit').length,
    ijin: selectedStudentAbsensi.filter(a => a.status?.toLowerCase() === 'ijin').length,
    alpa: selectedStudentAbsensi.filter(a => a.status?.toLowerCase() === 'alpa').length,
    pulang: selectedStudentAbsensi.filter(a => a.status?.toLowerCase() === 'pulang').length,
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
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cari Siswa</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
              <input 
                type="text" 
                placeholder="Nama siswa..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>
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
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" /></td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium text-sm">Tidak ada data kehadiran yang sesuai filter.</td></tr>
              ) : filteredData.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedStudentId(item.siswa_id)} 
                      className="font-bold text-emerald-600 hover:text-emerald-800 text-left hover:underline"
                    >
                      {getStudentName(item.siswa_id, item.nama_siswa)}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-slate-500">{getStudentKelas(item.siswa_id, item.kelas_siswa)}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingItem(item)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="text-rose-600 hover:text-rose-900 bg-rose-50 p-1.5 rounded-lg disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Rekap Kehadiran Siswa */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold uppercase tracking-tight text-slate-800">Detail Rekap Kehadiran</h3>
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
              
              <div className="grid grid-cols-5 gap-3 mb-6">
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
                  <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Hadir</div>
                  <div className="text-2xl font-black text-slate-800">{rekap.hadir}</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-center">
                  <div className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Sakit</div>
                  <div className="text-2xl font-black text-slate-800">{rekap.sakit}</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-center">
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Ijin</div>
                  <div className="text-2xl font-black text-slate-800">{rekap.ijin}</div>
                </div>
                <div className="bg-rose-50 rounded-xl p-3 border border-rose-100 text-center">
                  <div className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Alpa</div>
                  <div className="text-2xl font-black text-slate-800">{rekap.alpa}</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 text-center">
                  <div className="text-[10px] font-black text-purple-600 uppercase tracking-wider">Pulang</div>
                  <div className="text-2xl font-black text-slate-800">{rekap.pulang}</div>
                </div>
              </div>

              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-3">Riwayat Presensi</h4>
              {selectedStudentAbsensi.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada riwayat kehadiran.</p>
              ) : (
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase">Tanggal</th>
                        <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-[11px] font-black text-slate-400 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedStudentAbsensi.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map((a, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-600">{new Date(a.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${getStatusColor(a.status)}`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setSelectedStudentId(null); setEditingItem(a); }} className="text-blue-600 hover:text-blue-900 p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id} className="text-rose-600 hover:text-rose-900 p-1 disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
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
        </div>
      )}

      {/* Modal Edit Absensi */}
      {editingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl my-8">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold uppercase tracking-tight text-slate-800">Edit Data Absensi</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
                <input type="date" required value={editingItem.tanggal?.split('T')[0]} onChange={e => setEditingItem({...editingItem, tanggal: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Status Kehadiran</label>
                <select required value={editingItem.status} onChange={e => setEditingItem({...editingItem, status: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-emerald-500 outline-none">
                  <option value="Hadir">Hadir</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Ijin">Ijin</option>
                  <option value="Alpa">Alpa</option>
                  <option value="Pulang">Pulang</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
