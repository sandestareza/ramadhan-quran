import { motion } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import { Trash2, BookOpen, BookmarkX } from 'lucide-react';
import { useBookmark } from '@/hooks/useBookmark';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export function BookmarkPage() {
  const navigate = useNavigate();
  const { bookmarks, removeBookmark } = useBookmark();

  const sortedBookmarks = [...bookmarks].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="pb-safe">
      <div className="px-5 pt-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1"
        >
          Bookmark
        </motion.h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {bookmarks.length} ayat disimpan
        </p>
      </div>

      <div className="px-5">
        {sortedBookmarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <BookmarkX className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Belum ada bookmark</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Tandai ayat favorit saat membaca Al-Qur'an
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {sortedBookmarks.map((bm) => (
              <motion.div
                key={bm.id}
                variants={item}
                layout
                className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                <button
                  onClick={() => navigate({ to: '/surah/$surahId', params: { surahId: String(bm.surahNomor) }, search: { ayat: bm.ayatNomor } })}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {bm.surahNamaLatin}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ayat {bm.ayatNomor}</p>
                    </div>
                  </div>

                  <p className="arabic-text text-lg text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
                    {bm.teksArab}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {bm.teksIndonesia}
                  </p>
                </button>

                <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2 flex justify-end">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeBookmark(bm.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
