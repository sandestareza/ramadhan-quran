import { useParams, useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, BookOpen, PlayCircle, Pause, Play } from 'lucide-react';
import { useJuzDetail } from '@/hooks/useQuran';
import { useLastReadJuz } from '@/hooks/useLastReadJuz';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { AudioPlayerBar } from '@/components/AudioPlayerBar';
import type { JuzAyah, Ayat } from '@/types';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';

export function JuzReadingPage() {
  const { juzId } = useParams({ from: '/juz/$juzId' });
  const navigate = useNavigate();
  const juzNumber = Number(juzId);
  const { data: juzData, isLoading, error } = useJuzDetail(juzNumber);
  const { lastRead, updateLastRead } = useLastReadJuz();
  const [showLastReadPrompt, setShowLastReadPrompt] = useState(false);
  const audio = useAudioPlayer();
  const hasShownPrompt = useRef(false);

  // Reset prompt tracker when changing Juz
  useEffect(() => {
    hasShownPrompt.current = false;
    setShowLastReadPrompt(false);
  }, [juzNumber]);

  // Convert JuzAyah to Ayat for audio player
  const ayatList = useMemo(() => {
    if (!juzData) return [];
    return juzData.ayahs.map(ayah => ({
      nomorAyat: ayah.numberInSurah,
      teksArab: ayah.text,
      teksLatin: '',
      teksIndonesia: '',
      surahNomor: ayah.surah.number,
      audio: {
        '01': `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
        '02': `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
        '03': `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
        '04': `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
        '05': `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
        '06': `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
      }
    } as Ayat));
  }, [juzData]);

  // Set ayat list for audio player
  useEffect(() => {
    if (ayatList.length > 0) {
      audio.setAyatList(ayatList);
      // Ensure Qari is set to 05 (Misyari) as our URL is hardcoded for it currently
      audio.setQari('05'); 
    }
  }, [ayatList, audio]);

  // Check if there is a last read position for this Juz
  useEffect(() => {
    if (lastRead && lastRead.juz === juzNumber && !hasShownPrompt.current) {
      setShowLastReadPrompt(true);
      hasShownPrompt.current = true;
    }
  }, [lastRead, juzNumber]);

  // Auto-scroll to active ayat during playback
  useEffect(() => {
    if (audio.isPlaying && audio.currentAyat && audio.currentSurah) {
      // Find the global number or composite ID
      // Since we strictly use numberInSurah in UI, we need to match both
      const el = document.getElementById(`ayah-${audio.currentSurah}-${audio.currentAyat}`);
      if (el) {
         el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [audio.isPlaying, audio.currentAyat, audio.currentSurah]);


  const handleContinueReading = () => {
    if (lastRead?.ayatNumber && lastRead?.surahName) {
       // We need to find the element. The ID structure needs to be consistent.
       // Let's optimize ID generation to be unique: ayah-{surahNum}-{ayahNum}
       // But wait, lastRead stores surahName (englishName). We need to map it back or rely on data.
       // Simplification: We'll construct ID based on surah name in the map loop or just use what we have.
       // The current ID is `ayah-${ayah.numberInSurah}` which is NOT unique across surahs in a Juz.
       // FIX: Update ID generation in render.
       const ayah = juzData?.ayahs.find(a => a.surah.englishName === lastRead.surahName && a.numberInSurah === lastRead.ayatNumber);
       if (ayah) {
         const el = document.getElementById(`ayah-${ayah.surah.number}-${ayah.numberInSurah}`);
         if (el) {
           el.scrollIntoView({ behavior: 'smooth', block: 'center' });
           setShowLastReadPrompt(false);
         }
       }
    }
  };

  const handlePlayJuz = useCallback(() => {
    if (ayatList.length > 0) {
       if (audio.isPlaying) {
         audio.pause();
       } else {
         audio.playFullSurah(ayatList, ayatList[0].surahNomor!);
       }
    }
  }, [ayatList, audio]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
        <p className="text-gray-500 font-medium">Memuat Jus {juzNumber}...</p>
      </div>
    );
  }

  if (error || !juzData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
        <p className="text-gray-500 mb-6">Terjadi kesalahan saat mengambil data Jus {juzNumber}.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // Group ayahs by page
  const pages = juzData.ayahs.reduce((acc, ayah) => {
    const pageNum = ayah.page;
    if (!acc[pageNum]) {
      acc[pageNum] = [];
    }
    acc[pageNum].push(ayah);
    return acc;
  }, {} as Record<number, JuzAyah[]>);

  const pageNumbers = Object.keys(pages).map(Number).sort((a, b) => a - b);

  return (
    <div className="pb-safe bg-stone-50 dark:bg-gray-950 min-h-screen relative">
       {/* Last Read Prompt */}
       <AnimatePresence>
        {showLastReadPrompt && lastRead && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none"
          >
            <div className="bg-gray-900/90 text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-3 pointer-events-auto max-w-sm w-full">
              <div className="flex-1">
                <p className="text-xs text-gray-400">Terakhir dibaca</p>
                <p className="text-sm font-medium truncate">
                  {lastRead.surahName} : Ayat {lastRead.ayatNumber}
                </p>
              </div>
              <button
                onClick={handleContinueReading}
                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                <PlayCircle className="w-3 h-3" /> Lanjut
              </button>
              <button
                 onClick={() => setShowLastReadPrompt(false)}
                 className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400"
              >
                 <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 transition-all">
        <div className="px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: '/juz' })}
              className="w-8 h-8 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Juz {juzNumber}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Mode Menghafal & Membaca
              </p>
            </div>
          </div>
          
           <button
            onClick={handlePlayJuz}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
          >
             {audio.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Pages Container */}
      <div className="max-w-3xl mx-auto px-0 md:px-4 py-6">
        {pageNumbers.map((pageNum) => (
          <motion.div
            key={pageNum}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="bg-white dark:bg-gray-900 md:rounded-2xl shadow-sm border-y md:border border-gray-200 dark:border-gray-800 mb-6 overflow-hidden"
          >
            {/* Page Header */}
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <span>Halaman {pageNum}</span>
              <span>Juz {juzNumber}</span>
            </div>

            {/* Page Content */}
            <div className="p-6 md:p-8 lg:p-10" dir="rtl">
              <div className="text-justify leading-[2.5] text-2xl lg:text-3xl font-arabic text-gray-900 dark:text-gray-100">
                {pages[pageNum].map((ayah, index) => {
                  const isNewSurah = ayah.numberInSurah === 1;
                  const surahName = ayah.surah.name;
                  const isLastRead = lastRead?.juz === juzNumber && lastRead?.ayatNumber === ayah.numberInSurah && lastRead?.surahName === ayah.surah.englishName;
                  const isPlaying = audio.currentAyat === ayah.numberInSurah && audio.currentSurah === ayah.surah.number;

                  return (
                    <span key={ayah.number} id={`ayah-${ayah.surah.number}-${ayah.numberInSurah}`}>
                      {isNewSurah && (
                        <div className="my-8 w-full block text-center">
                          <div className="inline-block px-8 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl border border-primary-100 dark:border-primary-800">
                            <span className="text-xl font-bold text-primary-700 dark:text-primary-400 font-serif">
                              {surahName}
                            </span>
                          </div>
                          {ayah.surah.number !== 1 && ayah.surah.number !== 9 && (
                            <div className="mt-4 text-xl text-gray-600 dark:text-gray-400 font-arabic">
                              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Ayah Text */}
                      <span 
                        onClick={() => {
                            // If playing, play this specific ayah
                            if (audio.isPlaying || audio.currentAyat) {
                                // Find this ayah in the ayat list to play it
                                const mappedAyat = ayatList.find(a => a.nomorAyat === ayah.numberInSurah && a.surahNomor === ayah.surah.number);
                                if (mappedAyat) {
                                    audio.playFullSurah(ayatList, mappedAyat.surahNomor!);
                                    audio.playAyat(mappedAyat, ayah.surah.number);
                                }
                            } else {
                                // Check if we want to auto-play on click when not playing? 
                                // For now, let's keep it consistent: click plays if player is active or starts if we want?
                                // The requirement says text click ONLY triggers audio.
                                const mappedAyat = ayatList.find(a => a.nomorAyat === ayah.numberInSurah && a.surahNomor === ayah.surah.number);
                                if (mappedAyat) {
                                    audio.playAyat(mappedAyat, ayah.surah.number);
                                }
                            }
                        }}
                        className={`relative transition-colors cursor-pointer rounded px-1 ${
                          isLastRead ? 'bg-yellow-100/50 dark:bg-yellow-900/30' : ''
                        } ${
                          isPlaying ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'hover:text-primary-700 dark:hover:text-primary-400'
                        } ${
                        isNewSurah && ayah.surah.number !== 1 && ayah.surah.number !== 9 
                          ? ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '') 
                          : ayah.text
                      }`}>
                         {isNewSurah && ayah.surah.number !== 1 && ayah.surah.number !== 9 
                          ? ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim() 
                          : ayah.text}{" "}
                      </span>
                      
                      {/* End of Ayah Marker (Click to Mark Last Read) */}
                      <span className="inline-flex items-center gap-1 mx-1 align-middle">
                         <span 
                           onClick={(e) => {
                             e.stopPropagation();
                             updateLastRead(juzNumber, pageNum, ayah.surah.englishName, ayah.numberInSurah);
                           }}
                           className={`inline-flex items-center justify-center w-8 h-8 text-sm border rounded-full transition-all cursor-pointer font-sans ${
                             isLastRead
                               ? 'bg-yellow-500 border-yellow-500 text-white shadow-md transform scale-110'
                               : 'border-current text-primary-600 dark:text-primary-400 opacity-80 hover:opacity-100 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:scale-105'
                           }`}
                           title="Tandai Terakhir Dibaca"
                         >
                           {ayah.numberInSurah.toLocaleString('ar-EG')}
                         </span>
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Audio Player Bar */}
      <AudioPlayerBar
        isPlaying={audio.isPlaying}
        currentAyat={audio.currentAyat}
        currentSurah={audio.currentSurah}
        surahName={`Juz ${juzNumber}`}
        progress={audio.progress}
        duration={audio.duration}
        onPlayPause={() => audio.isPlaying ? audio.pause() : audio.resume()}
        onStop={audio.stop}
      />
    </div>
  );
}
