import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Login from './pages/Login';
import DashboardGuru from './pages/guru/DashboardGuru';
import DashboardSiswa from './pages/siswa/DashboardSiswa';
import SetoranForm from './pages/guru/SetoranForm';
import DataSiswa from './pages/guru/DataSiswa';
import AppLayout from './components/AppLayout';

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: 'teacher' | 'student' }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-emerald-600 font-bold uppercase tracking-widest">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-emerald-600 font-bold uppercase tracking-widest">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={user?.role === 'teacher' ? <DashboardGuru /> : <DashboardSiswa />} />
        
        {/* Guru Routes */}
        <Route path="guru/setor" element={<ProtectedRoute role="teacher"><SetoranForm /></ProtectedRoute>} />
        <Route path="guru/siswa" element={<ProtectedRoute role="teacher"><DataSiswa /></ProtectedRoute>} />
        <Route path="guru/kelas" element={<ProtectedRoute role="teacher"><div>Data Kelas</div></ProtectedRoute>} />
        <Route path="guru/tahun" element={<ProtectedRoute role="teacher"><div>Tahun Pelajaran</div></ProtectedRoute>} />
        <Route path="guru/riwayat" element={<ProtectedRoute role="teacher"><div>Riwayat Hafalan</div></ProtectedRoute>} />
        <Route path="guru/progress" element={<ProtectedRoute role="teacher"><div>Progress Siswa</div></ProtectedRoute>} />
        <Route path="guru/target" element={<ProtectedRoute role="teacher"><div>Target Hafalan</div></ProtectedRoute>} />
        <Route path="guru/laporan" element={<ProtectedRoute role="teacher"><div>Laporan</div></ProtectedRoute>} />

        {/* Siswa Routes */}
        <Route path="siswa/hafalan" element={<ProtectedRoute role="student"><div>Hafalanku</div></ProtectedRoute>} />
        <Route path="siswa/progress" element={<ProtectedRoute role="student"><div>Progress</div></ProtectedRoute>} />
        <Route path="siswa/murojaah" element={<ProtectedRoute role="student"><div>Murojaah</div></ProtectedRoute>} />
        <Route path="siswa/profil" element={<ProtectedRoute role="student"><div>Profil</div></ProtectedRoute>} />
      </Route>
      
      {/* Fallback */}
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
