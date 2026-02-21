// API Response Types
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// Audio map from 6 qari
export interface AudioMap {
  '01': string; // Abdullah Al-Juhany
  '02': string; // Abdul Muhsin Al-Qasim
  '03': string; // Abdurrahman As-Sudais
  '04': string; // Ibrahim Al-Dossari
  '05': string; // Misyari Rasyid Al-Afasy
  '06': string; // Yasser Al-Dosari
}

export type QariKey = keyof AudioMap;

export const QARI_NAMES: Record<QariKey, string> = {
  '01': 'Abdullah Al-Juhany',
  '02': 'Abdul Muhsin Al-Qasim',
  '03': 'Abdurrahman As-Sudais',
  '04': 'Ibrahim Al-Dossari',
  '05': 'Misyari Rasyid Al-Afasy',
  '06': 'Yasser Al-Dosari',
};

// Surah (list item)
export interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: AudioMap;
}

// Ayat
export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: AudioMap;
  surahNomor?: number;
}

// Surah Navigation
export interface SurahNav {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
}

// Surah Detail (with ayat)
export interface SurahDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: AudioMap;
  ayat: Ayat[];
  suratSelanjutnya: SurahNav | false;
  suratSebelumnya: SurahNav | false;
}

// Tafsir ayat
export interface TafsirAyat {
  ayat: number;
  teks: string;
}

// Tafsir response
export interface TafsirData {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: AudioMap;
  tafsir: TafsirAyat[];
}

// Bookmark
export interface Bookmark {
  id: string; // `${surahNomor}:${ayatNomor}`
  surahNomor: number;
  surahNama: string;
  surahNamaLatin: string;
  ayatNomor: number;
  teksArab: string;
  teksIndonesia: string;
  createdAt: number;
}

// Display modes
export type DisplayMode = 'arabic' | 'arabic-latin' | 'arabic-translation' | 'full';

export const DISPLAY_MODE_LABELS: Record<DisplayMode, string> = {
  'arabic': 'Arabic Only',
  'arabic-latin': 'Arabic + Latin',
  'arabic-translation': 'Arabic + Translation',
  'full': 'Full (Arabic + Latin + Translation)',
};

// Arabic Fonts
export type ArabicFont = 'isepmisbah' | 'amiri' | 'amiri-quran' | 'traditional';

export const ARABIC_FONT_LABELS: Record<ArabicFont, string> = {
  'isepmisbah': 'LPMQ IsepMisbah (Kemenag)',
  'amiri': 'Amiri',
  'amiri-quran': 'Amiri Quran',
  'traditional': 'Traditional Arabic',
};

// Juz mapping
export interface JuzInfo {
  juz: number;
  start: { surah: number; ayat: number };
  end: { surah: number; ayat: number };
  surahNames?: string[];
}

// Settings
export interface AppSettings {
  darkMode: boolean;
  displayMode: DisplayMode;
  selectedQari: QariKey;
  arabicFont: ArabicFont;
}

// Doa
export interface Doa {
  id: number;
  grup: string;
  nama: string;
  ar: string;
  tr: string;
  idn: string;
  tentang: string;
  tag: string[];
}

export interface DoaApiResponse {
  status: string;
  total: number;
  data: Doa[];
}

// Jadwal Sholat
export interface JadwalSholat {
  tanggal: number;
  tanggal_lengkap: string;
  hari: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface JadwalSholatResponse {
  provinsi: string;
  kabkota: string;
  bulan: number;
  tahun: number;
  bulan_nama: string;
  jadwal: JadwalSholat[];
}

export interface SholatLocation {
  provinsi: string;
  kabkota: string;
}

// Game
export type GameMode = 'tebak-surah' | 'sambung-ayat' | 'tebak-arti';

export interface GameQuestion {
  id: number;
  questionText: string;        // main display (arabic text or prompt)
  questionSubText?: string;    // secondary text (latin hint)
  choices: string[];           // 4 answer options
  correctIndex: number;        // index of correct answer
  surahName?: string;          // for showing after answer
  audioUrl?: string;           // ayat audio URL
}

export interface GameState {
  mode: GameMode;
  questions: GameQuestion[];
  currentIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  answers: (boolean | null)[];  // track each answer
  status: 'playing' | 'answered' | 'finished';
  selectedAnswer: number | null;
}


// Juz Detail from api.alquran.cloud
export interface JuzAyah {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
  };
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface JuzDetail {
  number: number;
  ayahs: JuzAyah[];
  surahs: { [key: number]: Surah }; // Helper for grouping
  edition: {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: string;
    type: string;
    direction: string;
  };
}

export interface JuzApiResponse {
  code: number;
  status: string;
  data: JuzDetail;
}
