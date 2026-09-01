const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
const imports = `import HafalanSiswa from './pages/siswa/HafalanSiswa';
import ProgressDetailSiswa from './pages/siswa/ProgressDetailSiswa';
import MurojaahSiswa from './pages/siswa/MurojaahSiswa';
import ProfilSiswa from './pages/siswa/ProfilSiswa';`;

content = content.replace("import AbsensiSiswa from './pages/siswa/AbsensiSiswa';", "import AbsensiSiswa from './pages/siswa/AbsensiSiswa';\n" + imports);

// Replace routes
content = content.replace(
  '<Route path="siswa/hafalan" element={<ProtectedRoute role="student"><div>Hafalanku</div></ProtectedRoute>} />',
  '<Route path="siswa/hafalan" element={<ProtectedRoute role="student"><HafalanSiswa /></ProtectedRoute>} />'
);

content = content.replace(
  '<Route path="siswa/progress" element={<ProtectedRoute role="student"><div>Progress</div></ProtectedRoute>} />',
  '<Route path="siswa/progress" element={<ProtectedRoute role="student"><ProgressDetailSiswa /></ProtectedRoute>} />'
);

content = content.replace(
  '<Route path="siswa/murojaah" element={<ProtectedRoute role="student"><div>Murojaah</div></ProtectedRoute>} />',
  '<Route path="siswa/murojaah" element={<ProtectedRoute role="student"><MurojaahSiswa /></ProtectedRoute>} />'
);

content = content.replace(
  '<Route path="siswa/profil" element={<ProtectedRoute role="student"><div>Profil</div></ProtectedRoute>} />',
  '<Route path="siswa/profil" element={<ProtectedRoute role="student"><ProfilSiswa /></ProtectedRoute>} />'
);

fs.writeFileSync('src/App.tsx', content);
