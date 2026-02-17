import { useState, useEffect, useCallback } from 'react';

const HAFALAN_KEY = 'hafalan-tracker';

export interface HafalanEntry {
  surahNomor: number;
  surahName: string;
  surahNameAr: string;
  totalAyat: number;
  /** Which ayat numbers have been memorized */
  memorizedAyat: number[];
  /** Date string when first started */
  startedAt: string;
  /** Date string when fully completed (all ayat memorized) */
  completedAt: string | null;
}

function loadHafalan(): HafalanEntry[] {
  try {
    const raw = localStorage.getItem(HAFALAN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHafalan(entries: HafalanEntry[]) {
  localStorage.setItem(HAFALAN_KEY, JSON.stringify(entries));
}

export function useHafalanTracker() {
  const [entries, setEntries] = useState<HafalanEntry[]>(loadHafalan);

  useEffect(() => {
    saveHafalan(entries);
  }, [entries]);

  // Add a surah to hafalan targets
  const addSurah = useCallback((surah: { nomor: number; namaLatin: string; nama: string; jumlahAyat: number }) => {
    setEntries(prev => {
      if (prev.some(e => e.surahNomor === surah.nomor)) return prev;
      return [...prev, {
        surahNomor: surah.nomor,
        surahName: surah.namaLatin,
        surahNameAr: surah.nama,
        totalAyat: surah.jumlahAyat,
        memorizedAyat: [],
        startedAt: new Date().toISOString(),
        completedAt: null,
      }];
    });
  }, []);

  // Remove a surah from hafalan
  const removeSurah = useCallback((surahNomor: number) => {
    setEntries(prev => prev.filter(e => e.surahNomor !== surahNomor));
  }, []);

  // Toggle a single ayat as memorized/not
  const toggleAyat = useCallback((surahNomor: number, ayatNum: number) => {
    setEntries(prev => prev.map(e => {
      if (e.surahNomor !== surahNomor) return e;
      const has = e.memorizedAyat.includes(ayatNum);
      const newMemorized = has
        ? e.memorizedAyat.filter(a => a !== ayatNum)
        : [...e.memorizedAyat, ayatNum].sort((a, b) => a - b);
      const isComplete = newMemorized.length === e.totalAyat;
      return {
        ...e,
        memorizedAyat: newMemorized,
        completedAt: isComplete ? new Date().toISOString() : null,
      };
    }));
  }, []);

  // Mark all ayat as memorized
  const markAllMemorized = useCallback((surahNomor: number) => {
    setEntries(prev => prev.map(e => {
      if (e.surahNomor !== surahNomor) return e;
      const allAyat = Array.from({ length: e.totalAyat }, (_, i) => i + 1);
      return { ...e, memorizedAyat: allAyat, completedAt: new Date().toISOString() };
    }));
  }, []);

  // Reset progress for a surah
  const resetProgress = useCallback((surahNomor: number) => {
    setEntries(prev => prev.map(e => {
      if (e.surahNomor !== surahNomor) return e;
      return { ...e, memorizedAyat: [], completedAt: null };
    }));
  }, []);

  // Stats
  const totalSurahs = entries.length;
  const completedSurahs = entries.filter(e => e.completedAt !== null).length;
  const totalAyatTarget = entries.reduce((sum, e) => sum + e.totalAyat, 0);
  const totalAyatMemorized = entries.reduce((sum, e) => sum + e.memorizedAyat.length, 0);

  return {
    entries,
    addSurah,
    removeSurah,
    toggleAyat,
    markAllMemorized,
    resetProgress,
    totalSurahs,
    completedSurahs,
    totalAyatTarget,
    totalAyatMemorized,
  };
}
