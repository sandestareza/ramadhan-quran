import { useState, useEffect, useCallback } from 'react';

const DZIKIR_KEY = 'dzikir-data';

export interface DzikirPreset {
  id: string;
  name: string;
  arabic: string;
  target: number;
}

export const DZIKIR_PRESETS: DzikirPreset[] = [
  { id: 'subhanallah', name: 'Subhanallah', arabic: 'سُبْحَانَ اللّٰهِ', target: 33 },
  { id: 'alhamdulillah', name: 'Alhamdulillah', arabic: 'اَلْحَمْدُ لِلّٰهِ', target: 33 },
  { id: 'allahuakbar', name: 'Allahu Akbar', arabic: 'اَللّٰهُ اَكْبَرُ', target: 33 },
  { id: 'lailahaillallah', name: 'Laa Ilaaha Illallah', arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ', target: 100 },
  { id: 'istighfar', name: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللّٰهَ', target: 100 },
  { id: 'hasbunallah', name: 'Hasbunallah', arabic: 'حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيلُ', target: 100 },
  { id: 'sholawat', name: 'Sholawat Nabi', arabic: 'اَللّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ', target: 100 },
  { id: 'laa-hawla', name: 'Laa Hawla', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ', target: 33 },
];

export interface DzikirLog {
  date: string; // YYYY-MM-DD
  counts: Record<string, number>; // presetId -> count
}

interface DzikirState {
  activePresetId: string;
  currentCount: number;
  logs: DzikirLog[];
  customTarget: Record<string, number>; // presetId -> custom target override
}

const DEFAULT_STATE: DzikirState = {
  activePresetId: DZIKIR_PRESETS[0].id,
  currentCount: 0,
  logs: [],
  customTarget: {},
};

function loadState(): DzikirState {
  try {
    const raw = localStorage.getItem(DZIKIR_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch { return DEFAULT_STATE; }
}

function saveState(state: DzikirState) {
  localStorage.setItem(DZIKIR_KEY, JSON.stringify(state));
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function useDzikir() {
  const [state, setState] = useState<DzikirState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const activePreset = DZIKIR_PRESETS.find(p => p.id === state.activePresetId) || DZIKIR_PRESETS[0];
  const target = state.customTarget[activePreset.id] ?? activePreset.target;

  // Select a preset
  const selectPreset = useCallback((presetId: string) => {
    setState(prev => {
      // Save current count to today's log before switching
      const today = getToday();
      let logs = [...prev.logs];
      if (prev.currentCount > 0) {
        const todayLog = logs.find(l => l.date === today);
        if (todayLog) {
          todayLog.counts = {
            ...todayLog.counts,
            [prev.activePresetId]: (todayLog.counts[prev.activePresetId] || 0) + prev.currentCount,
          };
        } else {
          logs.push({ date: today, counts: { [prev.activePresetId]: prev.currentCount } });
        }
      }
      // Keep only last 30 days
      logs = logs.slice(-30);
      return { ...prev, activePresetId: presetId, currentCount: 0, logs };
    });
  }, []);

  // Increment counter
  const increment = useCallback(() => {
    setState(prev => ({ ...prev, currentCount: prev.currentCount + 1 }));
  }, []);

  // Reset counter (saves to log first)
  const resetCounter = useCallback(() => {
    setState(prev => {
      const today = getToday();
      let logs = [...prev.logs];
      if (prev.currentCount > 0) {
        const todayLog = logs.find(l => l.date === today);
        if (todayLog) {
          todayLog.counts = {
            ...todayLog.counts,
            [prev.activePresetId]: (todayLog.counts[prev.activePresetId] || 0) + prev.currentCount,
          };
        } else {
          logs.push({ date: today, counts: { [prev.activePresetId]: prev.currentCount } });
        }
      }
      logs = logs.slice(-30);
      return { ...prev, currentCount: 0, logs };
    });
  }, []);

  // Set custom target for a preset
  const setTarget = useCallback((presetId: string, newTarget: number) => {
    setState(prev => ({
      ...prev,
      customTarget: { ...prev.customTarget, [presetId]: newTarget },
    }));
  }, []);

  // Get today's log
  const todayLog = state.logs.find(l => l.date === getToday());
  const todayTotal = todayLog
    ? Object.values(todayLog.counts).reduce((sum, c) => sum + c, 0)
    : 0;

  // Include current unsaved count
  const totalWithCurrent = todayTotal + state.currentCount;

  return {
    activePreset,
    currentCount: state.currentCount,
    target,
    logs: state.logs,
    todayTotal: totalWithCurrent,
    selectPreset,
    increment,
    resetCounter,
    setTarget,
    presets: DZIKIR_PRESETS,
  };
}
