import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useSurahDetail, useTafsir } from '@/hooks/useQuran';
import { useBookmark } from '@/hooks/useBookmark';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useSettings } from '@/hooks/useSettings';
import { AyatCard } from '@/components/AyatCard';
import { AudioPlayerBar } from '@/components/AudioPlayerBar';
import { AyatCardSkeleton } from '@/components/Skeleton';
import { cn } from '@/lib/utils';
import type { DisplayMode, SurahNav } from '@/types';
import { DISPLAY_MODE_LABELS } from '@/types';

export function SurahDetailPage() {
  const { surahId } = useParams({ strict: false }) as { surahId: string };
  const navigate = useNavigate();
  const nomor = parseInt(surahId, 10);
  const { data: surah, isLoading } = useSurahDetail(nomor);
  const { data: tafsirData } = useTafsir(nomor);
  const { isBookmarked, toggleBookmark } = useBookmark();
  const audio = useAudioPlayer();
  const { settings, setDisplayMode } = useSettings();
  
  const { ayat: scrollToAyat } = useSearch({ strict: false }) as { ayat?: number };
  const [activeTab, setActiveTab] = useState<'ayat' | 'tafsir'>('ayat');
  const [expandedTafsir, setExpandedTafsir] = useState<number | null>(null);
  const [showDisplayMenu, setShowDisplayMenu] = useState(false);
  const [highlightedAyat, setHighlightedAyat] = useState<number | null>(null);

  // Scroll to bookmarked ayat when data loads
  useEffect(() => {
    if (scrollToAyat && surah?.ayat) {
      // Small delay to let the DOM render
      const timer = setTimeout(() => {
        const el = document.getElementById(`ayat-${scrollToAyat}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedAyat(scrollToAyat);
          // Remove highlight after 2 seconds
          setTimeout(() => setHighlightedAyat(null), 2000);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [scrollToAyat, surah?.ayat]);

  // Auto-scroll to active ayat
  useEffect(() => {
    if (audio.currentAyat && audio.currentSurah === nomor) {
      const el = document.getElementById(`ayat-${audio.currentAyat}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [audio.currentAyat, audio.currentSurah, nomor]);

  // Set ayat list for audio auto-advance
  useEffect(() => {
    if (surah?.ayat) {
      audio.setAyatList(surah.ayat);
    }
  }, [surah?.ayat]);

  // Set qari from settings
  useEffect(() => {
    audio.setQari(settings.selectedQari);
  }, [settings.selectedQari]);

  const handlePlayFullSurah = useCallback(() => {
    if (!surah) return;
    if (audio.isPlaying && audio.currentSurah === nomor && audio.isFullSurah) {
      audio.pause();
    } else {
      audio.playFullSurah(surah.ayat, nomor);
    }
  }, [surah, audio, nomor]);

  const displayModes: DisplayMode[] = ['arabic', 'arabic-latin', 'arabic-translation', 'full'];

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-stone-50/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate({ to: '/surah' })}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
          
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
              {surah?.namaLatin || 'Loading...'}
            </h1>
            {surah && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {surah.tempatTurun} • {surah.jumlahAyat} Ayat
              </p>
            )}
          </div>

          {surah && (
            <p className="arabic-text text-xl text-primary-700 dark:text-primary-400 shrink-0">
              {surah.nama}
            </p>
          )}
        </div>

        {/* Controls bar */}
        {surah && (
          <div className="flex items-center gap-2 px-4 pb-3">
            {/* Play full surah */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayFullSurah}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-xs font-medium hover:bg-primary-600 transition-colors"
            >
              {audio.isPlaying && audio.currentSurah === nomor ? (
                <><Pause className="w-3.5 h-3.5" /> Pause</>
              ) : (
                <><Play className="w-3.5 h-3.5" /> Play Surah</>
              )}
            </motion.button>

            {/* Display mode */}
            <div className="relative ml-auto">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDisplayMenu(!showDisplayMenu)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{DISPLAY_MODE_LABELS[settings.displayMode]}</span>
                <ChevronDown className="w-3 h-3" />
              </motion.button>

              <AnimatePresence>
                {showDisplayMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-2 z-50"
                  >
                    {displayModes.map(mode => (
                      <button
                        key={mode}
                        onClick={() => {
                          setDisplayMode(mode);
                          setShowDisplayMenu(false);
                        }}
                        className={cn(
                          'w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors',
                          settings.displayMode === mode
                            ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        )}
                      >
                        {DISPLAY_MODE_LABELS[mode]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tab toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5">
              <button
                onClick={() => setActiveTab('ayat')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  activeTab === 'ayat'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                Ayat
              </button>
              <button
                onClick={() => setActiveTab('tafsir')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  activeTab === 'tafsir'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                Tafsir
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Surah description */}
      {surah && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mt-4 p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/30 dark:from-primary-950/30 dark:to-gray-900 border border-primary-100 dark:border-primary-900/30"
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed"
             dangerouslySetInnerHTML={{ __html: surah.deskripsi.substring(0, 200) + '...' }}
          />
        </motion.div>
      )}

      {/* Content */}
      <div className="px-5 mt-4 space-y-3 mb-6">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <AyatCardSkeleton key={i} />
          ))
        ) : activeTab === 'ayat' ? (
          /* Ayat list */
          surah?.ayat.map((ayat, index) => (
            <AyatCard
              key={ayat.nomorAyat}
              ayat={ayat}
              surahNomor={nomor}
              displayMode={settings.displayMode}
              isActive={audio.currentAyat === ayat.nomorAyat && audio.currentSurah === nomor || highlightedAyat === ayat.nomorAyat}
              isBookmarked={isBookmarked(nomor, ayat.nomorAyat)}
              isPlaying={audio.isPlaying && audio.currentAyat === ayat.nomorAyat && audio.currentSurah === nomor}
              onPlayToggle={() => audio.togglePlay(ayat, nomor)}
              onBookmarkToggle={() => toggleBookmark(nomor, surah.nama, surah.namaLatin, ayat)}
              index={index}
            />
          ))
        ) : (
          /* Tafsir list */
          tafsirData?.tafsir.map((t) => (
            <motion.div
              key={t.ayat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <button
                onClick={() => setExpandedTafsir(expandedTafsir === t.ayat ? null : t.ayat)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-400">
                    {t.ayat}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Tafsir Ayat {t.ayat}
                  </span>
                </div>
                {expandedTafsir === t.ayat ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {expandedTafsir === t.ayat && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                          {t.teks}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Surah navigation */}
      {surah && (
        <div className="px-5 mb-8 flex gap-3">
          {surah.suratSebelumnya && (
            <button
              onClick={() => navigate({ to: '/surah/$surahId', params: { surahId: String((surah.suratSebelumnya as SurahNav).nomor) }, search: { ayat: undefined } })}
              className="flex-1 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-left"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">← Sebelumnya</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {(surah.suratSebelumnya as SurahNav).namaLatin}
              </p>
            </button>
          )}
          {surah.suratSelanjutnya && (
            <button
              onClick={() => navigate({ to: '/surah/$surahId', params: { surahId: String((surah.suratSelanjutnya as SurahNav).nomor) }, search: { ayat: undefined } })}
              className="flex-1 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-right"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">Selanjutnya →</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {(surah.suratSelanjutnya as SurahNav).namaLatin}
              </p>
            </button>
          )}
        </div>
      )}

      {/* Audio Player Bar */}
      <AudioPlayerBar
        isPlaying={audio.isPlaying}
        currentAyat={audio.currentAyat}
        currentSurah={audio.currentSurah}
        surahName={surah?.namaLatin}
        progress={audio.progress}
        duration={audio.duration}
        onPlayPause={() => audio.isPlaying ? audio.pause() : audio.resume()}
        onStop={audio.stop}
      />
    </div>
  );
}
