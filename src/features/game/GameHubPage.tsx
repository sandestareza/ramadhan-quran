import { motion } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import { Gamepad2, BookOpen, Languages, ArrowRight, Trophy, Star } from 'lucide-react';

const GAMES = [
  {
    mode: 'tebak-surah' as const,
    title: 'Tebak Surah',
    emoji: '🎯',
    description: 'Dari surah mana ayat ini?',
    color: 'from-amber-400 to-orange-500',
    darkColor: 'dark:from-amber-600 dark:to-orange-700',
    icon: BookOpen,
  },
  {
    mode: 'sambung-ayat' as const,
    title: 'Sambung Ayat',
    emoji: '📝',
    description: 'Pilih lanjutan ayat berikutnya!',
    color: 'from-pink-400 to-rose-500',
    darkColor: 'dark:from-pink-600 dark:to-rose-700',
    icon: ArrowRight,
  },
  {
    mode: 'tebak-arti' as const,
    title: 'Tebak Arti',
    emoji: '🌍',
    description: 'Apa arti ayat ini?',
    color: 'from-violet-400 to-purple-500',
    darkColor: 'dark:from-violet-600 dark:to-purple-700',
    icon: Languages,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export function GameHubPage() {
  const navigate = useNavigate();

  // Get high scores from localStorage
  const getHighScore = (mode: string): number => {
    try {
      return Number(localStorage.getItem(`game-highscore-${mode}`)) || 0;
    } catch { return 0; }
  };

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 dark:from-yellow-600 dark:via-orange-700 dark:to-pink-800 rounded-b-[2rem] px-6 pt-12 pb-10">
        {/* Floating decorations */}
        <div className="absolute top-6 right-6 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>⭐</div>
        <div className="absolute top-16 right-16 text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>🌙</div>
        <div className="absolute bottom-6 left-6 text-3xl animate-bounce" style={{ animationDelay: '0.6s' }}>📖</div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Game Belajar</h1>
              <p className="text-white/80 text-sm">Hafal Quran sambil bermain! 🎮</p>
            </div>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 flex items-center gap-3"
        >
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <Trophy className="w-5 h-5 text-yellow-200 mx-auto mb-1" />
            <p className="text-[10px] text-white/70">Skor Tertinggi</p>
            <p className="text-lg font-bold text-white">
              {Math.max(...GAMES.map(g => getHighScore(g.mode)), 0)}
            </p>
          </div>
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <Star className="w-5 h-5 text-yellow-200 mx-auto mb-1" />
            <p className="text-[10px] text-white/70">3 Mode Game</p>
            <p className="text-lg font-bold text-white">Juz 30</p>
          </div>
        </motion.div>
      </div>

      {/* Game Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-5 mt-6 space-y-4 mb-6"
      >
        {GAMES.map((game) => {
          const highScore = getHighScore(game.mode);
          const Icon = game.icon;
          return (
            <motion.button
              key={game.mode}
              variants={item}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate({ to: '/game/$mode', params: { mode: game.mode } })}
              className="w-full text-left"
            >
              <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${game.color} ${game.darkColor} p-5 shadow-lg`}>
                {/* Background emoji */}
                <div className="absolute top-2 right-3 text-5xl opacity-20">{game.emoji}</div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shrink-0">
                    {game.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{game.title}</h3>
                      <Icon className="w-4 h-4 text-white/60" />
                    </div>
                    <p className="text-white/80 text-sm mt-0.5">{game.description}</p>

                    {highScore > 0 && (
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                        <Trophy className="w-3 h-3 text-yellow-200" />
                        <span className="text-xs font-semibold text-white">{highScore} pts</span>
                      </div>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 self-center">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* Info card */}
        <motion.div
          variants={item}
          className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/50"
        >
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">💡 Tips untuk Anak</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Soal diambil dari surah-surah pendek di Juz 30 (An-Naba sampai An-Nas). Cocok untuk belajar hafalan! Setiap ronde berisi 10 pertanyaan.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
