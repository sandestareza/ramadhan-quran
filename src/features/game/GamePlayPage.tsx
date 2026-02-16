import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, CheckCircle2, XCircle, Star, Trophy, RotateCcw, Home, Zap, Volume2, VolumeX } from 'lucide-react';
import { useGameEngine } from '@/hooks/useGameEngine';
import type { GameMode } from '@/types';

const MODE_CONFIG: Record<GameMode, { title: string; emoji: string; color: string }> = {
  'tebak-surah': { title: 'Tebak Surah', emoji: '🎯', color: 'from-amber-400 to-orange-500' },
  'sambung-ayat': { title: 'Sambung Ayat', emoji: '📝', color: 'from-pink-400 to-rose-500' },
  'tebak-arti': { title: 'Tebak Arti', emoji: '🌍', color: 'from-violet-400 to-purple-500' },
};

function ConfettiBurst() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.3,
    size: Math.random() * 8 + 4,
    color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F', '#BB8FCE'][i % 6],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: '100vh', x: `${p.x}vw`, opacity: 1, scale: 1 }}
          animate={{ y: '-20vh', opacity: 0, scale: 0, rotate: 720 }}
          transition={{ duration: 1.5, delay: p.delay, ease: 'easeOut' }}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}

function StarRating({ score, total }: { score: number; total: number }) {
  const pct = score / (total * 10);
  const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + i * 0.2, type: 'spring', stiffness: 300 }}
        >
          <Star
            className={`w-10 h-10 ${i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          />
        </motion.div>
      ))}
    </div>
  );
}

export function GamePlayPage() {
  const navigate = useNavigate();
  const { mode } = useParams({ from: '/game/$mode' });
  const { state, loading, startGame, submitAnswer, nextQuestion, resetGame } = useGameEngine();

  const config = MODE_CONFIG[mode as GameMode] || MODE_CONFIG['tebak-surah'];

  useEffect(() => {
    if (mode) {
      startGame(mode as GameMode);
    }
  }, [mode, startGame]);

  // Audio management
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const playAudio = useCallback((url?: string) => {
    if (!url) return;
    stopAudio();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onpause = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  }, [stopAudio]);

  // Auto-play audio when new question appears
  useEffect(() => {
    if (state.status === 'playing' && state.questions.length > 0) {
      const q = state.questions[state.currentIndex];
      if (q.audioUrl) {
        // Small delay so the slide animation finishes first
        const timer = setTimeout(() => playAudio(q.audioUrl), 400);
        return () => clearTimeout(timer);
      }
    }
  }, [state.currentIndex, state.status, state.questions, playAudio]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  // Save high score when game finishes
  useEffect(() => {
    if (state.status === 'finished') {
      const key = `game-highscore-${state.mode}`;
      const prev = Number(localStorage.getItem(key)) || 0;
      if (state.score > prev) {
        localStorage.setItem(key, String(state.score));
      }
    }
  }, [state.status, state.score, state.mode]);

  if (loading || state.questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5">
        <motion.div
          className="text-6xl"
          animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {config.emoji}
        </motion.div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Menyiapkan soal...</p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-primary-500"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Result Screen
  if (state.status === 'finished') {
    const correctCount = state.answers.filter(a => a === true).length;
    const totalQ = state.questions.length;
    const pct = Math.round((correctCount / totalQ) * 100);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <ConfettiBurst />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '👏' : '💪'}</div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {pct >= 80 ? 'Luar Biasa!' : pct >= 50 ? 'Bagus Sekali!' : 'Terus Belajar!'}
          </h2>

          <StarRating score={state.score} total={totalQ} />

          <div className="mt-6 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xl">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{state.score}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Skor</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{correctCount}/{totalQ}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Benar</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{state.bestStreak}🔥</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Streak</p>
              </div>
            </div>

            {/* Answer summary */}
            <div className="flex items-center justify-center gap-1 mb-4">
              {state.answers.map((a, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    a ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                  }`}
                >
                  {a ? '✓' : '✗'}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { resetGame(); navigate({ to: '/game' }); }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm"
            >
              <Home className="w-4 h-4" />
              Menu
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => startGame(state.mode)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r ${config.color} text-white font-semibold text-sm shadow-lg`}
            >
              <RotateCcw className="w-4 h-4" />
              Main Lagi
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Playing Screen
  const question = state.questions[state.currentIndex];
  const progress = ((state.currentIndex + 1) / state.questions.length) * 100;
  const isAnswered = state.status === 'answered';
  const isCorrect = isAnswered && state.selectedAnswer === question.correctIndex;

  return (
    <div className="min-h-screen flex flex-col pb-safe">
      {isAnswered && isCorrect && <ConfettiBurst />}

      {/* Top bar */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => { resetGame(); navigate({ to: '/game' }); }}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-2">
            {state.streak >= 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/50 rounded-full px-2.5 py-1"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{state.streak}x</span>
              </motion.div>
            )}
            <div className="bg-primary-50 dark:bg-primary-950/50 rounded-full px-3 py-1.5">
              <span className="text-sm font-bold text-primary-700 dark:text-primary-300">{state.score}</span>
              <span className="text-[10px] text-primary-400 ml-1">pts</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-gray-400">{state.currentIndex + 1}/{state.questions.length}</span>
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${config.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col px-5 mt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {/* Question card */}
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${config.color} p-6 mb-5`}>
              <div className="absolute top-2 right-3 text-4xl opacity-15">{config.emoji}</div>

              {question.questionSubText && (
                <p className="text-white/70 text-xs font-medium mb-2">{question.questionSubText}</p>
              )}
              <p className="arabic-text text-2xl text-white leading-relaxed text-right" dir="rtl">
                {question.questionText}
              </p>

              {/* Audio play button */}
              {question.audioUrl && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPlaying) stopAudio();
                    else playAudio(question.audioUrl);
                  }}
                  className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isPlaying
                      ? 'bg-white/30 ring-2 ring-white/50'
                      : 'bg-white/15 hover:bg-white/25'
                  }`}
                >
                  {isPlaying ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                  <span className="text-white text-xs font-semibold">
                    {isPlaying ? 'Berhenti' : 'Dengarkan Ayat 🔊'}
                  </span>
                  {isPlaying && (
                    <span className="flex gap-0.5 ml-1">
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="w-1 bg-white rounded-full"
                          animate={{ height: [4, 12, 4] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                        />
                      ))}
                    </span>
                  )}
                </motion.button>
              )}
            </div>

            {/* Answer choices */}
            <div className="space-y-3 mb-4">
              {question.choices.map((choice, idx) => {
                const isSelected = state.selectedAnswer === idx;
                const isCorrectChoice = idx === question.correctIndex;

                let bgClass = 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800';
                let textClass = 'text-gray-800 dark:text-gray-200';

                if (isAnswered) {
                  if (isCorrectChoice) {
                    bgClass = 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700 ring-2 ring-green-200 dark:ring-green-800';
                    textClass = 'text-green-800 dark:text-green-300';
                  } else if (isSelected && !isCorrectChoice) {
                    bgClass = 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 ring-2 ring-red-200 dark:ring-red-800';
                    textClass = 'text-red-800 dark:text-red-300';
                  } else {
                    bgClass = 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-50';
                  }
                }

                return (
                  <motion.button
                    key={idx}
                    whileTap={!isAnswered ? { scale: 0.97 } : undefined}
                    onClick={() => !isAnswered && submitAnswer(idx)}
                    disabled={isAnswered}
                    className={`w-full text-left rounded-2xl border p-4 transition-all flex items-center gap-3 ${bgClass}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                      isAnswered && isCorrectChoice
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-600'
                        : isAnswered && isSelected && !isCorrectChoice
                          ? 'bg-red-100 dark:bg-red-900/50 text-red-600'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                      {isAnswered && isCorrectChoice ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isAnswered && isSelected && !isCorrectChoice ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </div>
                    <span className={`text-sm font-medium leading-snug ${textClass} ${question.choices[0]?.includes('\u0627') ? 'arabic-text text-base text-right flex-1' : ''}`} dir={question.choices[0]?.includes('\u0627') ? 'rtl' : 'ltr'}>
                      {choice}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback + Next */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-auto mb-6"
              >
                <div className={`rounded-2xl p-4 mb-3 text-center ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
                }`}>
                  <p className="text-2xl mb-1">{isCorrect ? '🎉' : '😢'}</p>
                  <p className={`font-bold ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {isCorrect ? 'Benar! Masya Allah!' : 'Salah, coba lagi nanti!'}
                  </p>
                  {!isCorrect && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Jawaban: <span className="font-semibold">{question.choices[question.correctIndex]}</span>
                    </p>
                  )}
                  {isCorrect && state.streak >= 3 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                      🔥 Streak {state.streak}x — +5 bonus!
                    </p>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={nextQuestion}
                  className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${config.color} text-white font-semibold text-sm shadow-lg`}
                >
                  {state.currentIndex + 1 >= state.questions.length ? 'Lihat Hasil 🏆' : 'Soal Berikutnya →'}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
