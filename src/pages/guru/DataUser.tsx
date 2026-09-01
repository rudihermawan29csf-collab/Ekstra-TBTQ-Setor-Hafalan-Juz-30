import React, { useState, useEffect } from 'react';
import { callAppScript } from '../../lib/api';
import { Loader2, Key, UserCog, Search, X } from 'lucide-react';

export default function DataUser() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await callAppScript('get_users');
      setUsers(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await callAppScript('edit_user_password', { id: editingUser.id, password: newPassword });
      alert('Password berhasil diubah!');
      setEditingUser(null);
      setNewPassword('');
      fetchUsers();
    } catch (error: any) {
      alert('Gagal mengubah password: ' + error.message + '\n\nPastikan Anda sudah memperbarui Google Apps Script dengan versi terbaru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    String(u.nama).toLowerCase().includes(search.toLowerCase()) || 
    String(u.username).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan User (Akun)</h1>
      <p className="text-sm text-slate-500 italic mt-1">Kelola data login pengguna (Guru & Siswa), termasuk melihat dan reset password.</p>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <UserCog className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-900">Daftar Pengguna Aktif</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Cari nama atau username..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl sm:text-sm font-medium focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Nama Pengguna</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Username Login</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Password</th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-medium">Tidak ada data pengguna.</td></tr>
              ) : filteredUsers.map((u, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">{u.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded border ${u.role === 'teacher' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      {u.role === 'teacher' ? 'Guru' : 'Siswa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{u.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono font-medium">
                    {u.password}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => { setEditingUser(u); setNewPassword(u.password); }} 
                      className="inline-flex items-center text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Key className="w-3.5 h-3.5 mr-1.5" /> Ubah Sandi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Password */}
      {editingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold uppercase tracking-tight text-slate-800">Ubah Password</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditPassword} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Pengguna</p>
                <p className="font-bold text-slate-800">{editingUser.nama}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Password Baru</label>
                <input 
                  type="text" 
                  required 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono" 
                />
              </div>
              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
