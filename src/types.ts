export type Role = 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  nama: string;
  role: Role;
  siswa_id: string | null;
}

export interface Student {
  id: string;
  nama: string;
  nisn: string;
  kelas_id: string;
  tahun_pelajaran_id: string;
  username: string;
  status: 'aktif' | 'nonaktif';
}

export interface ClassData {
  id: string;
  nama_kelas: string;
  tingkat: string;
}

export interface AcademicYear {
  id: string;
  tahun_pelajaran: string;
  status_aktif: boolean;
}

export interface Surah {
  id: string;
  nomor: number;
  nama: string;
  nama_arab: string;
  jumlah_ayat: number;
}

export type JenisSetoran = 'Hafalan Baru' | 'Murojaah' | 'Mengulang Setoran';
export type Penilaian = 'Sangat Lancar' | 'Lancar' | 'Cukup' | 'Perlu Perbaikan';

export interface MemorizationRecord {
  id: string;
  student_id: string;
  tanggal: string; // YYYY-MM-DD
  surah_id: string;
  ayat_mulai: number;
  ayat_selesai: number;
  jenis_setoran: JenisSetoran;
  penilaian: Penilaian;
  catatan: string | null;
  teacher_id: string;
  academic_year_id: string;
  created_at: string;
}

export interface Target {
  id: string;
  student_id: string;
  surah_id: string;
  ayat_mulai: number;
  ayat_selesai: number;
  deadline: string; // YYYY-MM-DD
  status: 'berjalan' | 'selesai';
  created_at: string;
}
