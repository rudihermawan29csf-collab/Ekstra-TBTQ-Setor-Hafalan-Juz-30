import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit, Trash2, X, Loader2 } from 'lucide-react';
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
  
  // Form state
  const [nama, setNama] = useState('');
  const [nisn, setNisn] = useState('');
  const [kelas, setKelas] = useState('');
  const [tahun, setTahun] = useState('2026/2027');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await callAppScript('get_siswa');
      setStudents(data || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await callAppScript('add_siswa', {
        nama,
        nisn,
        kelas,
        tahun,
        username
      });
      alert('Siswa berhasil ditambahkan! Password default adalah 123456');
      setShowModal(false);
      // Reset form
      setNama(''); setNisn(''); setKelas(''); setUsername('');
      // Refresh data
      fetchStudents();
    } catch (error: any) {
      alert('Gagal menambah siswa: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase()) || 
    s.nisn.includes(search) ||
    s.kelas.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Siswa</h1>
          <p className="text-sm text-slate-500 italic mt-1">Kelola data siswa yang mengikuti Ekstra TBTQ.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm shadow-emerald-200 transition-colors uppercase tracking-wider"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Siswa
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari siswa..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm font-medium"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">No</th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Nama Siswa</th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">NISN</th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Kelas</th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Username</th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Memuat Data...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-medium text-slate-500">
                    Belum ada data siswa.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{student.nama}</div>
                      <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mt-0.5">{student.tahun}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">{student.nisn}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md uppercase font-bold">{student.kelas}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">{student.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded border ${student.status === 'aktif' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Siswa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-full">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Tambah Siswa Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                  <input type="text" required value={nama} onChange={e => setNama(e.target.value)} className="w-full rounded-xl border border-slate-300 py-2.5 px-4 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">NISN</label>
                  <input type="text" required value={nisn} onChange={e => setNisn(e.target.value)} className="w-full rounded-xl border border-slate-300 py-2.5 px-4 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kelas</label>
                  <input type="text" required value={kelas} onChange={e => setKelas(e.target.value)} placeholder="Misal: VIII A" className="w-full rounded-xl border border-slate-300 py-2.5 px-4 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tahun Pelajaran</label>
                  <input type="text" required value={tahun} onChange={e => setTahun(e.target.value)} className="w-full rounded-xl border border-slate-300 py-2.5 px-4 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username Login</label>
                  <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full rounded-xl border border-slate-300 py-2.5 px-4 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-medium" />
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">Password default akan diatur: 123456</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-colors uppercase tracking-wider disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
