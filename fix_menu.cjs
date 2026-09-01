const fs = require('fs');

let layout = fs.readFileSync('src/components/AppLayout.tsx', 'utf8');
layout = layout.replace("{ name: 'Progress', to: '/siswa/progress', icon: BarChart },", "");
layout = layout.replace("{ name: 'Murojaah', to: '/siswa/murojaah', icon: History },", "");
fs.writeFileSync('src/components/AppLayout.tsx', layout);

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace('<Route path="siswa/progress" element={<ProtectedRoute role="student"><ProgressDetailSiswa /></ProtectedRoute>} />', "");
app = app.replace('<Route path="siswa/murojaah" element={<ProtectedRoute role="student"><MurojaahSiswa /></ProtectedRoute>} />', "");
fs.writeFileSync('src/App.tsx', app);
