import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerBarProps {
  isPlaying: boolean;
  currentAyat: number | null;
  currentSurah: number | null;
  surahName?: string;
  progress: number;
  duration: number;
  onPlayPause: () => void;
  onStop: () => void;
}

export function AudioPlayerBar({
  isPlaying,
  currentAyat,
  currentSurah,
  surahName,
  progress,
  duration,
  onPlayPause,
  onStop,
}: AudioPlayerBarProps) {
  const visible = currentAyat !== null && currentSurah !== null;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-[4.5rem] left-0 right-0 z-40 px-4 pb-2"
        >
          <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-gray-100 dark:bg-gray-800">
              <motion.div
                className="h-full bg-primary-500"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {surahName || `Surah ${currentSurah}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ayat {currentAyat}
                </p>
              </div>

              {/* Audio wave indicator */}
              {isPlaying && (
                <div className="audio-wave flex items-end h-4">
                  <span className="bg-primary-500" />
                  <span className="bg-primary-500" />
                  <span className="bg-primary-500" />
                  <span className="bg-primary-500" />
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onPlayPause}
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    'bg-primary-500 text-white hover:bg-primary-600 transition-colors'
                  )}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onStop}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
