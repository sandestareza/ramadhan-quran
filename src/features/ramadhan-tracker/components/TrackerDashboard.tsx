import { useRamadhanTracker } from '@/hooks/useRamadhanTracker';
import { motion } from 'framer-motion';
import { Trophy, Book, Moon } from 'lucide-react';

export function TrackerDashboard() {
  const { getSummary, targetKhatam } = useRamadhanTracker();
  const summary = getSummary();

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10 shadow-lg"
      >
        <Moon className="w-5 h-5 text-teal-200 mx-auto mb-1 drop-shadow-sm" />
        <p className="text-lg font-bold text-white">{summary.totalFasting}</p>
        <p className="text-[10px] uppercase tracking-wide text-teal-100/70 font-medium">Hari Puasa</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10 shadow-lg"
      >
        <Book className="w-5 h-5 text-blue-200 mx-auto mb-1 drop-shadow-sm" />
        <p className="text-lg font-bold text-white">{summary.totalQuranPages}</p>
        <p className="text-[10px] uppercase tracking-wide text-blue-100/70 font-medium">Halaman</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10 shadow-lg"
      >
        <Trophy className="w-5 h-5 text-purple-200 mx-auto mb-1 drop-shadow-sm" />
        <p className="text-lg font-bold text-white">{summary.totalTarawih}</p>
        <p className="text-[10px] uppercase tracking-wide text-purple-100/70 font-medium">Tarawih</p>
      </motion.div>
    </div>
  );
}
