import React, { useState, useEffect } from 'react';
import { callAppScript } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { User, Lock, Loader2, ArrowRight, Wifi, BatteryMedium, Command } from 'lucide-react';
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
  
  const [currentTime, setCurrentTime] = useState(new Date());

  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      setError('Pilih pengguna terlebih dahulu');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userData = await callAppScript('login', { username, password });
      
      if (userData.role !== role) {
        setError(`Akun ini bukan akun ${role === 'teacher' ? 'Guru' : 'Siswa'}.`);
        setLoading(false);
        return;
      }
      
      setUser(userData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Password salah');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => u.role === role);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center font-sans flex flex-col relative overflow-hidden text-white"
      style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' }}
    >
      {/* Top Menu Bar (macOS style) */}
      <div className="absolute top-0 w-full h-7 bg-black/20 backdrop-blur-md flex items-center justify-between px-4 text-[13px] font-medium z-10 border-b border-white/10">
        <div className="flex items-center gap-4">
          <span className="font-bold flex items-center gap-1.5"><Command className="h-3 w-3"/> Hafalan Juz 30</span>
          <span className="hidden sm:inline opacity-80 cursor-default hover:text-white hover:opacity-100 transition-opacity">File</span>
          <span className="hidden sm:inline opacity-80 cursor-default hover:text-white hover:opacity-100 transition-opacity">Edit</span>
          <span className="hidden sm:inline opacity-80 cursor-default hover:text-white hover:opacity-100 transition-opacity">View</span>
          <span className="hidden sm:inline opacity-80 cursor-default hover:text-white hover:opacity-100 transition-opacity">Window</span>
          <span className="hidden sm:inline opacity-80 cursor-default hover:text-white hover:opacity-100 transition-opacity">Help</span>
        </div>
        <div className="flex items-center gap-4 opacity-90">
          <Wifi className="h-3.5 w-3.5" />
          <BatteryMedium className="h-4 w-4" />
          <span>{formatDate(currentTime)} {formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Main Lock Screen Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 pt-16">
        
        {/* Role Segmented Control */}
        <div className="mb-12 bg-black/30 backdrop-blur-xl p-1 rounded-xl flex gap-1 shadow-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={cn(
              "px-6 py-1.5 rounded-lg text-sm font-medium transition-all duration-300",
              role === 'teacher' ? "bg-white/20 text-white shadow-sm" : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            Guru
          </button>
          <button
            type="button"
            onClick={() => setRole('student')}
            className={cn(
              "px-6 py-1.5 rounded-lg text-sm font-medium transition-all duration-300",
              role === 'student' ? "bg-white/20 text-white shadow-sm" : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            Siswa
          </button>
        </div>

        {/* User Avatar */}
        <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center mb-6">
          <User className="w-12 h-12 text-white/80" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col items-center w-full max-w-[260px] space-y-5">
          
          <div className="relative w-full flex justify-center">
            <select
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loadingUsers}
              className="w-full bg-transparent text-xl font-bold text-center text-white appearance-none focus:outline-none cursor-pointer drop-shadow-md pb-1"
              style={{ textAlignLast: 'center' }}
            >
              <option value="" className="text-black font-medium">-- Pilih {role === 'teacher' ? 'Guru' : 'Siswa'} --</option>
              {filteredUsers.map((u) => (
                <option key={u.username} value={u.username} className="text-black font-medium">
                  {u.nama}
                </option>
              ))}
            </select>
            {loadingUsers && (
              <div className="absolute right-0 top-1">
                <Loader2 className="h-4 w-4 animate-spin text-white/70" />
              </div>
            )}
          </div>

          <div className="relative w-full transition-all duration-300 group">
            <input
              type="password"
              placeholder="Enter Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/30 rounded-full py-1.5 pl-4 pr-10 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all shadow-lg"
            />
            <button
              type="submit"
              disabled={loading || !username}
              className="absolute right-1 top-1 bottom-1 w-7 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin text-white" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5 text-white" />
              )}
            </button>
          </div>

          {error && (
            <div className="text-rose-200 text-xs font-medium text-center bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-rose-500/30 w-full">
              {error}
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
