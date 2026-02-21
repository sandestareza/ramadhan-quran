import { motion } from 'framer-motion';
import { Moon, Sun, Eye, Music, Info, ExternalLink, Bell, BellOff, TypeOutline } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { usePrayerNotification } from '@/hooks/usePrayerNotification';
import { cn } from '@/lib/utils';
import type { DisplayMode, QariKey, ArabicFont } from '@/types';
import { DISPLAY_MODE_LABELS, QARI_NAMES, ARABIC_FONT_LABELS } from '@/types';

export function SettingsPage() {
  const { settings, toggleDarkMode, setDisplayMode, setSelectedQari, setArabicFont } = useSettings();
  const notif = usePrayerNotification();
  
  const displayModes: DisplayMode[] = ['arabic', 'arabic-latin', 'arabic-translation', 'full'];
  const qariKeys: QariKey[] = ['01', '02', '03', '04', '05', '06'];
  const minuteOptions = [0, 5, 10, 15, 30];

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

        {/* Prayer Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                notif.enabled
                  ? 'bg-green-50 dark:bg-green-950/30'
                  : 'bg-gray-100 dark:bg-gray-800'
              )}>
                {notif.enabled ? (
                  <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Pengingat Sholat</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {notif.enabled ? 'Aktif — notifikasi sebelum adzan' : 'Nonaktif'}
                </p>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={notif.toggleNotifications}
              className={cn(
                'relative w-14 h-8 rounded-full transition-colors',
                notif.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
              )}
            >
              <motion.div
                animate={{ x: notif.enabled ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
              />
            </motion.button>
          </div>

          {notif.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Ingatkan sebelum waktu sholat:</p>
              <div className="flex items-center gap-2">
                {minuteOptions.map(min => (
                  <button
                    key={min}
                    onClick={() => notif.setMinutesBefore(min)}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-xs font-medium transition-colors',
                      notif.minutesBefore === min
                        ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {min === 0 ? 'Tepat' : `${min} mnt`}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {notif.permissionState === 'denied' && (
            <p className="mt-3 text-xs text-red-500 dark:text-red-400">
              ⚠️ Izin notifikasi ditolak. Aktifkan di pengaturan browser.
            </p>
          )}
        </motion.div>

        {/* Font Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center">
              <TypeOutline className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Font Arab</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pilih jenis tulisan ayat</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {(Object.keys(ARABIC_FONT_LABELS) as ArabicFont[]).map(font => (
              <button
                key={font}
                onClick={() => setArabicFont(font)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl text-sm transition-colors',
                  settings.arabicFont === font
                    ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {ARABIC_FONT_LABELS[font]}
              </button>
            ))}
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
