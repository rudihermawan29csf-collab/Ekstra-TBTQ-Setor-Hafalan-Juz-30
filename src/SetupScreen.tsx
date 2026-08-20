import React from 'react';
import { Database, Copy } from 'lucide-react';

export default function SetupScreen() {
  const scriptCode = `function doPost(e) {
  var output = { success: false, data: null, error: null };
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === "login") {
      var sheet = ss.getSheetByName("Users");
      if (!sheet) throw new Error("Sheet 'Users' tidak ditemukan");
      var data = sheet.getDataRange().getValues();
      
      for (var i = 1; i < data.length; i++) { // Skip header
        if (data[i][1] === body.username && data[i][2] === body.password) {
          output.success = true;
          output.data = {
            id: data[i][0],
            username: data[i][1],
            nama: data[i][3],
            role: data[i][4],
            siswa_id: data[i][5] || null
          };
          break;
        }
      }
      if (!output.success) output.error = "Username atau password salah";
    }
    else if (action === "simpan_setoran") {
      var sheet = ss.getSheetByName("Setoran");
      if (!sheet) {
        sheet = ss.insertSheet("Setoran");
        sheet.appendRow(["id", "siswa_id", "tanggal", "surah", "ayat_mulai", "ayat_selesai", "jenis", "nilai", "catatan", "timestamp"]);
      }
      var newId = Utilities.getUuid();
      var timestamp = new Date().toISOString();
      sheet.appendRow([
        newId,
        body.siswa_id,
        body.tanggal,
        body.surah,
        body.ayat_mulai,
        body.ayat_selesai,
        body.jenis,
        body.nilai,
        body.catatan,
        timestamp
      ]);
      output.success = true;
      output.data = { id: newId };
    }
    // Tambahkan aksi lain di sini (getStudents, dll)
    else {
      output.error = "Action tidak dikenali";
    }
  } catch (err) {
    output.error = err.message || err.toString();
  }
  
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "Apps Script API is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    alert('Kode berhasil disalin!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
            <Database size={32} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-900 tracking-tight">
          Setup Google Sheets
        </h2>
        <p className="mt-2 text-center text-sm font-bold text-slate-500 uppercase tracking-widest">
          Hubungkan Aplikasi dengan Spreadsheet
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-3xl sm:px-10">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 tracking-tight">1. Siapkan Google Sheets</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Buat Spreadsheet baru di Google Drive Anda. Buat Sheet (Tab) baru bernama <strong>Users</strong> dan isi baris pertama (header) dan baris kedua (data dummy) persis seperti ini:
              </p>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-4 py-2 border-r">id</th>
                      <th className="px-4 py-2 border-r">username</th>
                      <th className="px-4 py-2 border-r">password</th>
                      <th className="px-4 py-2 border-r">nama</th>
                      <th className="px-4 py-2 border-r">role</th>
                      <th className="px-4 py-2">siswa_id</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr>
                      <td className="px-4 py-2 border-r text-slate-500">1</td>
                      <td className="px-4 py-2 border-r font-bold text-slate-800">guru</td>
                      <td className="px-4 py-2 border-r text-slate-500">guru123</td>
                      <td className="px-4 py-2 border-r font-medium text-slate-800">Guru TBTQ</td>
                      <td className="px-4 py-2 border-r text-slate-500">teacher</td>
                      <td className="px-4 py-2 text-slate-400 italic">kosongkan</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 tracking-tight">2. Buat Apps Script</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Di Google Sheets, klik menu <strong>Ekstensi &gt; Apps Script</strong>. Hapus semua kode yang ada dan tempel (paste) kode di bawah ini:
              </p>
              <div className="relative">
                <button 
                  onClick={copyToClipboard}
                  className="absolute top-3 right-3 p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors shadow-sm"
                  title="Copy Code"
                >
                  <Copy size={16} />
                </button>
                <pre className="bg-slate-800 text-emerald-300 p-4 rounded-xl text-xs overflow-x-auto shadow-inner leading-relaxed">
                  <code>{scriptCode}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 tracking-tight">3. Deploy sebagai Web App</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-2">
                1. Klik tombol biru <strong>Terapkan (Deploy) &gt; Deployment baru</strong>.<br/>
                2. Pilih jenis: <strong>Aplikasi Web (Web App)</strong>.<br/>
                3. Akses: Ubah menjadi <strong>"Siapa saja" (Anyone)</strong>.<br/>
                4. Klik Terapkan dan berikan izin akses ke akun Google Anda.<br/>
                5. <strong>Salin URL Web App</strong> yang berawalan <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">https://script.google.com/macros/...</code>
              </p>
            </div>
            
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-r-2xl">
              <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-2">4. Langkah Terakhir</h3>
              <p className="text-sm text-emerald-700 leading-relaxed">
                Buka menu <strong>Settings</strong> di AI Studio (ikon roda gigi di pojok kanan atas layar Anda). Tambahkan variabel baru di bagian <strong>Secrets</strong> dengan nama <code className="font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">APPSCRIPT_URL</code> dan isi valuenya dengan URL Web App yang baru saja Anda salin. 
                <br/><br/><strong>Setelah disimpan, muat ulang (refresh) halaman ini.</strong>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
