import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { callAppScript } from '../../lib/api';

interface Student {
  id: string;
  nama: string;
  nisn: string;
  kelas: string;
  tahun: string;
  username: string;
  status: string;
}

export default function DataSiswa() {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState('');
  
  const [formData, setFormData] = useState({
    nama: '', nisn: '', kelas: '', tahun: '2026/2027', username: '', status: 'aktif'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await callAppScript('get_siswa');
      setStudents(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await callAppScript('edit_siswa', { id: editId, ...formData });
        alert('Siswa berhasil diupdate!');
      } else {
        await callAppScript('add_siswa', formData);
        alert('Siswa berhasil ditambahkan!');
      }
      setShowModal(false);
      fetchStudents();
    } catch (error: any) {
      alert('Gagal menyimpan: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (s: Student) => {
    setFormData({ nama: s.nama, nisn: s.nisn, kelas: s.kelas, tahun: s.tahun, username: s.username, status: s.status });
    setEditId(s.id);
    setIsEditMode(true);
    setShowModal(true);
  };

  const openAdd = () => {
    setFormData({ nama: '', nisn: '', kelas: '', tahun: '2026/2027', username: '', status: 'aktif' });
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('Yakin ingin menghapus siswa ini?')) return;
    try {
      await callAppScript('delete_siswa', { id });
      fetchStudents();
    } catch (err: any) {
      alert('Gagal hapus: ' + err.message);
    }
  };

  const filteredStudents = students.filter(s => 
    s.nama?.toLowerCase().includes(search.toLowerCase()) || 
    s.nisn?.includes(search) ||
    s.kelas?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Siswa</h1>
        </div>
        <button onClick={openAdd} className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors">
          <Plus className="mr-2 h-4 w-4" /> Tambah Siswa
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
            <input type="text" placeholder="Cari siswa..." className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl sm:text-sm font-medium" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">NISN / Kelas</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" /></td></tr>
              ) : filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="font-bold text-slate-900">{student.nama}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-slate-500">{student.nisn} - <span className="text-emerald-600">{student.kelas}</span></div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-slate-500">{student.username}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${student.status === 'aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{student.status}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => openEdit(student)} className="text-blue-600 p-2"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(student.id)} className="text-rose-600 p-2"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center"><h3 className="font-bold uppercase tracking-tight">{isEditMode ? 'Edit Siswa' : 'Tambah Siswa'}</h3><button onClick={() => setShowModal(false)}><X className="h-5 w-5" /></button></div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <input type="text" placeholder="Nama Lengkap" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full border rounded-xl p-3 text-sm" />
              <input type="text" placeholder="NISN" required value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} className="w-full border rounded-xl p-3 text-sm" />
              <input type="text" placeholder="Kelas" required value={formData.kelas} onChange={e => setFormData({...formData, kelas: e.target.value})} className="w-full border rounded-xl p-3 text-sm" />
              <input type="text" placeholder="Tahun Pelajaran" required value={formData.tahun} onChange={e => setFormData({...formData, tahun: e.target.value})} className="w-full border rounded-xl p-3 text-sm" />
              <input type="text" placeholder="Username Login" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full border rounded-xl p-3 text-sm" disabled={isEditMode} />
              {isEditMode && (
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded-xl p-3 text-sm">
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl font-bold text-sm">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm disabled:opacity-50">{isSubmitting ? 'Simpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
