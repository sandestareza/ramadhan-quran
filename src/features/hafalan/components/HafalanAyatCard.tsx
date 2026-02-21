import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, BookmarkCheck, Check, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Ayat } from '@/types';

export type VisibilityMode = 'visible' | 'blur' | 'blur-middle' | 'blur-end' | 'hidden';

interface HafalanAyatCardProps {
  ayat: Ayat;
  isMemorized: boolean;
  visibilityMode: VisibilityMode;
  showTranslation: boolean;
  showLatin: boolean;
  onToggleMemorized: () => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  index: number;
}

export function HafalanAyatCard({
  ayat,
  isMemorized,
  visibilityMode,
  showTranslation,
  showLatin,
  onToggleMemorized,
  isPlaying,
  onPlayToggle,
  index,
}: HafalanAyatCardProps) {
  const [isPeeking, setIsPeeking] = useState(false);
  const touchTimeout = useRef<NodeJS.Timeout>(null);

  // Handle interactions for peek-to-reveal
  const handleStartPeek = () => {
    if (visibilityMode === 'visible') return;
    setIsPeeking(true);
  };

  const handleEndPeek = () => {
    if (visibilityMode === 'visible') return;
    // Small delay before hiding to prevent flickering on quick taps
    // @ts-ignore
    touchTimeout.current = setTimeout(() => {
      setIsPeeking(false);
    }, 150);
  };

  const currentVisibility = isPeeking ? 'visible' : visibilityMode;

  const renderArabicText = () => {
    if (currentVisibility === 'visible' || currentVisibility === 'hidden' || currentVisibility === 'blur') {
      return ayat.teksArab;
    }

    const words = ayat.teksArab.split(' ');
    const totalWords = words.length;
    let startBlur = 0;
    let endBlur = 0;

    if (currentVisibility === 'blur-middle') {
      startBlur = Math.max(1, Math.floor(totalWords * 0.25));
      endBlur = Math.min(totalWords - 1, Math.ceil(totalWords * 0.75));
      if (totalWords <= 2) {
        startBlur = 1;
        endBlur = 1;
      }
    } else if (currentVisibility === 'blur-end') {
      startBlur = Math.floor(totalWords * 0.5);
      endBlur = totalWords;
    }

    return words.map((word, wIdx) => {
      const isBlurred = wIdx >= startBlur && wIdx < endBlur;
      return (
        <span
          key={wIdx}
          className={cn(
            isBlurred && "blur-md opacity-40 select-none grayscale transition-all duration-300 inline-block"
          )}
        >
          {word}{' '}
        </span>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      id={`ayat-${ayat.nomorAyat}`}
      className={cn(
        'relative overflow-hidden rounded-2xl border transition-all duration-300 transform',
        isMemorized
          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800',
        isPlaying && 'ring-2 ring-purple-500'
      )}
    >
      {/* Top Status Bar */}
      {isMemorized && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
      )}

      <div className="p-5">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors',
            isMemorized
              ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          )}>
            {ayat.nomorAyat}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPlayToggle}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                isPlaying
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/30'
              )}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onToggleMemorized}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                isMemorized
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-green-100 dark:hover:bg-green-900/30'
              )}
            >
               {isMemorized ? <BookmarkCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content Area - Click/Hold to reveal */}
        <div
          className="relative min-h-16 group cursor-pointer select-none"
          onMouseDown={handleStartPeek}
          onMouseUp={handleEndPeek}
          onMouseLeave={handleEndPeek}
          onTouchStart={handleStartPeek}
          onTouchEnd={handleEndPeek}
        >
          {/* Arabic Text */}
          <div className={cn(
            "text-2xl md:text-3xl leading-loose text-right mb-4 transition-all duration-300",
            currentVisibility === 'blur' && "blur-md opacity-40 select-none scale-[0.98]",
            currentVisibility === 'hidden' && "opacity-0 select-none scale-90",
            (currentVisibility === 'blur' || currentVisibility === 'hidden') && "filter grayscale"
          )}>
            <div className="arabic-text text-gray-900 dark:text-gray-100" dir="rtl">
              {renderArabicText()}
            </div>
          </div>

           {/* Hint Overlay for Hidden/Blur modes */}
           {(visibilityMode !== 'visible' && !isPeeking) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="px-3 py-1.5 rounded-full bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-sm text-xs font-medium text-gray-500 flex items-center gap-1.5 shadow-sm border border-gray-200 dark:border-gray-700">
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tahan untuk mengintip</span>
                <span className="sm:hidden">Intip</span>
              </div>
            </div>
          )}
        </div>

        {/* Latin & Translation */}
        <div className="space-y-3 mt-4">
          <AnimatePresence>
            {showLatin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm text-purple-600 dark:text-purple-400 italic leading-relaxed">
                  {ayat.teksLatin}
                </p>
              </motion.div>
            )}
            {showTranslation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                 className="overflow-hidden"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
                  {ayat.teksIndonesia}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
