import { motion } from 'framer-motion';
import { Moon, Sun, Eye, Music, Info, ExternalLink } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';
import type { DisplayMode, QariKey } from '@/types';
import { DISPLAY_MODE_LABELS, QARI_NAMES } from '@/types';

export function SettingsPage() {
  const { settings, toggleDarkMode, setDisplayMode, setSelectedQari } = useSettings();
  
  const displayModes: DisplayMode[] = ['arabic', 'arabic-latin', 'arabic-translation', 'full'];
  const qariKeys: QariKey[] = ['01', '02', '03', '04', '05', '06'];

  return (
    <div className="pb-safe">
      <div className="px-5 pt-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1"
        >
          Pengaturan
        </motion.h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Sesuaikan pengalaman membaca</p>
      </div>

      <div className="px-5 space-y-6">
        {/* Dark Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.darkMode ? (
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-indigo-500" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                  <Sun className="w-5 h-5 text-amber-500" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Mode Gelap</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {settings.darkMode ? 'Aktif' : 'Nonaktif'}
                </p>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={cn(
                'relative w-14 h-8 rounded-full transition-colors',
                settings.darkMode ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'
              )}
            >
              <motion.div
                animate={{ x: settings.darkMode ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Display Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Mode Tampilan</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pilih tampilan ayat</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {displayModes.map(mode => (
              <button
                key={mode}
                onClick={() => setDisplayMode(mode)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl text-sm transition-colors',
                  settings.displayMode === mode
                    ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {DISPLAY_MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Qari Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <Music className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Qari</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pilih qari favorit</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {qariKeys.map(key => (
              <button
                key={key}
                onClick={() => setSelectedQari(key)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl text-sm transition-colors',
                  settings.selectedQari === key
                    ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {QARI_NAMES[key]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Info className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Ramadhan Quran</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">v1.0.0</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
            Aplikasi Al-Qur'an digital modern. Data disediakan oleh{' '}
            <a href="https://equran.id" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 inline-flex items-center gap-0.5">
              equran.id <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
