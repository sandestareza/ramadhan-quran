import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Settings2, Play, Pause, 
  Languages, Type, Eye
} from 'lucide-react';
import { useSurahDetail } from '@/hooks/useQuran';
import { useHafalanTracker } from '@/hooks/useHafalanTracker';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useSettings } from '@/hooks/useSettings';
import { HafalanAyatCard, type VisibilityMode } from './components/HafalanAyatCard';
import { AudioPlayerBar } from '@/components/AudioPlayerBar';
import { cn } from '@/lib/utils';
import type { Ayat } from '@/types';

export function HafalanSessionPage() {
    const { surahId } = useParams({ strict: false }) as { surahId: string };
    const navigate = useNavigate();
    const nomor = parseInt(surahId, 10);
    
    // Hooks
    const { data: surah, isLoading } = useSurahDetail(nomor);
    const { entries, toggleAyat } = useHafalanTracker();
    const audio = useAudioPlayer();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { settings } = useSettings();

    // Session State
    const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>('visible');
    const [showTranslation, setShowTranslation] = useState(false);
    const [showLatin, setShowLatin] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const memorizedEntry = entries.find(e => e.surahNomor === nomor);
    const memorizedAyatIds = memorizedEntry?.memorizedAyat || [];

    // Initialize audio
    useEffect(() => {
        if (surah?.ayat) {
            audio.setAyatList(surah.ayat);
        }
    }, [surah]);

    const handlePlayToggle = (ayat: Ayat) => {
        audio.togglePlay(ayat, nomor);
    }

    if (isLoading || !surah) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const progress = Math.round((memorizedAyatIds.length / surah.jumlahAyat) * 100);

    return (
        <div className="pb-32 bg-gray-50 dark:bg-black min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate({ to: '/hafalan' })}
                            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="font-bold text-gray-900 dark:text-gray-100">{surah.namaLatin}</h1>
                            <p className="text-xs text-gray-500">{memorizedAyatIds.length}/{surah.jumlahAyat} Hafal ({progress}%)</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                            showSettings 
                                ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        )}
                    >
                        <Settings2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Settings Panel */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
                        >
                            <div className="p-4 space-y-4">
                                {/* Visibility Controls */}
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mode Hafalan</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(['visible', 'blur', 'blur-middle', 'blur-end', 'hidden'] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setVisibilityMode(mode)}
                                                className={cn(
                                                    "flex-1 min-w-[30%] px-2 py-2 rounded-lg text-xs font-medium border transition-all capitalize text-center",
                                                    visibilityMode === mode
                                                        ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-800 dark:text-primary-400"
                                                        : "bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                                                )}
                                            >
                                                {mode === 'visible' && 'Normal'}
                                                {mode === 'blur' && 'Blur'}
                                                {mode === 'blur-middle' && 'Blur Tengah'}
                                                {mode === 'blur-end' && 'Blur Akhir'}
                                                {mode === 'hidden' && 'Sembunyi'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tampilan</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowTranslation(!showTranslation)}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                                                showTranslation
                                                    ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-800 dark:text-primary-400"
                                                    : "bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                                            )}
                                        >
                                            <Languages className="w-3.5 h-3.5" />
                                            Terjemahan
                                        </button>
                                        <button
                                            onClick={() => setShowLatin(!showLatin)}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                                                showLatin
                                                    ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-800 dark:text-primary-400"
                                                    : "bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                                            )}
                                        >
                                            <Type className="w-3.5 h-3.5" />
                                            Latin
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* List Ayat */}
            <div className="p-4 space-y-4 max-w-2xl mx-auto">
                {surah.ayat.map((ayat, idx) => (
                    <HafalanAyatCard
                        key={ayat.nomorAyat}
                        index={idx}
                        ayat={ayat}
                        isMemorized={memorizedAyatIds.includes(ayat.nomorAyat)}
                        visibilityMode={visibilityMode}
                        showTranslation={showTranslation}
                        showLatin={showLatin}
                        isPlaying={audio.currentAyat === ayat.nomorAyat && audio.currentSurah === nomor && audio.isPlaying}
                        onPlayToggle={() => handlePlayToggle(ayat)}
                        onToggleMemorized={() => toggleAyat(nomor, ayat.nomorAyat)}
                    />
                ))}
            </div>

            {/* Sticky Audio Controls */}
             <AudioPlayerBar
                isPlaying={audio.isPlaying}
                currentAyat={audio.currentAyat}
                currentSurah={audio.currentSurah}
                surahName={surah.namaLatin}
                progress={audio.progress}
                duration={audio.duration}
                onPlayPause={() => audio.isPlaying ? audio.pause() : audio.resume()}
                onStop={audio.stop}
            />
        </div>
    );
}
