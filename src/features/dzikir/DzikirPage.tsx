import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronDown, ChevronUp, Vibrate } from 'lucide-react';
import { useDzikir, DZIKIR_PRESETS } from '@/hooks/useDzikir';
import { cn } from '@/lib/utils';

export function DzikirPage() {
  const {
    activePreset, currentCount, target, todayTotal,
    selectPreset, increment, resetCounter, logs,
  } = useDzikir();

  const [showPresets, setShowPresets] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [ripple, setRipple] = useState(false);

  const progress = Math.min((currentCount / target) * 100, 100);
  const isComplete = currentCount >= target;

  const handleTap = () => {
    increment();
    // Ripple effect
    setRipple(true);
    setTimeout(() => setRipple(false), 300);
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(15);
  };

  // Last 7 days history
  const recentLogs = logs.slice(-7).reverse();

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-stone-50/80 dark:bg-gray-950/80 backdrop-blur-xl px-5 pt-6 pb-3">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tasbih Digital</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            Hari ini: {todayTotal} dzikir
          </p>
        </motion.div>
      </div>

      <div className="px-5">
        {/* Active dzikir info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-4 mb-2"
        >
          <p className="text-3xl font-amiri text-gray-900 dark:text-gray-100 leading-relaxed mb-1">
            {activePreset.arabic}
          </p>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {activePreset.name}
          </p>
        </motion.div>

        {/* Big counter circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center mt-4"
        >
          <div className="relative">
            {/* SVG circular progress */}
            <svg width="240" height="240" viewBox="0 0 240 240" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="120" cy="120" r="105"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-100 dark:text-gray-800"
              />
              {/* Progress arc */}
              <motion.circle
                cx="120" cy="120" r="105"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 105}
                animate={{ strokeDashoffset: 2 * Math.PI * 105 * (1 - progress / 100) }}
                transition={{ duration: 0.3 }}
                className={isComplete ? 'text-green-500' : 'text-teal-500 dark:text-teal-400'}
              />
            </svg>

            {/* Tappable center */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleTap}
              className={cn(
                'absolute inset-4 rounded-full flex flex-col items-center justify-center transition-colors select-none',
                isComplete
                  ? 'bg-green-50 dark:bg-green-950/30'
                  : 'bg-teal-50 dark:bg-teal-950/20 active:bg-teal-100 dark:active:bg-teal-950/40'
              )}
            >
              {/* Ripple */}
              <AnimatePresence>
                {ripple && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.4 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute w-20 h-20 rounded-full bg-teal-300 dark:bg-teal-600"
                  />
                )}
              </AnimatePresence>

              <motion.span
                key={currentCount}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  'text-5xl font-bold relative z-10',
                  isComplete ? 'text-green-600 dark:text-green-400' : 'text-teal-700 dark:text-teal-300'
                )}
              >
                {currentCount}
              </motion.span>
              <span className="text-sm text-gray-400 dark:text-gray-500 mt-1 relative z-10">
                / {target}
              </span>
              {isComplete && (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1 relative z-10"
                >
                  Alhamdulillah ✓
                </motion.span>
              )}
            </motion.button>
          </div>

          {/* Tap hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1"
          >
            <Vibrate className="w-3 h-3" />
            Ketuk lingkaran untuk menghitung
          </motion.p>
        </motion.div>

        {/* Reset button */}
        <div className="flex justify-center mt-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={resetCounter}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset & Simpan
          </motion.button>
        </div>

        {/* Preset selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="w-full flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-left"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Pilih Dzikir</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Aktif: {activePreset.name} (target {target}×)
              </p>
            </div>
            {showPresets ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {showPresets && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1.5">
                  {DZIKIR_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        selectPreset(preset.id);
                        setShowPresets(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors',
                        activePreset.id === preset.id
                          ? 'bg-teal-50 dark:bg-teal-950/30 ring-1 ring-teal-200 dark:ring-teal-800'
                          : 'bg-white dark:bg-gray-900 border border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{preset.name}</p>
                        <p className="text-xs text-gray-400 font-amiri mt-0.5">{preset.arabic}</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{preset.target}×</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Daily History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 mb-8"
        >
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-left"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Riwayat Harian</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {recentLogs.length > 0 ? `${recentLogs.length} hari terakhir` : 'Belum ada riwayat'}
              </p>
            </div>
            {showHistory ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {recentLogs.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-6">
                    Belum ada riwayat dzikir
                  </p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {recentLogs.map(log => {
                      const total = Object.values(log.counts).reduce((s, c) => s + c, 0);
                      const dateObj = new Date(log.date + 'T00:00:00');
                      const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
                      const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

                      return (
                        <div
                          key={log.date}
                          className="bg-white dark:bg-gray-900 border border-gray-50 dark:border-gray-800 rounded-xl p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {dayName}, {dateStr}
                            </p>
                            <span className="text-xs bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-full font-medium">
                              {total}×
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(log.counts).map(([presetId, count]) => {
                              const preset = DZIKIR_PRESETS.find(p => p.id === presetId);
                              return (
                                <span
                                  key={presetId}
                                  className="text-[10px] bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg"
                                >
                                  {preset?.name || presetId}: {count}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
