import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, Users, LayoutDashboard, History, Settings, LogOut, Menu, X, BarChart, Target, FileText, Calendar, School } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const teacherLinks = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Setor Hafalan', to: '/guru/setor', icon: BookOpen },
    { name: 'Data Siswa', to: '/guru/siswa', icon: Users },
    { name: 'Data Kelas', to: '/guru/kelas', icon: School },
    { name: 'Tahun Pelajaran', to: '/guru/tahun', icon: Calendar },
    { name: 'Riwayat Hafalan', to: '/guru/riwayat', icon: History },
    { name: 'Progress Siswa', to: '/guru/progress', icon: BarChart },
    { name: 'Target Hafalan', to: '/guru/target', icon: Target },
    { name: 'Laporan', to: '/guru/laporan', icon: FileText },
  ];

  const studentLinks = [
    { name: 'Beranda', to: '/', icon: LayoutDashboard },
    { name: 'Hafalanku', to: '/siswa/hafalan', icon: BookOpen },
    { name: 'Progress', to: '/siswa/progress', icon: BarChart },
    { name: 'Murojaah', to: '/siswa/murojaah', icon: History },
    { name: 'Profil', to: '/siswa/profil', icon: Users },
  ];

  const links = user?.role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-emerald-700 text-white p-4 shadow-md">
        <div className="flex items-center gap-2 font-serif text-lg font-bold">
          <BookOpen className="h-6 w-6" />
          HAFALAN JUZ 30
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-emerald-900 text-white transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-xl",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:block border-b border-emerald-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-emerald-900 shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-white">JUZ 30</h1>
          </div>
          <p className="text-emerald-300 text-[10px] uppercase tracking-widest font-semibold">SMPN 3 PACET • TBTQ</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-5 mb-3 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
            Menu Utama
          </div>
          <nav className="space-y-1 px-3">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "group flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-colors",
                    isActive 
                      ? "bg-emerald-800/60 text-white shadow-inner border border-emerald-700/50" 
                      : "text-emerald-200 hover:bg-emerald-800/40 hover:text-white"
                  )}
                >
                  <Icon className="mr-3 flex-shrink-0 h-5 w-5 opacity-80" />
                  {link.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-5 mt-auto">
          <div className="bg-emerald-800/80 rounded-2xl p-4 border border-emerald-700 mb-4 shadow-sm">
             <p className="text-[9px] text-emerald-300 uppercase font-black tracking-widest mb-1">Pengguna Aktif</p>
             <p className="text-sm font-bold text-white truncate">{user?.nama}</p>
             <p className="text-[10px] text-emerald-400 uppercase mt-0.5 tracking-wider font-bold">{user?.role}</p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-emerald-100 bg-emerald-800/50 hover:bg-rose-500 hover:text-white transition-colors border border-emerald-700/50 hover:border-rose-500"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
