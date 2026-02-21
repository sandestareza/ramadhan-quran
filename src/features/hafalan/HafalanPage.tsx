import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trophy, CheckCircle2, Circle, ChevronDown, ChevronUp, RotateCcw, Trash2, Check, BookOpen } from 'lucide-react';
import { useHafalanTracker } from '@/hooks/useHafalanTracker';
import { useSurahList } from '@/hooks/useQuran';
import { cn } from '@/lib/utils';

export function HafalanPage() {
  const {
    entries, addSurah, removeSurah, toggleAyat, markAllMemorized, resetProgress,
    totalSurahs, completedSurahs, totalAyatTarget, totalAyatMemorized,
  } = useHafalanTracker();
  const { data: surahs } = useSurahList();
  const navigate = useNavigate();

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [expandedSurah, setExpandedSurah] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const overallProgress = totalAyatTarget > 0 ? Math.round((totalAyatMemorized / totalAyatTarget) * 100) : 0;

  // Filter surahs not already in hafalan for add panel
  const availableSurahs = surahs
    ?.filter(s => !entries.some(e => e.surahNomor === s.nomor))
    .filter(s =>
      searchTerm === '' ||
      s.namaLatin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(s.nomor).includes(searchTerm)
    ) ?? [];

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-stone-50/80 dark:bg-gray-950/80 backdrop-blur-xl px-5 pt-6 pb-3">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Target Hafalan</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            Lacak progres hafalan Al-Qur'an
          </p>
        </motion.div>
      </div>

      <div className="px-5">
        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-br from-violet-500 via-purple-600 to-indigo-700 dark:from-violet-700 dark:via-purple-800 dark:to-indigo-900 rounded-2xl p-5 mb-6 relative overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 border border-white/10 rounded-full" />
          <div className="absolute -bottom-4 -right-4 w-20 h-20 border border-white/10 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs">Progres Keseluruhan</p>
                <p className="text-3xl font-bold text-white">{overallProgress}%</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-white rounded-full"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/15 rounded-xl p-2.5 text-center">
                <p className="text-xl font-bold text-white">{totalSurahs}</p>
                <p className="text-[10px] text-white/70">Target Surah</p>
              </div>
              <div className="bg-white/15 rounded-xl p-2.5 text-center">
                <p className="text-xl font-bold text-white">{completedSurahs}</p>
                <p className="text-[10px] text-white/70">Selesai</p>
              </div>
              <div className="bg-white/15 rounded-xl p-2.5 text-center">
                <p className="text-xl font-bold text-white">{totalAyatMemorized}</p>
                <p className="text-[10px] text-white/70">Ayat Hafal</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add surah button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddPanel(!showAddPanel)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-semibold text-sm mb-4 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Surah Target
        </motion.button>

        {/* Add surah panel */}
        <AnimatePresence>
          {showAddPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                <input
                  type="text"
                  placeholder="Cari surah..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 border-none outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-700 mb-3"
                />
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {availableSurahs.slice(0, 20).map(s => (
                    <button
                      key={s.nomor}
                      onClick={() => {
                        addSurah(s);
                        setSearchTerm('');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                          {s.nomor}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.namaLatin}</p>
                          <p className="text-[10px] text-gray-400">{s.jumlahAyat} ayat</p>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-purple-500" />
                    </button>
                  ))}
                  {availableSurahs.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-4">
                      {surahs ? 'Semua surah sudah ditambahkan' : 'Memuat...'}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hafalan list */}
        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada target hafalan</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Tambahkan surah untuk mulai melacak hafalan</p>
          </motion.div>
        ) : (
          <div className="space-y-3 mb-8">
            {entries.map((entry, idx) => {
              const progress = entry.totalAyat > 0
                ? Math.round((entry.memorizedAyat.length / entry.totalAyat) * 100)
                : 0;
              const isExpanded = expandedSurah === entry.surahNomor;
              const isComplete = entry.completedAt !== null;

              return (
                <motion.div
                  key={entry.surahNomor}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'rounded-2xl border p-4 transition-colors',
                    isComplete
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/50'
                      : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                  )}
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpandedSurah(isExpanded ? null : entry.surahNomor)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        isComplete
                          ? 'bg-green-100 dark:bg-green-900/50'
                          : 'bg-purple-50 dark:bg-purple-950/30'
                      )}>
                        {isComplete ? (
                          <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{entry.surahNomor}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{entry.surahName}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {entry.memorizedAyat.length}/{entry.totalAyat} ayat — {progress}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isComplete && (
                        <span className="text-[10px] bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                          Selesai ✓
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      className={cn(
                        'h-full rounded-full',
                        isComplete ? 'bg-green-500' : 'bg-purple-500 dark:bg-purple-400'
                      )}
                    />
                  </div>

                  {/* Expanded: ayat grid + actions */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Ketuk ayat untuk tandai hafal:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.from({ length: entry.totalAyat }, (_, i) => i + 1).map(ayatNum => {
                              const isMemorized = entry.memorizedAyat.includes(ayatNum);
                              return (
                                <button
                                  key={ayatNum}
                                  onClick={() => toggleAyat(entry.surahNomor, ayatNum)}
                                  className={cn(
                                    'w-9 h-9 rounded-lg text-xs font-medium transition-all flex items-center justify-center',
                                    isMemorized
                                      ? 'bg-purple-500 dark:bg-purple-600 text-white shadow-sm'
                                      : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-950/30'
                                  )}
                                >
                                  {isMemorized ? <Check className="w-3.5 h-3.5" /> : ayatNum}
                                </button>
                              );
                            })}
                          </div>

                          {/* Actions */}
                          <div className="grid grid-cols-2 items-center gap-2 mt-4">
                            <button
                              onClick={() => navigate({ to: '/hafalan/$surahId', params: { surahId: String(entry.surahNomor) } })}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              Mulai Hafalan
                            </button>
                            <button
                              onClick={() => markAllMemorized(entry.surahNomor)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Tandai Semua
                            </button>
                            <button
                              onClick={() => resetProgress(entry.surahNomor)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Reset
                            </button>
                            <button
                              onClick={() => {
                                setExpandedSurah(null);
                                removeSurah(entry.surahNomor);
                              }}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Hapus
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
