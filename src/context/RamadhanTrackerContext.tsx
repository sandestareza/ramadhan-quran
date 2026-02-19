import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const RAMADHAN_TRACKER_KEY = 'ramadhan-tracker-data';

export interface DailyIbadah {
  date: string; // YYYY-MM-DD
  fasting: 'yes' | 'no' | 'uzhur';
  prayers: {
    subuh: boolean;
    dzuhur: boolean;
    ashar: boolean;
    maghrib: boolean;
    isya: boolean;
  };
  sunnah: {
    tarawih: boolean;
    witir: boolean;
    dhuha: boolean;
    tahajud: boolean;
    rawatib: boolean;
  };
  quran: number; // Halaman hari ini
  sadaqah: boolean;
  notes: string;
}

interface RamadhanState {
  logs: Record<string, DailyIbadah>;
  targetKhatam: number;
  startPage: number; // Halaman mulai (offset)
}

const DEFAULT_IBADAH: DailyIbadah = {
  date: '',
  fasting: 'yes',
  prayers: {
    subuh: false,
    dzuhur: false,
    ashar: false,
    maghrib: false,
    isya: false,
  },
  sunnah: {
    tarawih: false,
    witir: false,
    dhuha: false,
    tahajud: false,
    rawatib: false,
  },
  quran: 0,
  sadaqah: false,
  notes: '',
};

const DEFAULT_STATE: RamadhanState = {
  logs: {},
  targetKhatam: 1,
  startPage: 0,
};

interface RamadhanTrackerContextType {
  getDailyLog: (date: string) => DailyIbadah;
  updateDailyLog: (date: string, data: Partial<DailyIbadah>) => void;
  setTargetKhatam: (target: number) => void;
  setStartPage: (page: number) => void;
  getSummary: () => { totalFasting: number; totalQuranPages: number; totalTarawih: number };
  getDailyProgress: (date: string) => number;
  calculateDailyTarget: (remainingDays: number, currentTotalRead: number) => number;
  targetKhatam: number;
  startPage: number;
  logs: Record<string, DailyIbadah>;
}

export const RamadhanTrackerContext = createContext<RamadhanTrackerContextType | null>(null);

function loadState(): RamadhanState {
  try {
    const raw = localStorage.getItem(RAMADHAN_TRACKER_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch { return DEFAULT_STATE; }
}

function saveState(state: RamadhanState) {
  localStorage.setItem(RAMADHAN_TRACKER_KEY, JSON.stringify(state));
}

export function RamadhanTrackerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RamadhanState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const getDailyLog = useCallback((date: string): DailyIbadah => {
    return state.logs[date] || { ...DEFAULT_IBADAH, date };
  }, [state.logs]);

  const updateDailyLog = useCallback((date: string, data: Partial<DailyIbadah>) => {
    setState(prev => {
      const currentConfig = prev.logs[date] || { ...DEFAULT_IBADAH, date };
      return {
        ...prev,
        logs: {
          ...prev.logs,
          [date]: { ...currentConfig, ...data },
        },
      };
    });
  }, []);

  const setTargetKhatam = useCallback((target: number) => {
    setState(prev => ({ ...prev, targetKhatam: target }));
  }, []);

  const setStartPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, startPage: page }));
  }, []);

  const calculateDailyTarget = useCallback((remainingDays: number, currentTotalRead: number) => {
    const TOTAL_PAGES = 604;
    const totalTargetPages = (TOTAL_PAGES * state.targetKhatam) - state.startPage;
    const remainingPages = Math.max(0, totalTargetPages - currentTotalRead);
    
    if (remainingDays <= 0) return remainingPages;
    return Math.ceil(remainingPages / remainingDays);
  }, [state.targetKhatam, state.startPage]);

  const getSummary = useCallback(() => {
    const logs = Object.values(state.logs);
    return {
      totalFasting: logs.filter(l => l.fasting === 'yes').length,
      totalQuranPages: logs.reduce((acc, curr) => acc + curr.quran, 0),
      totalTarawih: logs.filter(l => l.sunnah.tarawih).length,
    };
  }, [state.logs]);

  const getDailyProgress = useCallback((date: string) => {
    const log = state.logs[date] || DEFAULT_IBADAH;
    let total = 0;
    let completed = 0;

    // Fasting (1 point)
    total++;
    if (log.fasting === 'yes') completed++;

    // Prayers (5 points)
    Object.values(log.prayers).forEach(p => {
      total++;
      if (p) completed++;
    });

    // Sunnah (5 points)
    Object.values(log.sunnah).forEach(s => {
      total++;
      if (s) completed++;
    });

    // Quran (1 point if > 0)
    total++;
    if (log.quran > 0) completed++;

    // Sadaqah (1 point)
    total++;
    if (log.sadaqah) completed++;

    return Math.round((completed / total) * 100);
  }, [state.logs]);

  return (
    <RamadhanTrackerContext.Provider value={{
      getDailyLog,
      updateDailyLog,
      setTargetKhatam,
      setStartPage,
      getSummary,
      getDailyProgress,
      calculateDailyTarget,
      targetKhatam: state.targetKhatam,
      startPage: state.startPage,
      logs: state.logs,
    }}>
      {children}
    </RamadhanTrackerContext.Provider>
  );
}
