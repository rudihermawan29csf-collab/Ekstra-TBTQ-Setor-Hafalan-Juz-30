const fs = require('fs');
let content = fs.readFileSync('src/pages/guru/LaporanKehadiran.tsx', 'utf8');

if (!content.includes('Edit2')) {
  content = content.replace("import { Loader2, Calendar as CalIcon, Filter, Download, Search, X } from 'lucide-react';", "import { Loader2, Calendar as CalIcon, Filter, Download, Search, X, Edit2, Trash2 } from 'lucide-react';");
}

const editState = `  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data absensi ini?')) return;
    setDeletingId(id);
    try {
      await callAppScript('delete_absensi', { id });
      setData(data.filter(item => item.id !== id));
      alert('Data berhasil dihapus');
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await callAppScript('edit_absensi', editingItem);
      setData(data.map(item => item.id === editingItem.id ? editingItem : item));
      setEditingItem(null);
      alert('Data berhasil diperbarui');
    } catch (err: any) {
      alert('Gagal memperbarui: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
`;

if (!content.includes('setEditingItem')) {
  content = content.replace("  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);", "  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);\n" + editState);
}

// Add actions to main table
if (!content.includes('>Aksi<')) {
  content = content.replace(
    '<th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Status</th>',
    '<th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Status</th>\n                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-wider">Aksi</th>'
  );

  const actionsTd = `                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingItem(item)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="text-rose-600 hover:text-rose-900 bg-rose-50 p-1.5 rounded-lg disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>`;

  content = content.replace(/<span className=\{`text-\[10px\] font-black uppercase tracking-wider px-2 py-1 rounded \$\{getStatusColor\(item.status\)\}`\}>\s*\{item.status\}\s*<\/span>\s*<\/td>\s*<\/tr>/g, '<span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${getStatusColor(item.status)}`}>\n                      {item.status}\n                    </span>\n                  </td>\n' + actionsTd);
}

// Add actions to modal table
if (!content.match(/<th className="px-4 py-3 text-right text-\[11px\] font-black text-slate-400 uppercase">Aksi<\/th>/)) {
  content = content.replace(
    '<th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase">Status</th>',
    '<th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase">Status</th>\n                        <th className="px-4 py-3 text-right text-[11px] font-black text-slate-400 uppercase">Aksi</th>'
  );

  const modalActionsTd = `                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setSelectedStudentId(null); setEditingItem(a); }} className="text-blue-600 hover:text-blue-900 p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id} className="text-rose-600 hover:text-rose-900 p-1 disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>`;

  content = content.replace(/<span className=\{`text-\[10px\] font-black uppercase tracking-wider px-2 py-1 rounded \$\{getStatusColor\(a.status\)\}`\}>\s*\{a.status\}\s*<\/span>\s*<\/td>\s*<\/tr>/g, '<span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${getStatusColor(a.status)}`}>\n                              {a.status}\n                            </span>\n                          </td>\n' + modalActionsTd);
}

const editModal = `
      {/* Modal Edit Absensi */}
      {editingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl my-8">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold uppercase tracking-tight text-slate-800">Edit Data Absensi</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
                <input type="date" required value={editingItem.tanggal?.split('T')[0]} onChange={e => setEditingItem({...editingItem, tanggal: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Status Kehadiran</label>
                <select required value={editingItem.status} onChange={e => setEditingItem({...editingItem, status: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-emerald-500 outline-none">
                  <option value="Hadir">Hadir</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Ijin">Ijin</option>
                  <option value="Alpa">Alpa</option>
                  <option value="Pulang">Pulang</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

if (!content.includes('Modal Edit Absensi')) {
  content = content.replace("    </div>\n  );\n}", editModal + "    </div>\n  );\n}");
}

fs.writeFileSync('src/pages/guru/LaporanKehadiran.tsx', content);
