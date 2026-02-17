import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useReadingStats } from "@/hooks/useReadingStats";

export function ReadingActivityCard() {
  const readingStats = useReadingStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="px-5 mt-8"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                Aktivitas Membaca
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                Jumlah ayat yang kamu baca per hari
              </p>
            </div>
          </div>
          {readingStats.streak > 0 && (
            <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-950/30 px-2.5 py-1.5 rounded-xl">
              <span className="text-sm">🔥</span>
              <div className="text-right">
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 leading-none">
                  {readingStats.streak}
                </p>
                <p className="text-[9px] text-orange-500 dark:text-orange-400 leading-none mt-0.5">
                  hari berturut
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bar chart */}
        {(() => {
          const maxVal = Math.max(
            ...readingStats.weeklyData.map((d) => d.ayatCount),
            1,
          );

          return (
            <div className="flex items-end gap-1.5 h-36 mb-1">
              {readingStats.weeklyData.map((day, i) => {
                const pct = (day.ayatCount / maxVal) * 100;
                const dayDate = new Date(day.date + "T00:00:00");
                const dayLabel = dayDate.toLocaleDateString("id-ID", {
                  weekday: "short",
                });
                const dateLabel = dayDate.getDate().toString();
                const isToday =
                  day.date === new Date().toISOString().split("T")[0];

                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-0.5"
                  >
                    {/* Ayat count label */}
                    <span
                      className={`text-[10px] font-semibold min-h-[14px] ${
                        day.ayatCount > 0
                          ? "text-gray-600 dark:text-gray-300"
                          : "text-transparent"
                      }`}
                    >
                      {day.ayatCount > 0 ? day.ayatCount : "0"}
                    </span>

                    {/* Bar */}
                    <div className="w-full flex-1 flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{
                          height: `${Math.max(pct, day.ayatCount > 0 ? 10 : 4)}%`,
                        }}
                        transition={{ duration: 0.6, delay: i * 0.07 }}
                        className={`w-full rounded-lg ${
                          isToday
                            ? "bg-primary-500 dark:bg-primary-400 shadow-sm shadow-primary-500/30"
                            : day.ayatCount > 0
                              ? "bg-primary-200 dark:bg-primary-700"
                              : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      />
                    </div>

                    {/* Day info */}
                    <div className="flex flex-col items-center mt-1">
                      <span
                        className={`text-[10px] leading-none ${
                          isToday
                            ? "font-bold text-primary-600 dark:text-primary-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {isToday ? "Hari ini" : dayLabel}
                      </span>
                      <span
                        className={`text-[9px] leading-none mt-0.5 ${
                          isToday
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      >
                        {dateLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Y-axis label */}
        <p className="text-[9px] text-gray-300 dark:text-gray-600 text-center mb-4">
          ayat yang dibaca
        </p>

        {/* Stats summary cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
              {readingStats.todayCount}
            </p>
            <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium mt-0.5">
              📖 Hari ini
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-700 dark:text-green-400">
              {readingStats.weeklyTotal}
            </p>
            <p className="text-[10px] text-green-500 dark:text-green-400 font-medium mt-0.5">
              📊 7 hari ini
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
              ~{readingStats.weeklyAvg}
            </p>
            <p className="text-[10px] text-purple-500 dark:text-purple-400 font-medium mt-0.5">
              📈 Per hari
            </p>
          </div>
        </div>

        {/* Explanation text */}
        <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center mt-3 leading-relaxed">
          Statistik dihitung dari jumlah ayat setiap surah yang kamu buka
        </p>
      </div>
    </motion.div>
  );
}
