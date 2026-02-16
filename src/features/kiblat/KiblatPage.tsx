import { motion } from 'framer-motion';
import { Compass, MapPin, Navigation, AlertCircle, Loader2 } from 'lucide-react';
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
          <Navigation className="w-10 h-10 text-primary-500" />
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 text-center">
          Izinkan akses kompas
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
          Diperlukan untuk menentukan arah kiblat secara real-time
        </p>
        <button
          onClick={requestPermission}
          className="px-6 py-3 rounded-2xl bg-primary-600 text-white font-semibold text-sm"
        >
          Izinkan Kompas
        </button>
      </div>
    );
  }

  const compassRotation = compassHeading !== null ? -compassHeading : 0;
  const qiblaRotation = qiblaDirection !== null ? qiblaDirection : 0;
  const hasCompass = compassSupported && compassHeading !== null;

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-stone-50/80 dark:bg-gray-950/80 backdrop-blur-xl px-5 pt-6 pb-3">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kompas Kiblat</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            {latitude?.toFixed(4)}°, {longitude?.toFixed(4)}°
          </p>
        </motion.div>
      </div>

      <div className="px-5 mt-6">
        {/* Qibla bearing info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 dark:from-emerald-700 dark:via-teal-800 dark:to-emerald-900 rounded-2xl p-5 mb-6 relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 w-20 h-20 border border-white/10 rounded-full" />
          <div className="absolute bottom-2 right-8 w-12 h-12 border border-white/10 rounded-full" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <KaabaIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs">Arah Kiblat dari Lokasi Anda</p>
              <p className="text-3xl font-bold text-white">
                {qiblaBearing?.toFixed(1)}°
              </p>
              <p className="text-white/70 text-xs mt-0.5">
                dari arah Utara (searah jarum jam)
              </p>
            </div>
          </div>
        </motion.div>

        {/* Compass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex flex-col items-center"
        >
          {/* Compass dial */}
          <div className="relative w-72 h-72">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-xl" />
            <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-950 shadow-inner" />

            {/* Compass rose - rotates with device */}
            <motion.div
              className="absolute inset-4 rounded-full"
              animate={{ rotate: compassRotation }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            >
              {/* Cardinal directions */}
              {[
                { label: 'U', deg: 0, color: 'text-red-500 font-bold' },
                { label: 'T', deg: 90, color: 'text-gray-500 dark:text-gray-400' },
                { label: 'S', deg: 180, color: 'text-gray-500 dark:text-gray-400' },
                { label: 'B', deg: 270, color: 'text-gray-500 dark:text-gray-400' },
              ].map(({ label, deg, color }) => (
                <div
                  key={label}
                  className="absolute inset-0 flex justify-center"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <span className={`text-sm ${color}`} style={{ transform: `rotate(${-deg}deg)`, marginTop: 4 }}>
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
                <div className="w-1 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full" style={{ height: '45%' }} />
              </div>
              {/* Kaaba icon at needle tip */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-emerald-500 shadow-lg flex items-center justify-center">
                <KaabaIcon className="w-5 h-5 text-white" />
              </div>
            </motion.div>

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-700 shadow-md z-10" />
            </div>
          </div>

          {/* Status text */}
          <div className="mt-6 text-center">
            {hasCompass ? (
              <>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Arahkan HP ke <span className="text-emerald-600 dark:text-emerald-400">{qiblaBearing?.toFixed(0)}°</span>
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Heading: {compassHeading?.toFixed(0)}° — Putar HP hingga jarum hijau di atas
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">Kompas tidak tersedia</p>
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Perangkat ini tidak mendukung kompas digital.
                  <br />
                  Arah kiblat dari lokasi Anda: <span className="font-bold text-emerald-600">{qiblaBearing?.toFixed(1)}°</span> dari Utara.
                </p>
              </>
            )}
          </div>
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 mb-8 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/50"
        >
          <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">🕋 Tentang Arah Kiblat</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 leading-relaxed">
            Arah kiblat dihitung berdasarkan koordinat GPS Anda menuju Ka'bah di Makkah Al-Mukarramah
            (21.4225°N, 39.8262°E) menggunakan formula great circle. Untuk hasil terbaik, gunakan di tempat terbuka
            dan jauhkan dari benda logam.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
