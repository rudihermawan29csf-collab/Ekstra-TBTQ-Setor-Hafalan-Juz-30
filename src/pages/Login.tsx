import React, { useState, useEffect } from 'react';
import { callAppScript } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { BookOpen, User, Lock, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface UserData {
  username: string;
  nama: string;
  role: string;
}

export default function Login() {
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch only when role changes so we can reset username selection? No, just filter the list
  useEffect(() => {
    setUsername('');
    setPassword('');
    setError('');
  }, [role]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await callAppScript('get_users');
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // We do not set error message here as it might disrupt the UI heavily, 
      // just fail silently or handle if user notices no dropdown items.
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      setError('Silakan pilih username terlebih dahulu.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userData = await callAppScript('login', { username, password });
      
      // Verifikasi role sesuai pilihan tab
      if (userData.role !== role) {
        setError(`Akun ini bukan akun ${role === 'teacher' ? 'Guru' : 'Siswa'}. Silakan pilih tab yang benar.`);
        setLoading(false);
        return;
      }
      
      setUser(userData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => u.role === role);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-16 w-16 bg-amber-400 rounded-2xl flex items-center justify-center shadow-sm">
          <BookOpen className="h-8 w-8 text-emerald-900" />
        </div>
        <h2 className="mt-6 text-3xl font-black text-slate-900 tracking-tight">HAFALAN JUZ 30</h2>
        <p className="mt-2 text-xs font-bold text-emerald-600 uppercase tracking-widest">Ekstra TBTQ SMPN 3 Pacet</p>
        <p className="mt-2 text-sm italic text-slate-500">"Satu Ayat Hari Ini, Satu Langkah Menuju Hafidz Qur'ani"</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-3xl sm:px-10">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setRole('teacher')}
              className={cn(
                "flex-1 pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors",
                role === 'teacher' ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              👨‍🏫 GURU
            </button>
            <button
              onClick={() => setRole('student')}
              className={cn(
                "flex-1 pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors",
                role === 'student' ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              👨‍🎓 SISWA
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <p className="text-sm font-medium text-rose-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nama Pengguna (Username)
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  id="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loadingUsers}
                  className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-10 sm:text-sm border-slate-300 font-medium rounded-xl py-3 border appearance-none bg-white disabled:bg-slate-50"
                >
                  <option value="">-- Pilih {role === 'teacher' ? 'Guru' : 'Siswa'} --</option>
                  {filteredUsers.map((u) => (
                    <option key={u.username} value={u.username}>
                      {u.nama} ({u.username})
                    </option>
                  ))}
                </select>
                {loadingUsers && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
                  </div>
                )}
                {!loadingUsers && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-300 font-medium rounded-xl py-3 border"
                  placeholder="Masukkan password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || loadingUsers}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors uppercase tracking-wider shadow-emerald-200"
              >
                {loading ? 'Masuk...' : 'Masuk'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
