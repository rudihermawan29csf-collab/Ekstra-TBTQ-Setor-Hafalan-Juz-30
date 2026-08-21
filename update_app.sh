#!/bin/bash

# Update DashboardGuru
cat << 'INNER_EOF' > src/pages/guru/DashboardGuru.tsx
import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Award, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { callAppScript } from '../../lib/api';

export default function DashboardGuru() {
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalSetoran: 0,
    setoranHariIni: 0,
    totalKelas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await callAppScript('get_dashboard');
      if (data) setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Siswa', value: stats.totalSiswa, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Setoran Hari Ini', value: stats.setoranHariIni, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Setoran', value: stats.totalSetoran, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Total Kelas', value: stats.totalKelas, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Guru</h1>
        <p className="text-sm text-slate-500 italic mt-1">Ringkasan aktivitas hafalan siswa Ekstra TBTQ.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
              <div className={\`\${stat.bg} \${stat.color} p-4 rounded-2xl\`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
INNER_EOF

# Update DataSiswa (Edit & Delete functionality)
cat << 'INNER_EOF' > src/pages/guru/DataSiswa.tsx
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
                  <td className="px-6 py-4 whitespace-nowrap"><span className={\`text-[10px] font-black uppercase px-2 py-1 rounded \${student.status === 'aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}\`}>{student.status}</span></td>
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
INNER_EOF

# Riwayat Hafalan
cat << 'INNER_EOF' > src/pages/guru/RiwayatHafalan.tsx
import React, { useState, useEffect } from 'react';
import { callAppScript } from '../../lib/api';
import { Loader2, Search } from 'lucide-react';

export default function RiwayatHafalan() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await callAppScript('get_setoran');
      setData(result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter(item => 
    item.nama_siswa?.toLowerCase().includes(search.toLowerCase()) ||
    item.surah?.toLowerCase().includes(search.toLowerCase())
  );

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
                  <td className="px-6 py-4 whitespace-nowrap"><div className="font-bold text-slate-900">{item.nama_siswa || item.siswa_id}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-slate-600">Surah {item.surah}</div><div className="text-[11px] text-slate-400">Ayat {item.ayat_mulai} - {item.ayat_selesai}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.jenis}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-1 rounded">{item.nilai}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
INNER_EOF

# Data Kelas
cat << 'INNER_EOF' > src/pages/guru/DataKelas.tsx
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
INNER_EOF

# Tahun Pelajaran
cat << 'INNER_EOF' > src/pages/guru/TahunPelajaran.tsx
import React, { useState, useEffect } from 'react';
import { callAppScript } from '../../lib/api';
import { Loader2, Plus, Trash2 } from 'lucide-react';

export default function TahunPelajaran() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tahun, setTahun] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await callAppScript('get_tahun');
      setData(result || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await callAppScript('add_tahun', { tahun_pelajaran: tahun, status: 'Aktif' });
      setTahun('');
      fetchData();
    } catch (err) { alert('Gagal menambah tahun'); }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('Hapus data ini?')) return;
    try {
      await callAppScript('delete_tahun', { id });
      fetchData();
    } catch (err) { alert('Gagal menghapus'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tahun Pelajaran</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border md:col-span-1 h-fit">
          <h2 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Tambah Tahun</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <input type="text" placeholder="Tahun (ex: 2026/2027)" required value={tahun} onChange={e => setTahun(e.target.value)} className="w-full border rounded-xl p-3 text-sm" />
            <button type="submit" className="w-full flex justify-center items-center py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm"><Plus className="h-4 w-4 mr-2"/> Tambah</button>
          </form>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border md:col-span-2 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr><th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase">Tahun Pelajaran</th><th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase">Status</th><th className="px-6 py-4"></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-slate-500">Belum ada data.</td></tr>
              ) : data.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 font-bold text-slate-900">{item.tahun_pelajaran}</td>
                  <td className="px-6 py-4"><span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-emerald-50 text-emerald-600">{item.status}</span></td>
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
INNER_EOF

# Progress, Target, Laporan (Placeholders)
cat << 'INNER_EOF' > src/pages/guru/ProgressSiswa.tsx
import React from 'react';
import RiwayatHafalan from './RiwayatHafalan';
export default function ProgressSiswa() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">Progress Siswa</h1>
      <RiwayatHafalan />
    </div>
  );
}
INNER_EOF

cat << 'INNER_EOF' > src/pages/guru/TargetHafalan.tsx
import React from 'react';
export default function TargetHafalan() {
  return <div className="p-8 text-center font-bold text-slate-500">Fitur Target Hafalan sedang dalam pengembangan.</div>;
}
INNER_EOF

cat << 'INNER_EOF' > src/pages/guru/Laporan.tsx
import React from 'react';
import RiwayatHafalan from './RiwayatHafalan';
export default function Laporan() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">Laporan Hafalan</h1>
      <RiwayatHafalan />
    </div>
  );
}
INNER_EOF

# Update App.tsx Routing
cat << 'INNER_EOF' > src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Login from './pages/Login';
import DashboardGuru from './pages/guru/DashboardGuru';
import DashboardSiswa from './pages/siswa/DashboardSiswa';
import SetoranForm from './pages/guru/SetoranForm';
import DataSiswa from './pages/guru/DataSiswa';
import RiwayatHafalan from './pages/guru/RiwayatHafalan';
import DataKelas from './pages/guru/DataKelas';
import TahunPelajaran from './pages/guru/TahunPelajaran';
import ProgressSiswa from './pages/guru/ProgressSiswa';
import TargetHafalan from './pages/guru/TargetHafalan';
import Laporan from './pages/guru/Laporan';
import AppLayout from './components/AppLayout';

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: 'teacher' | 'student' }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-emerald-600 font-bold uppercase tracking-widest">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-emerald-600 font-bold uppercase tracking-widest">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={user?.role === 'teacher' ? <DashboardGuru /> : <DashboardSiswa />} />
        
        {/* Guru Routes */}
        <Route path="guru/setor" element={<ProtectedRoute role="teacher"><SetoranForm /></ProtectedRoute>} />
        <Route path="guru/siswa" element={<ProtectedRoute role="teacher"><DataSiswa /></ProtectedRoute>} />
        <Route path="guru/kelas" element={<ProtectedRoute role="teacher"><DataKelas /></ProtectedRoute>} />
        <Route path="guru/tahun" element={<ProtectedRoute role="teacher"><TahunPelajaran /></ProtectedRoute>} />
        <Route path="guru/riwayat" element={<ProtectedRoute role="teacher"><RiwayatHafalan /></ProtectedRoute>} />
        <Route path="guru/progress" element={<ProtectedRoute role="teacher"><ProgressSiswa /></ProtectedRoute>} />
        <Route path="guru/target" element={<ProtectedRoute role="teacher"><TargetHafalan /></ProtectedRoute>} />
        <Route path="guru/laporan" element={<ProtectedRoute role="teacher"><Laporan /></ProtectedRoute>} />

        {/* Siswa Routes */}
        <Route path="siswa/hafalan" element={<ProtectedRoute role="student"><div>Hafalanku</div></ProtectedRoute>} />
        <Route path="siswa/progress" element={<ProtectedRoute role="student"><div>Progress</div></ProtectedRoute>} />
        <Route path="siswa/murojaah" element={<ProtectedRoute role="student"><div>Murojaah</div></ProtectedRoute>} />
        <Route path="siswa/profil" element={<ProtectedRoute role="student"><div>Profil</div></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
INNER_EOF

