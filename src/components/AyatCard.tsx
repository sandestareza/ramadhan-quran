import { motion } from 'framer-motion';
import { Play, Pause, Bookmark, BookmarkCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Ayat, DisplayMode } from '@/types';

interface AyatCardProps {
  ayat: Ayat;
  surahNomor: number;
  displayMode: DisplayMode;
  isActive: boolean;
  isBookmarked: boolean;
  isPlaying: boolean;
  isMarkedRead?: boolean;
  onPlayToggle: () => void;
  onBookmarkToggle: () => void;
  onMarkRead?: () => void;
  index: number;
}

export function AyatCard({
  ayat,
  displayMode,
  isActive,
  isBookmarked,
  isPlaying,
  isMarkedRead,
  onPlayToggle,
  onBookmarkToggle,
  onMarkRead,
  index,
}: AyatCardProps) {
  const showLatin = displayMode === 'arabic-latin' || displayMode === 'full';
  const showTranslation = displayMode === 'arabic-translation' || displayMode === 'full';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      id={`ayat-${ayat.nomorAyat}`}
      className={cn(
        'p-5 rounded-2xl border transition-all duration-300',
        'bg-white dark:bg-gray-900',
        isActive
          ? 'ayat-active border-primary-300 dark:border-primary-600 bg-primary-50/50 dark:bg-primary-950/30'
          : 'border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-gray-700'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold',
          isActive
            ? 'bg-primary-500 text-white'
            : 'bg-primary-50 dark:bg-gray-800 text-primary-700 dark:text-primary-400'
        )}>
          {ayat.nomorAyat}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Play button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onPlayToggle}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
              isPlaying && isActive
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-gray-700'
            )}
          >
            {isPlaying && isActive ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </motion.button>

          {/* Bookmark button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBookmarkToggle}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
              isBookmarked
                ? 'bg-gold-500/10 text-gold-500'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </motion.button>

          {/* Mark read button */}
          {onMarkRead && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onMarkRead}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                isMarkedRead
                  ? 'bg-green-500/10 text-green-500 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-gray-700'
              )}
              title={isMarkedRead ? 'Sudah ditandai' : 'Tandai sudah baca'}
            >
              <CheckCircle2 className={cn('w-4 h-4', isMarkedRead && 'fill-green-500 dark:fill-green-400')} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Arabic text */}
      <p className="arabic-text text-2xl md:text-3xl leading-loose text-gray-900 dark:text-gray-100 mb-4">
        {ayat.teksArab}
      </p>

      {/* Latin */}
      {showLatin && (
        <p className="text-sm text-primary-700 dark:text-primary-400 italic mb-2 leading-relaxed">
          {ayat.teksLatin}
        </p>
      )}

      {/* Translation */}
      {showTranslation && (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {ayat.teksIndonesia}
        </p>
      )}
    </motion.div>
  );
}
