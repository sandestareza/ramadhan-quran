import { useState, useRef, useCallback, useEffect } from 'react';
import type { Ayat, QariKey } from '@/types';

interface AudioPlayerState {
  isPlaying: boolean;
  currentAyat: number | null;
  currentSurah: number | null;
  isFullSurah: boolean;
  progress: number;
  duration: number;
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentAyat: null,
    currentSurah: null,
    isFullSurah: false,
    progress: 0,
    duration: 0,
  });
  const ayatListRef = useRef<Ayat[]>([]);
  const qariRef = useRef<QariKey>('05'); // Default: Misyari Rasyid
  const currentAyatRef = useRef<number | null>(null);
  const currentSurahRef = useRef<number | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    currentAyatRef.current = state.currentAyat;
    currentSurahRef.current = state.currentSurah;
  }, [state.currentAyat, state.currentSurah]);

  const playAyat = useCallback((ayat: Ayat, surahNomor: number) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const audioUrl = ayat.audio[qariRef.current];
    
    audio.src = audioUrl;
    audio.play().catch(console.error);
    
    setState({
      isPlaying: true,
      currentAyat: ayat.nomorAyat,
      currentSurah: surahNomor,
      isFullSurah: false,
      progress: 0,
      duration: 0,
    });
  }, []);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setState(prev => ({
        ...prev,
        progress: audio.currentTime,
        duration: audio.duration || 0,
      }));
    });

    audio.addEventListener('ended', () => {
      // Use refs to get current values (avoids stale closure)
      const currentIdx = ayatListRef.current.findIndex(
        a => a.nomorAyat === currentAyatRef.current && (a.surahNomor ? a.surahNomor === currentSurahRef.current : true)
      );
      if (currentIdx >= 0 && currentIdx < ayatListRef.current.length - 1) {
        const nextAyat = ayatListRef.current[currentIdx + 1];
        // Use nextAyat.surahNomor if available, otherwise fallback to currentSurahRef
        const nextSurah = nextAyat.surahNomor || currentSurahRef.current!;
        playAyat(nextAyat, nextSurah);
      } else {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentAyat: null,
          isFullSurah: false,
        }));
      }
    });

    audio.addEventListener('error', () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
      }));
    });

    return () => {
      audio.pause();
      audio.removeAttribute('src');
    };
  }, [playAyat]);

  const playFullSurah = useCallback((ayatList: Ayat[], surahNomor: number) => {
    ayatListRef.current = ayatList;
    if (ayatList.length > 0) {
      setState(prev => ({ ...prev, isFullSurah: true }));
      playAyat(ayatList[0], surahNomor);
    }
  }, [playAyat]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(console.error);
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const togglePlay = useCallback((ayat: Ayat, surahNomor: number) => {
    if (state.currentAyat === ayat.nomorAyat && state.currentSurah === surahNomor) {
      if (state.isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      playAyat(ayat, surahNomor);
    }
  }, [state.currentAyat, state.currentSurah, state.isPlaying, pause, resume, playAyat]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
    }
    setState({
      isPlaying: false,
      currentAyat: null,
      currentSurah: null,
      isFullSurah: false,
      progress: 0,
      duration: 0,
    });
  }, []);

  const setQari = useCallback((qari: QariKey) => {
    qariRef.current = qari;
  }, []);

  const setAyatList = useCallback((ayatList: Ayat[]) => {
    ayatListRef.current = ayatList;
  }, []);

  return {
    ...state,
    playAyat,
    playFullSurah,
    pause,
    resume,
    togglePlay,
    stop,
    setQari,
    setAyatList,
  };
}
