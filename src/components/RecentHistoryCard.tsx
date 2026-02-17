import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { History, ChevronRight } from "lucide-react";
import { useReadingHistory } from "@/hooks/useReadingHistory";

export function RecentHistoryCard() {
  const navigate = useNavigate();
  const { history, lastRead } = useReadingHistory();

  if (!lastRead) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="px-5 mt-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Lanjutkan Bacaan
        </h2>
      </div>

      {/* Last read card */}
      <button
        onClick={() =>
          navigate({
            to: `/surah/${lastRead.surahNomor}`,
            search: { ayat: lastRead.lastAyat },
          })
        }
        className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-left group hover:border-primary-200 dark:hover:border-primary-800 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
              <span className="text-primary-700 dark:text-primary-400 font-bold text-sm">
                {lastRead.surahNomor}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {lastRead.surahName}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Ayat {lastRead.lastAyat} dari {lastRead.totalAyat}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
              Lanjutkan
            </span>
            <ChevronRight className="w-4 h-4 text-primary-400" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.round((lastRead.lastAyat / lastRead.totalAyat) * 100)}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-primary-500 dark:bg-primary-400 rounded-full"
          />
        </div>
      </button>

      {/* Recent history (up to 2 more) */}
      {history.length > 1 && (
        <div className="mt-2 space-y-1">
          {history.slice(1, 3).map((rec) => (
            <button
              key={rec.surahNomor}
              onClick={() =>
                navigate({
                  to: `/surah/${rec.surahNomor}`,
                  search: { ayat: rec.lastAyat },
                })
              }
              className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-xl px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                  {rec.surahNomor}
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {rec.surahName}
                </p>
              </div>
              <p className="text-xs text-gray-400">Ayat {rec.lastAyat}</p>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
