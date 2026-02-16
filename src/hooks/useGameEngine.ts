import { useState, useCallback } from 'react';
import { quranApi } from '@/services/api';
import type { GameMode, GameQuestion, GameState, Ayat } from '@/types';

// Short surahs for kids (Juz 30: 78-114)
const SHORT_SURAH_RANGE = { start: 78, end: 114 };
const QUESTIONS_PER_ROUND = 10;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffleArray(arr).slice(0, count);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface SurahData {
  nomor: number;
  namaLatin: string;
  ayat: Ayat[];
}

async function fetchRandomSurahs(count: number): Promise<SurahData[]> {
  const ids = new Set<number>();
  while (ids.size < count) {
    ids.add(randomInt(SHORT_SURAH_RANGE.start, SHORT_SURAH_RANGE.end));
  }

  const results = await Promise.all(
    Array.from(ids).map(async (id) => {
      const detail = await quranApi.getSurahDetail(id);
      return {
        nomor: detail.nomor,
        namaLatin: detail.namaLatin,
        ayat: detail.ayat,
      };
    })
  );

  return results;
}

// Generate questions for "Tebak Surah" mode
async function generateTebakSurah(): Promise<GameQuestion[]> {
  const surahs = await fetchRandomSurahs(8);
  const questions: GameQuestion[] = [];

  for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
    const correct = surahs[i % surahs.length];
    const ayat = correct.ayat[randomInt(0, Math.min(correct.ayat.length - 1, 4))];

    // Pick 3 wrong answers
    const wrongSurahs = pickRandom(
      surahs.filter(s => s.nomor !== correct.nomor),
      3
    );

    const choices = shuffleArray([
      correct.namaLatin,
      ...wrongSurahs.map(s => s.namaLatin),
    ]);

    questions.push({
      id: i,
      questionText: ayat.teksArab,
      questionSubText: `Ayat ${ayat.nomorAyat}`,
      choices,
      correctIndex: choices.indexOf(correct.namaLatin),
      surahName: correct.namaLatin,
      audioUrl: ayat.audio['05'],
    });
  }

  return questions;
}

// Generate questions for "Sambung Ayat" mode
async function generateSambungAyat(): Promise<GameQuestion[]> {
  const surahs = await fetchRandomSurahs(6);
  const questions: GameQuestion[] = [];

  for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
    const surah = surahs[i % surahs.length];
    if (surah.ayat.length < 2) continue;

    const ayatIdx = randomInt(0, surah.ayat.length - 2);
    const currentAyat = surah.ayat[ayatIdx];
    const nextAyat = surah.ayat[ayatIdx + 1];

    // Get wrong options from other ayat in same or different surah
    const allOtherAyat = surahs
      .flatMap(s => s.ayat)
      .filter(a => a.nomorAyat !== nextAyat.nomorAyat || true)
      .filter(a => a.teksArab !== nextAyat.teksArab);

    const wrongAyat = pickRandom(allOtherAyat, 3);

    // Truncate for display — show first ~40 chars
    const truncate = (t: string) => t.length > 60 ? t.slice(0, 60) + '...' : t;

    const choices = shuffleArray([
      truncate(nextAyat.teksArab),
      ...wrongAyat.map(a => truncate(a.teksArab)),
    ]);

    questions.push({
      id: i,
      questionText: currentAyat.teksArab,
      questionSubText: `${surah.namaLatin} : ${currentAyat.nomorAyat} — Ayat selanjutnya?`,
      choices,
      correctIndex: choices.indexOf(truncate(nextAyat.teksArab)),
      surahName: surah.namaLatin,
      audioUrl: currentAyat.audio['05'],
    });
  }

  return questions.slice(0, QUESTIONS_PER_ROUND);
}

// Generate questions for "Tebak Arti" mode
async function generateTebakArti(): Promise<GameQuestion[]> {
  const surahs = await fetchRandomSurahs(6);
  const questions: GameQuestion[] = [];

  const allAyat = surahs.flatMap(s =>
    s.ayat.map(a => ({ ...a, surahName: s.namaLatin }))
  );

  const selected = pickRandom(allAyat, QUESTIONS_PER_ROUND);

  for (let i = 0; i < selected.length; i++) {
    const correct = selected[i];

    const wrongAyat = pickRandom(
      allAyat.filter(a => a.teksArab !== correct.teksArab),
      3
    );

    const truncate = (t: string) => t.length > 80 ? t.slice(0, 80) + '...' : t;

    const choices = shuffleArray([
      truncate(correct.teksIndonesia),
      ...wrongAyat.map(a => truncate(a.teksIndonesia)),
    ]);

    questions.push({
      id: i,
      questionText: correct.teksArab,
      questionSubText: correct.surahName,
      choices,
      correctIndex: choices.indexOf(truncate(correct.teksIndonesia)),
      surahName: correct.surahName,
      audioUrl: correct.audio['05'],
    });
  }

  return questions;
}

const INITIAL_STATE: GameState = {
  mode: 'tebak-surah',
  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  answers: [],
  status: 'playing',
  selectedAnswer: null,
};

export function useGameEngine() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);

  const startGame = useCallback(async (mode: GameMode) => {
    setLoading(true);
    try {
      let questions: GameQuestion[];
      switch (mode) {
        case 'tebak-surah':
          questions = await generateTebakSurah();
          break;
        case 'sambung-ayat':
          questions = await generateSambungAyat();
          break;
        case 'tebak-arti':
          questions = await generateTebakArti();
          break;
      }

      setState({
        mode,
        questions,
        currentIndex: 0,
        score: 0,
        streak: 0,
        bestStreak: 0,
        answers: new Array(questions.length).fill(null),
        status: 'playing',
        selectedAnswer: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = useCallback((choiceIndex: number) => {
    setState(prev => {
      if (prev.status !== 'playing') return prev;

      const question = prev.questions[prev.currentIndex];
      const isCorrect = choiceIndex === question.correctIndex;
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const streakBonus = isCorrect && newStreak >= 3 ? 5 : 0;
      const newScore = prev.score + (isCorrect ? 10 + streakBonus : 0);
      const newAnswers = [...prev.answers];
      newAnswers[prev.currentIndex] = isCorrect;

      return {
        ...prev,
        score: newScore,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        answers: newAnswers,
        status: 'answered',
        selectedAnswer: choiceIndex,
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState(prev => {
      const nextIdx = prev.currentIndex + 1;
      if (nextIdx >= prev.questions.length) {
        return { ...prev, status: 'finished' };
      }
      return {
        ...prev,
        currentIndex: nextIdx,
        status: 'playing',
        selectedAnswer: null,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    loading,
    startGame,
    submitAnswer,
    nextQuestion,
    resetGame,
  };
}
