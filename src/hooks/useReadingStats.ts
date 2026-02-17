import { useState, useEffect, useCallback } from 'react';

const STATS_KEY = 'reading-stats';

export interface DailyReadingStat {
  date: string; // YYYY-MM-DD
  ayatCount: number;
  surahsVisited: string[]; // surah names
}

function loadStats(): DailyReadingStat[] {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveStats(stats: DailyReadingStat[]) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function useReadingStats() {
  const [stats, setStats] = useState<DailyReadingStat[]>(loadStats);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // Record ayat read for today
  const recordAyatRead = useCallback((count: number, surahName: string) => {
    setStats(prev => {
      const today = getToday();
      const updated = [...prev];
      const idx = updated.findIndex(s => s.date === today);

      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          ayatCount: updated[idx].ayatCount + count,
          surahsVisited: updated[idx].surahsVisited.includes(surahName)
            ? updated[idx].surahsVisited
            : [...updated[idx].surahsVisited, surahName],
        };
      } else {
        updated.push({ date: today, ayatCount: count, surahsVisited: [surahName] });
      }

      // Keep only last 30 days
      return updated.slice(-30);
    });
  }, []);

  // Get last N days of data (fills in zeros for missing days)
  const getLastNDays = useCallback((n: number): DailyReadingStat[] => {
    const result: DailyReadingStat[] = [];
    const now = new Date();

    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const existing = stats.find(s => s.date === dateStr);
      result.push(existing || { date: dateStr, ayatCount: 0, surahsVisited: [] });
    }

    return result;
  }, [stats]);

  // Weekly stats
  const weeklyData = getLastNDays(7);
  const weeklyTotal = weeklyData.reduce((sum, d) => sum + d.ayatCount, 0);
  const weeklyAvg = Math.round(weeklyTotal / 7);
  const todayStat = stats.find(s => s.date === getToday());
  const todayCount = todayStat?.ayatCount || 0;

  // Streak (consecutive days with reading)
  const streak = (() => {
    let count = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const stat = stats.find(s => s.date === dateStr);
      if (stat && stat.ayatCount > 0) {
        count++;
      } else if (i > 0) {
        // Allow today to be 0 (day not over yet)
        break;
      }
    }
    return count;
  })();

  return {
    stats,
    weeklyData,
    weeklyTotal,
    weeklyAvg,
    todayCount,
    streak,
    recordAyatRead,
    getLastNDays,
  };
}
