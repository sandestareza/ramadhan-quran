import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyChecklist } from './components/DailyChecklist';
import { TrackerDashboard } from './components/TrackerDashboard';
import { KhatamTargetModal } from './components/KhatamTargetModal';
import { cn } from '@/lib/utils';
import { format, addDays, startOfToday } from 'date-fns';
import { id } from 'date-fns/locale';
import { useRamadhanTracker } from '@/hooks/useRamadhanTracker';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { RamadhanTrackerProvider } from '@/context/RamadhanTrackerContext';

function RamadhanTrackerContent() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));
  const { getDailyProgress, getDailyLog } = useRamadhanTracker();
  const [isKhatamModalOpen, setIsKhatamModalOpen] = useState(false);

  // Calculate Ramadhan days (Mock for now, should ideally be configured)
  // Assuming Ramadhan 2026 starts around Feb 19
  const ramadhanStart = new Date('2026-02-19'); 
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(ramadhanStart, i);
    return {
      day: i + 1,
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE', { locale: id }), // Senin, Selasa...
      dateNum: format(date, 'dd'), // 18, 19...
    };
  });

  const selectedDayIndex = days.findIndex(d => d.date === selectedDate);
  const currentProgress = getDailyProgress(selectedDate);

  // Scroll to selected day on mount
  const scrollRef = (node: HTMLDivElement) => {
    if (node) {
      const selected = node.querySelector(`[data-date="${selectedDate}"]`);
      if (selected) {
        // selected.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  return (
    <div className="pb-24 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <KhatamTargetModal 
        isOpen={isKhatamModalOpen} 
        onClose={() => setIsKhatamModalOpen(false)} 
      />

      {/* Header */}
      <div className="bg-linear-to-br from-teal-600 to-teal-800 dark:from-teal-700 dark:to-teal-950 pt-8 pb-6 px-6 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
         {/* Background pattern */}
         <div className="absolute top-0 right-0 opacity-10 text-[10rem] transform translate-x-12 -translate-y-8 select-none pointer-events-none">🌙</div>
         <div className="absolute bottom-0 left-0 opacity-5 text-[8rem] transform -translate-x-8 translate-y-12 select-none pointer-events-none">✨</div>
         
         <div className="relative z-10 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate({ to: '/' })}
                className="bg-white/10 backdrop-blur-md p-2 rounded-xl text-white hover:bg-white/20 transition-all border border-white/10 active:scale-95"
              >
                 <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                 <h1 className="text-xl font-bold text-white leading-tight">Ramadhan Tracker</h1>
                 <p className="text-teal-100/80 text-xs font-medium">
                   Hari ke-{days[selectedDayIndex]?.day || '?'}
                 </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsKhatamModalOpen(true)}
              className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl text-white hover:bg-white/20 transition-all border border-white/10 active:scale-95 flex items-center gap-2 group"
            >
               <span className="text-xs font-medium text-teal-100/90 hidden sm:inline-block group-hover:text-white">Target Khatam</span>
               <Trophy className="w-5 h-5 text-yellow-300 drop-shadow-md" />
            </button>
         </div>

         <TrackerDashboard />
      </div>

      <div className="-mt-8">
        {/* Horizontal Calendar Strip */}
        <div className="flex overflow-x-auto gap-3 px-6 pb-6 pt-10 snap-x hide-scrollbar" ref={scrollRef}>
          {days.map((day) => {
            const isSelected = day.date === selectedDate;
            const progress = getDailyProgress(day.date);
            const isPast = day.date < format(startOfToday(), 'yyyy-MM-dd');
            
            return (
              <button
                key={day.date}
                data-date={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-14 h-20 rounded-2xl transition-all snap-center border-2",
                  isSelected
                    ? "bg-teal-500 border-teal-600 text-white shadow-lg scale-105"
                    : "bg-white dark:bg-gray-800 border-transparent text-gray-500 dark:text-gray-400"
                )}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{day.dayName}</span>
                <span className={cn("text-xl font-bold my-1", isSelected ? "text-white" : "text-gray-900 dark:text-gray-100")}>{day.dateNum}</span>
                
                {/* Progress Dot */}
                <div className="h-1.5 w-8 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-1">
                   <div 
                      className={cn("h-full rounded-full transition-all duration-500", 
                        progress === 100 ? "bg-green-400" : isSelected ? "bg-white" : "bg-teal-500"
                      )} 
                      style={{ width: `${progress}%` }} 
                   />
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-5 mt-2">
            {/* Daily Progress Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Progress Harian</h3>
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{currentProgress}%</span>
               </div>
               <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${currentProgress}%` }}
                     transition={{ duration: 0.5, ease: "easeOut" }}
                     className={cn(
                        "h-full rounded-full transition-all",
                        currentProgress === 100 ? "bg-green-500" : "bg-teal-500"
                     )}
                  />
               </div>
               <p className="text-xs text-gray-400 mt-2 text-center">
                  {currentProgress === 100 ? "Alhamdulillah, target harian tercapai! 🎉" : "Yuk selesaikan target ibadahmu hari ini!"}
               </p>
            </div>

            {/* Checklist Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DailyChecklist date={selectedDate} dayIndex={selectedDayIndex} />
              </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function RamadhanTrackerPage() {
  return (
    <RamadhanTrackerProvider>
      <RamadhanTrackerContent />
    </RamadhanTrackerProvider>
  );
}
