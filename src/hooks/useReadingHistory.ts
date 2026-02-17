import { useState, useCallback, useEffect } from 'react';

const HISTORY_KEY = 'reading-history';
const MAX_HISTORY = 10;

export interface ReadingRecord {
  surahNomor: number;
  surahName: string;
  surahNameAr: string;
  lastAyat: number;
  totalAyat: number;
  timestamp: number; // Date.now()
}

function loadHistory(): ReadingRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(records: ReadingRecord[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
}

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingRecord[]>(loadHistory);

  // Persist on change
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Record a surah visit (upsert)
  const recordReading = useCallback((record: Omit<ReadingRecord, 'timestamp'>) => {
    setHistory(prev => {
      // Remove existing entry for this surah
      const filtered = prev.filter(r => r.surahNomor !== record.surahNomor);
      // Add to front with timestamp
      const updated = [{ ...record, timestamp: Date.now() }, ...filtered];
      // Keep only MAX_HISTORY
      return updated.slice(0, MAX_HISTORY);
    });
  }, []);

  // Update last ayat for current reading
  const updateLastAyat = useCallback((surahNomor: number, ayat: number) => {
    setHistory(prev => {
      const idx = prev.findIndex(r => r.surahNomor === surahNomor);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], lastAyat: ayat, timestamp: Date.now() };
      return updated;
    });
  }, []);

  // Get the most recent reading
  const lastRead = history.length > 0 ? history[0] : null;

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    lastRead,
    recordReading,
    updateLastAyat,
    clearHistory,
  };
}
