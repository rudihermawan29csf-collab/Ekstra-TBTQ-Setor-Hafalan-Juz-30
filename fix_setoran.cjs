const fs = require('fs');
let content = fs.readFileSync('src/pages/guru/SetoranForm.tsx', 'utf8');

const constantsImport = "import { SURAH_NAMES } from '../../lib/constants';\n";
if (!content.includes('SURAH_NAMES')) {
  content = content.replace("import { callAppScript }", constantsImport + "import { callAppScript }");
}

const selectReplacement = `<option value="">-- Pilih Surah --</option>
                {Object.entries(SURAH_NAMES).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}`;

content = content.replace(/<option value="">-- Pilih Surah --<\/option>[\s\S]*?<option value="80">'Abasa<\/option>/g, selectReplacement);

fs.writeFileSync('src/pages/guru/SetoranForm.tsx', content);
