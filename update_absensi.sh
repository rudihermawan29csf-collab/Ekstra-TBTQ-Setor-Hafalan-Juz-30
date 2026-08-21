#!/bin/bash

# Update AppLayout
sed -i '/name: .Beranda./a \    { name: '"'"'Kehadiran'"'"', to: '"'"'/siswa/absensi'"'"', icon: Calendar },' src/components/AppLayout.tsx
sed -i '/name: .Target Hafalan./a \    { name: '"'"'Laporan Kehadiran'"'"', to: '"'"'/guru/kehadiran'"'"', icon: Calendar },' src/components/AppLayout.tsx

# Update App.tsx
sed -i '/import Laporan/a import LaporanKehadiran from '"'"'./pages/guru/LaporanKehadiran'"'"';\nimport AbsensiSiswa from '"'"'./pages/siswa/AbsensiSiswa'"'"';' src/App.tsx
sed -i '/<Route path="guru\/target"/a \        <Route path="guru/kehadiran" element={<ProtectedRoute role="teacher"><LaporanKehadiran /></ProtectedRoute>} />' src/App.tsx
sed -i '/<Route path="siswa\/murojaah"/a \        <Route path="siswa/absensi" element={<ProtectedRoute role="student"><AbsensiSiswa /></ProtectedRoute>} />' src/App.tsx

