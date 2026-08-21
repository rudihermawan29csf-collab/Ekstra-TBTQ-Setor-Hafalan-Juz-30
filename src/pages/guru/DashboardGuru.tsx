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
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
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
