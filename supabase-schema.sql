-- Supabase Schema for Hafalan Juz 30

-- 1. Create Tables
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_kelas TEXT NOT NULL,
    tingkat TEXT NOT NULL
);

CREATE TABLE public.academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tahun_pelajaran TEXT NOT NULL,
    status_aktif BOOLEAN DEFAULT false
);

CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama TEXT NOT NULL,
    nisn TEXT UNIQUE NOT NULL,
    kelas_id UUID REFERENCES public.classes(id),
    tahun_pelajaran_id UUID REFERENCES public.academic_years(id),
    username TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'aktif'
);

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
    siswa_id UUID REFERENCES public.students(id) ON DELETE SET NULL
);

CREATE TABLE public.surahs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nomor INTEGER NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    nama_arab TEXT NOT NULL,
    jumlah_ayat INTEGER NOT NULL
);

CREATE TABLE public.memorization_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) NOT NULL,
    tanggal DATE NOT NULL,
    surah_id UUID REFERENCES public.surahs(id) NOT NULL,
    ayat_mulai INTEGER NOT NULL,
    ayat_selesai INTEGER NOT NULL,
    jenis_setoran TEXT NOT NULL,
    penilaian TEXT NOT NULL,
    catatan TEXT,
    teacher_id UUID REFERENCES public.users(id) NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) NOT NULL,
    surah_id UUID REFERENCES public.surahs(id) NOT NULL,
    ayat_mulai INTEGER NOT NULL,
    ayat_selesai INTEGER NOT NULL,
    deadline DATE NOT NULL,
    status TEXT DEFAULT 'berjalan',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert Surah Data (Juz 30)
INSERT INTO public.surahs (nomor, nama, nama_arab, jumlah_ayat) VALUES
(78, 'An-Naba''', 'النبأ', 40),
(79, 'An-Nazi''at', 'النازعات', 46),
(80, '''Abasa', 'عبس', 42),
(81, 'At-Takwir', 'التكوير', 29),
(82, 'Al-Infitar', 'الانفطار', 19),
(83, 'Al-Mutaffifin', 'المطففين', 36),
(84, 'Al-Insyiqaq', 'الانشقاق', 25),
(85, 'Al-Buruj', 'البروج', 22),
(86, 'At-Tariq', 'الطارق', 17),
(87, 'Al-A''la', 'الأعلى', 19),
(88, 'Al-Ghasyiyah', 'الغاشية', 26),
(89, 'Al-Fajr', 'الفجر', 30),
(90, 'Al-Balad', 'البلد', 20),
(91, 'Asy-Syams', 'الشمس', 15),
(92, 'Al-Lail', 'الليل', 21),
(93, 'Ad-Duha', 'الضحى', 11),
(94, 'Asy-Syarh', 'الشرح', 8),
(95, 'At-Tin', 'التين', 8),
(96, 'Al-''Alaq', 'العلق', 19),
(97, 'Al-Qadr', 'القدر', 5),
(98, 'Al-Bayyinah', 'البينة', 8),
(99, 'Az-Zalzalah', 'الزلزلة', 8),
(100, 'Al-''Adiyat', 'العاديات', 11),
(101, 'Al-Qari''ah', 'القارعة', 11),
(102, 'At-Takatsur', 'التكاثر', 8),
(103, 'Al-''Asr', 'العصر', 3),
(104, 'Al-Humazah', 'الهمزة', 9),
(105, 'Al-Fil', 'الفيل', 5),
(106, 'Quraisy', 'قريش', 4),
(107, 'Al-Ma''un', 'الماعون', 7),
(108, 'Al-Kautsar', 'الكوثر', 3),
(109, 'Al-Kafirun', 'الكافرون', 6),
(110, 'An-Nasr', 'النصر', 3),
(111, 'Al-Lahab', 'المسد', 5),
(112, 'Al-Ikhlas', 'الإخلاص', 4),
(113, 'Al-Falaq', 'الفلق', 5),
(114, 'An-Nas', 'الناس', 6);

-- 3. Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorization_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- SURAHS: Everyone can read
CREATE POLICY "Surahs viewable by everyone" ON public.surahs FOR SELECT USING (true);

-- CLASSES: Everyone authenticated can read, teachers can manage
CREATE POLICY "Classes viewable by authenticated" ON public.classes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Classes managed by teachers" ON public.classes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);

-- ACADEMIC YEARS: Everyone authenticated can read, teachers can manage
CREATE POLICY "Academic years viewable by authenticated" ON public.academic_years FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Academic years managed by teachers" ON public.academic_years FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);

-- STUDENTS: Teachers can see all, manage all. Students can only see themselves.
CREATE POLICY "Students viewable by teachers" ON public.students FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "Students viewable by themselves" ON public.students FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'student' AND siswa_id = public.students.id)
);
CREATE POLICY "Students managed by teachers" ON public.students FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);

-- USERS: Teachers can read all, students can read themselves
CREATE POLICY "Users viewable by teachers" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "Users viewable by themselves" ON public.users FOR SELECT USING (
  id = auth.uid()
);
CREATE POLICY "Users managed by teachers" ON public.users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'teacher')
);

-- MEMORIZATION RECORDS: Teachers can read/write all. Students can only read theirs.
CREATE POLICY "Records viewable by teachers" ON public.memorization_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "Records viewable by student" ON public.memorization_records FOR SELECT USING (
  student_id IN (SELECT siswa_id FROM public.users WHERE id = auth.uid())
);
CREATE POLICY "Records managed by teachers" ON public.memorization_records FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);

-- TARGETS: Teachers can read/write all. Students can only read theirs.
CREATE POLICY "Targets viewable by teachers" ON public.targets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "Targets viewable by student" ON public.targets FOR SELECT USING (
  student_id IN (SELECT siswa_id FROM public.users WHERE id = auth.uid())
);
CREATE POLICY "Targets managed by teachers" ON public.targets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
);

-- Dummy Data (For Initial Testing)
-- We need to handle this manually since auth.users requires proper signup via API
