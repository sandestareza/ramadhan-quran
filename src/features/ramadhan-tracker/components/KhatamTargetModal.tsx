import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, BookOpen } from 'lucide-react';
import { useRamadhanTracker } from '@/hooks/useRamadhanTracker';

interface KhatamTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KhatamTargetModal({ isOpen, onClose }: KhatamTargetModalProps) {
  const { targetKhatam, startPage, setTargetKhatam, setStartPage } = useRamadhanTracker();
  
  // Local state for editing
  const [localTarget, setLocalTarget] = useState(targetKhatam);
  const [localStartPage, setLocalStartPage] = useState(startPage);
  
  useEffect(() => {
    if (isOpen) {
      setLocalTarget(targetKhatam);
      setLocalStartPage(startPage);
    }
  }, [isOpen, targetKhatam, startPage]);

  const handleSave = () => {
    setTargetKhatam(localTarget);
    setStartPage(localStartPage);
    onClose();
  };

  const TOTAL_PAGES = 604;
  const totalPagesToRead = (TOTAL_PAGES * localTarget) - localStartPage;
  const estimatedDaily = Math.ceil(totalPagesToRead / 30); // Default 30 days

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[20%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-96 bg-white dark:bg-gray-900 rounded-3xl p-6 z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Target Khatam
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Target Khatam */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ingin khatam berapa kali?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((val) => (
                    <button
                      key={val}
                      onClick={() => setLocalTarget(val)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                        localTarget === val
                          ? 'bg-teal-50 border-teal-500 text-teal-700 ring-1 ring-teal-500'
                          : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {val} Kali
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Page */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mulai dari halaman berapa?
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="604"
                    value={localStartPage}
                    onChange={(e) => setLocalStartPage(Number(e.target.value))}
                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Isi 0 jika mulai dari awal (Al-Fatihah).
                </p>
              </div>

              {/* Estimation */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-blue-800 dark:text-blue-300">Target Harian:</span>
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-200">~{estimatedDaily} Hal</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 opacity-80">
                  Estimasi untuk 30 hari Ramadhan
                </p>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-500/30 transition-all"
              >
                Simpan Target
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
