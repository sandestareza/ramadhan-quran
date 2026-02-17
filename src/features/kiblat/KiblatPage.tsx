import { motion, AnimatePresence } from 'framer-motion';
import { Compass, MapPin, Navigation, AlertCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useQiblaCompass } from '@/hooks/useQiblaCompass';

// Kaaba SVG icon
function KaabaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L19 8.5v7L12 19.82 5 15.5v-7L12 4.18z" />
      <rect x="9" y="9" width="6" height="6" rx="0.5" />
    </svg>
  );
}

export function KiblatPage() {
  const navigate = useNavigate();
  const {
    latitude,
    longitude,
    qiblaBearing,
    compassHeading,
    qiblaDirection,
    error,
    locationLoading,
    compassSupported,
    needsPermission,
    requestPermission,
  } = useQiblaCompass();

  // Loading state
  if (locationLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        >
          <Compass className="w-16 h-16 text-primary-500" />
        </motion.div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Mendeteksi lokasi...</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
          Pastikan GPS aktif untuk menentukan arah kiblat
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-2xl bg-primary-600 text-white font-semibold text-sm"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // iOS permission needed
  if (needsPermission) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
          <Navigation className="w-12 h-12 text-emerald-500" />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Izinkan Akses Kompas
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-xs">
            Kami memerlukan akses sensor kompas agar bisa menunjukkan arah kiblat secara otomatis saat kamu memutar HP.
          </p>
        </div>
        <button
          onClick={requestPermission}
          className="px-8 py-3.5 rounded-2xl bg-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30"
        >
          Izinkan Kompas
        </button>
      </div>
    );
  }

  const compassRotation = compassHeading !== null ? -compassHeading : 0;
  const qiblaRotation = qiblaDirection !== null ? qiblaDirection : 0;
  const hasCompass = compassSupported && compassHeading !== null;

  // Check if device is pointing towards Qibla (within ±10°)
  const isAligned = hasCompass && Math.abs(qiblaRotation) < 10 || (qiblaRotation > 350);
  const isNearlyAligned = hasCompass && (Math.abs(qiblaRotation) < 20 || qiblaRotation > 340);

  return (
    <div className="pb-safe min-h-screen bg-stone-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-stone-50/80 dark:bg-gray-950/80 backdrop-blur-xl px-5 pt-6 pb-3">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/' })}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Arah Kiblat</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {latitude?.toFixed(4)}°, {longitude?.toFixed(4)}°
            </p>
          </div>
        </motion.div>
      </div>

      {/* Instruction banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 mt-4"
      >
        <AnimatePresence mode="wait">
          {hasCompass ? (
            isAligned ? (
              <motion.div
                key="aligned"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-500 dark:bg-emerald-600 rounded-2xl p-4 text-center shadow-lg shadow-emerald-500/20"
              >
                <p className="text-white text-lg font-bold">✅ Arah Kiblat Ditemukan!</p>
                <p className="text-emerald-100 text-sm mt-1">
                  HP kamu sudah menghadap ke arah Ka'bah
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="searching"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      Putar HP kamu perlahan
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      Putar HP seperti memutar peta. Saat arah sudah tepat, ikon Ka'bah
                      (🟢) akan berada di <strong>atas</strong> dan background berubah hijau.
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          ) : (
            <motion.div
              key="no-compass"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/50"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                    Kompas Tidak Tersedia
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 leading-relaxed">
                    Perangkat ini tidak mendukung sensor kompas.
                    Gunakan angka <strong>{qiblaBearing?.toFixed(0)}°</strong> dari arah Utara sebagai panduan, atau buka di HP lain yang punya kompas.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Compass */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex flex-col items-center mt-8 px-5"
      >
        {/* "Kamu" indicator at top center */}
        <div className="flex flex-col items-center mb-3">
          <div className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
            isAligned
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            ↑ Depan HP kamu
          </div>
        </div>

        {/* Compass dial */}
        <div className={`relative w-72 h-72 rounded-full transition-shadow duration-500 ${
          isAligned
            ? 'shadow-[0_0_40px_rgba(16,185,129,0.3)]'
            : isNearlyAligned
              ? 'shadow-[0_0_20px_rgba(16,185,129,0.15)]'
              : ''
        }`}>
          {/* Outer ring */}
          <div className={`absolute inset-0 rounded-full transition-colors duration-500 ${
            isAligned
              ? 'bg-gradient-to-b from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-950'
              : 'bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'
          } shadow-xl`} />
          <div className={`absolute inset-2 rounded-full shadow-inner transition-colors duration-500 ${
            isAligned
              ? 'bg-emerald-50 dark:bg-emerald-950'
              : 'bg-white dark:bg-gray-950'
          }`} />

          {/* Compass rose - rotates with device */}
          <motion.div
            className="absolute inset-4 rounded-full"
            animate={{ rotate: compassRotation }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          >
            {/* Cardinal directions */}
            {[
              { label: 'U', full: 'Utara', deg: 0, isNorth: true },
              { label: 'T', full: 'Timur', deg: 90, isNorth: false },
              { label: 'S', full: 'Selatan', deg: 180, isNorth: false },
              { label: 'B', full: 'Barat', deg: 270, isNorth: false },
            ].map(({ label, deg, isNorth }) => (
              <div
                key={label}
                className="absolute inset-0 flex justify-center"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <span
                  className={`text-sm font-bold ${
                    isNorth ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
                  }`}
                  style={{ transform: `rotate(${-deg}deg)`, marginTop: 4 }}
                >
                  {label}
                </span>
              </div>
            ))}

            {/* Degree ticks */}
            {Array.from({ length: 72 }).map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 flex justify-center"
                style={{ transform: `rotate(${i * 5}deg)` }}
              >
                <div
                  className={`${
                    i % 18 === 0
                      ? 'w-0.5 h-4 bg-gray-800 dark:bg-gray-200'
                      : i % 6 === 0
                        ? 'w-0.5 h-3 bg-gray-400 dark:bg-gray-500'
                        : 'w-px h-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              </div>
            ))}

            {/* North indicator triangle */}
            <div className="absolute inset-0 flex justify-center" style={{ transform: 'rotate(0deg)' }}>
              <div className="w-0 h-0 -mt-1"
                style={{
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '10px solid #ef4444',
                }}
              />
            </div>
          </motion.div>

          {/* Qibla needle - always points to Qibla */}
          <motion.div
            className="absolute inset-6 flex justify-center"
            animate={{ rotate: hasCompass ? qiblaRotation : (qiblaBearing || 0) }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          >
            {/* Needle line */}
            <div className="relative w-full h-full flex justify-center">
              <div className={`w-1 rounded-full transition-colors duration-500 ${
                isAligned
                  ? 'bg-gradient-to-b from-emerald-400 to-emerald-600'
                  : 'bg-gradient-to-b from-emerald-500 to-emerald-600'
              }`} style={{ height: '45%' }} />
            </div>
            {/* Kaaba icon at needle tip */}
            <motion.div
              className={`absolute top-2 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-colors duration-500 ${
                isAligned
                  ? 'bg-emerald-400 shadow-emerald-400/40'
                  : 'bg-emerald-500'
              }`}
              animate={isAligned ? { scale: [1, 1.1, 1] } : {}}
              transition={isAligned ? { repeat: Infinity, duration: 1.5 } : {}}
            >
              <KaabaIcon className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-5 h-5 rounded-full shadow-md z-10 transition-colors duration-500 ${
              isAligned
                ? 'bg-gradient-to-b from-emerald-400 to-emerald-600'
                : 'bg-gradient-to-b from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-700'
            }`} />
          </div>
        </div>

        {/* Bearing info below compass */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <KaabaIcon className="w-5 h-5 text-emerald-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {qiblaBearing?.toFixed(0)}°
            </p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Arah kiblat dari lokasi kamu
          </p>
          {hasCompass && (
            <p className={`text-xs mt-1 font-medium ${
              isAligned
                ? 'text-emerald-500'
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              HP menghadap: {compassHeading?.toFixed(0)}°
              {isAligned && ' — Tepat! ✓'}
            </p>
          )}
        </div>
      </motion.div>

      {/* How to use guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-5 mt-8 mb-8"
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-3">
            📋 Cara Menggunakan
          </p>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Pegang HP kamu secara datar (horizontal), seperti memegang peta' },
              { step: '2', text: 'Putar badan kamu perlahan searah jarum jam' },
              { step: '3', text: 'Perhatikan ikon Ka\'bah hijau (🟢) pada kompas' },
              { step: '4', text: 'Saat ikon Ka\'bah tepat di atas dan kompas berubah hijau, itulah arah kiblat!' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{step}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-800/30 mt-3">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">💡 Tips akurasi:</p>
          <ul className="text-xs text-amber-600 dark:text-amber-400/80 mt-1.5 space-y-1 list-disc pl-4">
            <li>Gunakan di tempat terbuka, jauh dari benda logam</li>
            <li>Kalibrasi kompas: gerakkan HP membentuk angka 8</li>
            <li>Pastikan tidak ada magnet atau casing magnetik</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
