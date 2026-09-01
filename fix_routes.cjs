const fs = require('fs');

// Add DataUser route to App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
const dataUserImport = "import DataUser from './pages/guru/DataUser';\n";
if (!appContent.includes('DataUser')) {
  appContent = appContent.replace("import AppLayout from './components/AppLayout';", dataUserImport + "import AppLayout from './components/AppLayout';");
  appContent = appContent.replace(
    '<Route path="guru/laporan" element={<ProtectedRoute role="teacher"><Laporan /></ProtectedRoute>} />',
    '<Route path="guru/laporan" element={<ProtectedRoute role="teacher"><Laporan /></ProtectedRoute>} />\n        <Route path="guru/users" element={<ProtectedRoute role="teacher"><DataUser /></ProtectedRoute>} />'
  );
  fs.writeFileSync('src/App.tsx', appContent);
}

// Add DataUser link to AppLayout.tsx
let layoutContent = fs.readFileSync('src/components/AppLayout.tsx', 'utf8');
if (!layoutContent.includes('/guru/users')) {
  layoutContent = layoutContent.replace("import { BookOpen, Users, LayoutDashboard, History, Settings, LogOut, Menu, X, BarChart, Target, FileText, Calendar, School } from 'lucide-react';", "import { BookOpen, Users, LayoutDashboard, History, Settings, LogOut, Menu, X, BarChart, Target, FileText, Calendar, School, UserCog } from 'lucide-react';");
  layoutContent = layoutContent.replace(
    "{ name: 'Laporan', to: '/guru/laporan', icon: FileText },",
    "{ name: 'Laporan', to: '/guru/laporan', icon: FileText },\n    { name: 'Pengaturan User', to: '/guru/users', icon: UserCog },"
  );
  fs.writeFileSync('src/components/AppLayout.tsx', layoutContent);
}

