import { Users, BookOpen, Star, Trophy, Calendar } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export default function DashboardGuru() {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Siswa', value: '45', icon: Users, color: 'bg-blue-500' },
    { name: 'Total Setoran', value: '312', icon: BookOpen, color: 'bg-emerald-500' },
    { name: 'Siswa Mulai Hafalan', value: '42', icon: Star, color: 'bg-yellow-500' },
    { name: 'Siswa 100% Hafal', value: '5', icon: Trophy, color: 'bg-purple-500' },
  ];

  const students = [
    { name: 'Abel Echa', class: 'VIII A', progress: 80, isWarning: false },
    { name: 'Ahmad', class: 'VII B', progress: 60, isWarning: true, warningMsg: 'Terakhir setor 30 hari lalu' },
    { name: 'Siti', class: 'IX A', progress: 100, isWarning: false },
    { name: 'Budi', class: 'VIII B', progress: 15, isWarning: true, warningMsg: 'Progress rendah' },
  ];

  const classProgress = [
    { name: 'VII A', progress: 70 },
    { name: 'VII B', progress: 60 },
    { name: 'VIII A', progress: 80 },
    { name: 'IX A', progress: 90 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Beranda Dashboard</h1>
          <p className="text-sm text-slate-500 italic mt-1">Satu Ayat Hari Ini, Satu Langkah Menuju Hafidz Qur'ani</p>
        </div>
        <div className="flex items-center text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-4 py-2.5 rounded-xl shadow-sm border border-emerald-100">
          <Calendar className="mr-2 h-4 w-4" />
          Tahun Pelajaran: 2026/2027
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          const colorClass = item.color.replace('bg-', '');
          return (
            <div key={item.name} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-${colorClass}-50 text-${colorClass}-600`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-3xl font-black text-slate-900">{item.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.name}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Siswa */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-6">Peringkat Progress Hafalan</h2>
          <div className="space-y-6">
            {students.filter(s => !s.isWarning).map((student, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 text-sm">
                    {student.name} 
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md uppercase font-bold ml-2">{student.class}</span>
                  </span>
                  <span className={`font-black ${student.progress === 100 ? "text-amber-500" : "text-emerald-600"}`}>{student.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${student.progress === 100 ? "bg-amber-500" : "bg-emerald-500"}`} 
                    style={{ width: `${student.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Kelas */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-6">Progress Per Kelas</h2>
          <div className="space-y-6">
            {classProgress.map((cls, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 text-sm">{cls.name}</span>
                  <span className="font-black text-blue-600">{cls.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full" 
                    style={{ width: `${cls.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warnings */}
      <div className="bg-rose-50 rounded-3xl border border-rose-100 p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-rose-200/50 pb-4">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
          <h2 className="text-sm font-bold text-rose-700 uppercase tracking-widest">Prioritas Pembinaan</h2>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {students.filter(s => s.isWarning).map((student, idx) => (
            <li key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
                  {student.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-slate-900">{student.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kelas {student.class}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="inline-flex items-center px-2 py-1 rounded bg-rose-50 text-[10px] font-black uppercase tracking-wider text-rose-600 border border-rose-100 mb-1">
                  {student.warningMsg}
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prog: {student.progress}%</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
