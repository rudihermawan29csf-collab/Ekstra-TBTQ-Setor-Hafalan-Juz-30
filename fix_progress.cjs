const fs = require('fs');
let content = fs.readFileSync('src/pages/guru/ProgressSiswa.tsx', 'utf8');

if (!content.includes('Edit2')) {
  content = content.replace("import { Loader2, Search, X, BarChart } from 'lucide-react';", "import { Loader2, Search, X, BarChart, Edit2, Trash2 } from 'lucide-react';");
}
if (!content.includes('import { SURAH_NAMES }')) {
  content = content.replace("import { getSurahName } from '../../lib/constants';", "import { getSurahName, SURAH_NAMES } from '../../lib/constants';");
}

const editState = `  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data setoran ini?')) return;
    setDeletingId(id);
    try {
      await callAppScript('delete_setoran', { id });
      setSetoran(setoran.filter(item => item.id !== id));
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
      await callAppScript('edit_setoran', editingItem);
      setSetoran(setoran.map(item => item.id === editingItem.id ? editingItem : item));
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

// Add actions to modal table
if (!content.includes('Aksi')) {
  content = content.replace(
    '<th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase">Nilai</th>',
    '<th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase">Nilai</th>\n                        <th className="px-4 py-3 text-right text-[11px] font-black text-slate-400 uppercase">Aksi</th>'
  );

  const modalActionsTd = `                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setSelectedStudentId(null); setEditingItem(s); }} className="text-blue-600 hover:text-blue-900 p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDelete(s.id)} disabled={deletingId === s.id} className="text-rose-600 hover:text-rose-900 p-1 disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>`;

  content = content.replace(/<span className="text-\[10px\] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-1 rounded">{s.nilai}<\/span><\/td>\s*<\/tr>/g, '<span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-1 rounded">{s.nilai}</span></td>\n' + modalActionsTd);
}

const editModal = `
      {/* Modal Edit Setoran */}
      {editingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl my-8">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold uppercase tracking-tight text-slate-800">Edit Data Setoran</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
                <input type="date" required value={editingItem.tanggal?.split('T')[0]} onChange={e => setEditingItem({...editingItem, tanggal: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Surah</label>
                <select required value={editingItem.surah} onChange={e => setEditingItem({...editingItem, surah: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-emerald-500 outline-none">
                  {Object.entries(SURAH_NAMES).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Ayat Mulai</label>
                  <input type="number" required value={editingItem.ayat_mulai} onChange={e => setEditingItem({...editingItem, ayat_mulai: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Ayat Selesai</label>
                  <input type="number" required value={editingItem.ayat_selesai} onChange={e => setEditingItem({...editingItem, ayat_selesai: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Jenis Setoran</label>
                <select required value={editingItem.jenis} onChange={e => setEditingItem({...editingItem, jenis: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-emerald-500 outline-none">
                  <option value="Hafalan Baru">Hafalan Baru</option>
                  <option value="Murojaah">Murojaah</option>
                  <option value="Mengulang Setoran">Mengulang Setoran</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nilai</label>
                <select required value={editingItem.nilai} onChange={e => setEditingItem({...editingItem, nilai: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-emerald-500 outline-none">
                  <option value="Sangat Lancar">Sangat Lancar</option>
                  <option value="Lancar">Lancar</option>
                  <option value="Cukup">Cukup</option>
                  <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Catatan</label>
                <textarea value={editingItem.catatan || ''} onChange={e => setEditingItem({...editingItem, catatan: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-emerald-500 outline-none" rows={2}></textarea>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

if (!content.includes('Modal Edit Setoran')) {
  content = content.replace("    </div>\n  );\n}", editModal + "    </div>\n  );\n}");
}

fs.writeFileSync('src/pages/guru/ProgressSiswa.tsx', content);
