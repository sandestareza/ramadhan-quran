import { useState, useCallback, useEffect } from 'react';

const LAST_READ_KEY = 'ramadhan-quran-last-read-juz';

export interface LastReadJuz {
  juz: number;
  page: number;
  surahName?: string;
  ayatNumber?: number;
  timestamp: number;
}

function loadLastRead(): LastReadJuz | null {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLastRead(data: LastReadJuz) {
  localStorage.setItem(LAST_READ_KEY, JSON.stringify(data));
}

export function useLastReadJuz() {
  const [lastRead, setLastRead] = useState<LastReadJuz | null>(loadLastRead);

  const updateLastRead = useCallback((juz: number, page: number, surahName?: string, ayatNumber?: number) => {
    const newData: LastReadJuz = {
      juz,
      page,
      surahName,
      ayatNumber,
      timestamp: Date.now(),
    };
    setLastRead(newData);
    saveLastRead(newData);
  }, []);

  return {
    lastRead,
    updateLastRead,
  };
}
