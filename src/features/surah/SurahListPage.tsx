import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import { Search, X } from 'lucide-react';
import { useSurahList } from '@/hooks/useQuran';
import { SurahListSkeleton } from '@/components/Skeleton';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.02 },
  },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export function SurahListPage() {
  const navigate = useNavigate();
  const { data: surahs, isLoading, error } = useSurahList();
  const [search, setSearch] = useState('');

  const filtered = surahs?.filter(s =>
    (s.namaLatin || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.arti || '').toLowerCase().includes(search.toLowerCase()) ||
    String(s.nomor).includes(search)
  ) || [];

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-stone-50/80 dark:bg-gray-950/80 backdrop-blur-xl px-5 pt-6 pb-3">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4"
        >
          Surah
        </motion.h1>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari surah..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 dark:focus:border-primary-700 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </motion.div>
      </div>

      {/* List */}
      <div className="px-5 mt-2">
        {isLoading ? (
          <SurahListSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Gagal memuat data surah</p>
          </div>
        ) : (
          <motion.div
            key={search}
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {filtered.map((surah) => (
              <motion.button
                key={surah.nomor}
                variants={item}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate({ to: '/surah/$surahId', params: { surahId: String(surah.nomor) }, search: { ayat: undefined } })}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-gray-700 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-400 shrink-0">
                  {surah.nomor}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{surah.namaLatin}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {surah.tempatTurun} • {surah.jumlahAyat} Ayat • {surah.arti}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="arabic-text text-lg text-primary-800 dark:text-primary-300">{surah.nama}</p>
                </div>
              </motion.button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Surah tidak ditemukan</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
