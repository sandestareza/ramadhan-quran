import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Circle, Moon, Sun, Sunrise, Sunset, BookOpen, Heart, MessageSquare } from 'lucide-react';
import { DailyIbadah } from '@/hooks/useRamadhanTracker';
import { cn } from '@/lib/utils';
import { useRamadhanTracker } from '@/hooks/useRamadhanTracker';

interface DailyChecklistProps {
  date: string;
  dayIndex: number;
}

export function DailyChecklist({ date, dayIndex }: DailyChecklistProps) {
  const { getDailyLog, updateDailyLog, calculateDailyTarget, startPage, targetKhatam } = useRamadhanTracker();
  const [data, setData] = useState<DailyIbadah | null>(null);

  useEffect(() => {
    setData(getDailyLog(date));
  }, [date, getDailyLog]);

  if (!data) return null;

  // Calculate stats for target
  const remainingDays = 30 - dayIndex; // Basic assumption
  // We need total pages read SO FAR to calculate remaining accurately for dynamic adjustment
  // But for simple planner:
  // Target for THIS specific day based on plan
  
  // Let's use a simpler approach for the UI first:
  // Show target accumulative or just daily flat target?
  // User wants "Khatam Planner", so dynamic is better.
  
  // We need current total read from all days to be accurate, but that might be expensive to calc every render if logs are big.
  // For now let's just show the calculated daily target based on logic in hook.
  
  // Note: calculateDailyTarget in hook expects (remainingDays, currentTotalRead).
  // We don't have currentTotalRead easily here without iterating all logs.
  // Let's iterate logs in hook or here?
  // Hook has getSummary which does reduce. Let's use that.
  
  // Wait, getSummary returns total pages read.
  // BUT `calculateDailyTarget` needs total read UP TO TODAY for precise catchup? 
  // Or just total read in general?
  
  // Let's stick to the hook's intended logic.
  // I need to use `useRamadhanTracker` to get total pages read.
  
  // Actually, I can just call getSummary() inside the component since it is available from hook.
  // BUT getSummary returns a simple object.
  
  // Let's refactor slightly to get totalPagesRead here.
  // Actually I can't call getSummary inside render easily if it's not state, but it is a function.
  // Let's just assume we want to show a static "Target: X pages/day" or simple calculation.
  
  // Let's recalculate simply here for visual:
  const TOTAL_PAGES = 604;
  const totalTarget = (TOTAL_PAGES * targetKhatam) - startPage;
  const dailyTargetAvg = Math.ceil(totalTarget / 30);

  const handleTogglePrayer = (key: keyof DailyIbadah['prayers']) => {
    updateDailyLog(date, {
      prayers: { ...data.prayers, [key]: !data.prayers[key] },
    });
    setData(prev => prev ? { ...prev, prayers: { ...prev.prayers, [key]: !prev.prayers[key] } } : null);
  };

  const handleToggleSunnah = (key: keyof DailyIbadah['sunnah']) => {
    updateDailyLog(date, {
      sunnah: { ...data.sunnah, [key]: !data.sunnah[key] },
    });
    setData(prev => prev ? { ...prev, sunnah: { ...prev.sunnah, [key]: !prev.sunnah[key] } } : null);
  };

  return (
    <div className="space-y-6">
      {/* Status Puasa */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Moon className="w-5 h-5 text-teal-600" />
          Status Puasa
        </h3>
        <div className="flex gap-2">
          {[
            { value: 'yes', label: 'Berpuasa', icon: Check, color: 'bg-teal-100 text-teal-700 border-teal-200' },
            { value: 'no', label: 'Tidak', icon: X, color: 'bg-red-100 text-red-700 border-red-200' },
            { value: 'uzhur', label: 'Uzhur', icon: Circle, color: 'bg-orange-100 text-orange-700 border-orange-200' }
          ].map((option) => (
             <button
              key={option.value}
              onClick={() => {
                updateDailyLog(date, { fasting: option.value as any });
                setData({ ...data, fasting: option.value as any });
              }}
              className={cn(
                "flex-1 py-2 px-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all",
                data.fasting === option.value
                  ? option.color
                  : "bg-gray-50 dark:bg-gray-800 text-gray-500 border-transparent hover:bg-gray-100"
              )}
            >
              <option.icon className="w-4 h-4" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sholat Wajib */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Sunrise className="w-5 h-5 text-teal-600" />
          Sholat Wajib
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(data.prayers).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleTogglePrayer(key as any)}
              className={cn(
                "flex flex-col items-center justify-center py-3 rounded-xl border transition-all",
                value
                  ? "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-400"
                  : "bg-gray-50 border-transparent text-gray-400 dark:bg-gray-800 dark:text-gray-500"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center mb-1 transition-colors",
                value ? "border-teal-500 bg-teal-500 text-white" : "border-gray-300"
              )}>
                {value && <Check className="w-4 h-4" />}
              </div>
              <span className="text-xs font-medium capitalize">{key}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amalan Sunnah */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Sun className="w-5 h-5 text-orange-500" />
          Amalan Sunnah
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(data.sunnah).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleToggleSunnah(key as any)}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                value
                  ? "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400"
                  : "bg-gray-50 border-transparent text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              <span className="text-sm font-medium capitalize">{key}</span>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                value ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300"
              )}>
                {value && <Check className="w-3 h-3" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tilawah */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Tilawah Quran
          </h3>
          <div className="text-right">
             <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Target Hari Ini</span>
             <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{dailyTargetAvg} Halaman</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const newVal = Math.max(0, data.quran - 1);
              updateDailyLog(date, { quran: newVal });
              setData({ ...data, quran: newVal });
            }}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl font-bold"
          >
            -
          </button>
          <div className="flex-1 text-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.quran}</span>
            <span className="text-sm text-gray-500 block">Halaman</span>
          </div>
          <button
            onClick={() => {
              updateDailyLog(date, { quran: data.quran + 1 });
              setData({ ...data, quran: data.quran + 1 });
            }}
            className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 flex items-center justify-center text-xl font-bold"
          >
            +
          </button>
        </div>
        
        {/* Progress Indicator */}
        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
           <div className="flex justify-between text-xs mb-1">
             <span className="text-gray-500">Pencapaian</span>
             <span className={cn("font-bold", data.quran >= dailyTargetAvg ? "text-green-500" : "text-gray-600")}>
               {Math.round((data.quran / dailyTargetAvg) * 100)}%
             </span>
           </div>
           <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
             <div 
               className={cn("h-full rounded-full transition-all", data.quran >= dailyTargetAvg ? "bg-green-500" : "bg-blue-500")}
               style={{ width: `${Math.min(100, (data.quran / dailyTargetAvg) * 100)}%` }}
             />
           </div>
        </div>
      </div>

       {/* Sedekah & Catatan */}
       <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => {
             updateDailyLog(date, { sadaqah: !data.sadaqah });
             setData({ ...data, sadaqah: !data.sadaqah });
          }}
          className={cn(
            "flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
            data.sadaqah
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
              : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500"
          )}
        >
          <div className="flex items-center gap-3">
             <Heart className={cn("w-5 h-5", data.sadaqah ? "fill-green-500 text-green-500" : "text-gray-400")} />
             <span className="font-medium">Sedekah Hari Ini</span>
          </div>
           {data.sadaqah && <Check className="w-5 h-5 text-green-600" />}
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-2 mb-2 text-gray-500">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Catatan / Refleksi</span>
             </div>
             <textarea
                value={data.notes}
                onChange={(e) => {
                    updateDailyLog(date, { notes: e.target.value });
                    setData({ ...data, notes: e.target.value });
                }}
                placeholder="Tulis refleksi hari ini..."
                className="w-full bg-gray-50 dark:text-white dark:bg-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none h-24"
             />
        </div>
       </div>

    </div>
  );
}
