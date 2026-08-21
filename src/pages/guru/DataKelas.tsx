import React, { useState, useEffect } from 'react';
import { callAppScript } from '../../lib/api';
import { Loader2, Plus, Trash2 } from 'lucide-react';

export default function DataKelas() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [namaKelas, setNamaKelas] = useState('');
  const [waliKelas, setWaliKelas] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await callAppScript('get_kelas');
      setData(result || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await callAppScript('add_kelas', { nama_kelas: namaKelas, wali_kelas: waliKelas });
      setNamaKelas(''); setWaliKelas('');
      fetchData();
    } catch (err) { alert('Gagal menambah kelas'); }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('Hapus kelas ini?')) return;
    try {
      await callAppScript('delete_kelas', { id });
      fetchData();
    } catch (err) { alert('Gagal menghapus'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Kelas</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border md:col-span-1 h-fit">
          <h2 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Tambah Kelas Baru</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <input type="text" placeholder="Nama Kelas (ex: VII A)" required value={namaKelas} onChange={e => setNamaKelas(e.target.value)} className="w-full border rounded-xl p-3 text-sm" />
            <input type="text" placeholder="Nama Wali Kelas" required value={waliKelas} onChange={e => setWaliKelas(e.target.value)} className="w-full border rounded-xl p-3 text-sm" />
            <button type="submit" className="w-full flex justify-center items-center py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm"><Plus className="h-4 w-4 mr-2"/> Tambah</button>
          </form>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border md:col-span-2 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr><th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase">Nama Kelas</th><th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase">Wali Kelas</th><th className="px-6 py-4"></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-slate-500">Belum ada data kelas.</td></tr>
              ) : data.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 font-bold text-slate-900">{item.nama_kelas}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.wali_kelas}</td>
                  <td className="px-6 py-4 text-right"><button onClick={() => handleDelete(item.id)} className="text-rose-500 p-2"><Trash2 className="h-4 w-4"/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
