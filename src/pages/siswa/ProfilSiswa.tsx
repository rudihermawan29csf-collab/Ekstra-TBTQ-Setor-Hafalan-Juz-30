import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import { User, LogOut } from 'lucide-react';

export default function ProfilSiswa() {
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profil Anda</h1>
      <p className="text-sm text-slate-500 italic mt-1">Informasi akun siswa TBTQ.</p>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="h-32 bg-emerald-600"></div>
        <div className="px-6 pb-6">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-md border-4 border-white flex items-center justify-center text-emerald-600 relative z-10">
              <User className="w-10 h-10" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Lengkap</label>
              <div className="text-lg font-black text-slate-900">{user?.nama}</div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Username / NISN</label>
              <div className="text-md font-bold text-slate-600">{user?.username}</div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status Akun</label>
              <div className="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                Siswa Aktif
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100 mt-6">
              <button
                onClick={signOut}
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-xl text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout (Keluar)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
