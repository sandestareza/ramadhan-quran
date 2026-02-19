import { motion } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import { Layers } from 'lucide-react';
import { JUZ_MAPPING, getSurahNumbersInJuz } from '@/data/juz-mapping';
import { useSurahList } from '@/hooks/useQuran';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export function JuzListPage() {
  const navigate = useNavigate();
  const { data: surahs } = useSurahList();

  const getSurahName = (nomor: number) => {
    return surahs?.find(s => s.nomor === nomor)?.namaLatin || `Surah ${nomor}`;
  };

  return (
    <div className="pb-safe">
      <div className="px-5 pt-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1"
        >
          Juz
        </motion.h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">30 Juz Al-Qur'an</p>
      </div>

      <div className="px-5">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3"
        >
          {JUZ_MAPPING.map((juz) => {
            const surahNumbers = getSurahNumbersInJuz(juz);
            const startSurah = getSurahName(juz.start.surah);
            const endSurah = getSurahName(juz.end.surah);

            return (
              <motion.button
                key={juz.juz}
                variants={item}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate({ to: '/juz/$juzId', params: { juzId: String(juz.juz) } })}
                className="relative p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-gray-700 transition-all text-left overflow-hidden group"
              >
                {/* Decorative */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary-50 dark:bg-primary-950/30 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-700 dark:text-primary-400">{juz.juz}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Juz {juz.juz}</span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {startSurah} {juz.start.ayat} — {endSurah} {juz.end.ayat}
                  </p>
                  <p className="text-[10px] text-primary-600 dark:text-primary-400 mt-1">
                    {surahNumbers.length} Surah
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
