import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { History, ChevronRight, BookOpen } from "lucide-react";
import { useLastReadJuz } from "@/hooks/useLastReadJuz";

export function RecentHistoryCard() {
  const navigate = useNavigate();
  const { lastRead } = useLastReadJuz();

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
          Lanjut Baca Qur'an
        </h2>
      </div>

      {/* Last read card */}
      <button
        onClick={() =>
          navigate({
            to: `/juz/${lastRead.juz}`,
            // We rely on the prompt in JuzReadingPage to handle the specific ayat jump
          })
        }
        className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-left group hover:border-primary-200 dark:hover:border-primary-800 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
              <span className="text-primary-700 dark:text-primary-400 font-bold text-sm">
                {lastRead.juz}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                Juz {lastRead.juz}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {lastRead.surahName ? `${lastRead.surahName} : Ayat ${lastRead.ayatNumber}` : `Halaman ${lastRead.page}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
              Lanjut
            </span>
            <ChevronRight className="w-4 h-4 text-primary-400" />
          </div>
        </div>
      </button>
    </motion.div>
  );
}
