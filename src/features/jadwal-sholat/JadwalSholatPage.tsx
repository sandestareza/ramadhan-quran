import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronLeft, ChevronRight, Clock, Sun, Sunrise, Sunset, Moon, CloudSun, Filter } from 'lucide-react';
import { useProvinsiList, useKabKotaList, useJadwalSholat, useSholatLocation } from '@/hooks/useQuran';
import type { JadwalSholat } from '@/types';

const PRAYER_ICONS: Record<string, React.ReactNode> = {
  imsak: <Moon className="w-3.5 h-3.5" />,
  subuh: <Sunrise className="w-3.5 h-3.5" />,
  terbit: <Sun className="w-3.5 h-3.5" />,
  dhuha: <CloudSun className="w-3.5 h-3.5" />,
  dzuhur: <Sun className="w-3.5 h-3.5" />,
  ashar: <CloudSun className="w-3.5 h-3.5" />,
  maghrib: <Sunset className="w-3.5 h-3.5" />,
  isya: <Moon className="w-3.5 h-3.5" />,
};

const PRAYER_LABELS: Record<string, string> = {
  imsak: 'Imsak',
  subuh: 'Subuh',
  terbit: 'Terbit',
  dhuha: 'Dhuha',
  dzuhur: 'Dzuhur',
  ashar: 'Ashar',
  maghrib: 'Maghrib',
  isya: 'Isya',
};

const PRAYER_KEYS = ['imsak', 'subuh', 'terbit', 'dhuha', 'dzuhur', 'ashar', 'maghrib', 'isya'] as const;

function getToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function JadwalSholatPage() {
  const { location, setLocation } = useSholatLocation();
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [showFilter, setShowFilter] = useState(false);
  const [tempProvinsi, setTempProvinsi] = useState(location.provinsi);
  const [tempKabkota, setTempKabkota] = useState(location.kabkota);

  const { data: provinsiList } = useProvinsiList();
  const { data: kabkotaList } = useKabKotaList(tempProvinsi);
  const { data: jadwalData, isLoading, error } = useJadwalSholat(location.provinsi, location.kabkota, bulan, tahun);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const todayStr = getToday();
  const todayJadwal = useMemo(() => {
    return jadwalData?.jadwal?.find(j => j.tanggal_lengkap === todayStr);
  }, [jadwalData, todayStr]);

  // Next prayer + countdown
  const { nextPrayer, countdown } = useMemo(() => {
    if (!todayJadwal) return { nextPrayer: null, countdown: '' };
    const now2 = new Date();
    const nowTime = `${String(now2.getHours()).padStart(2, '0')}:${String(now2.getMinutes()).padStart(2, '0')}`;
    for (const key of PRAYER_KEYS) {
      const time = todayJadwal[key as keyof JadwalSholat] as string;
      if (time > nowTime) {
        const [th, tm] = time.split(':').map(Number);
        const targetSec = th * 3600 + tm * 60;
        const nowSec = now2.getHours() * 3600 + now2.getMinutes() * 60 + now2.getSeconds();
        const diff = Math.max(0, targetSec - nowSec);
        return { nextPrayer: key, countdown: formatCountdown(diff) };
      }
    }
    return { nextPrayer: null, countdown: '' };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayJadwal, tick]);

  const handlePrevMonth = () => {
    if (bulan === 1) { setBulan(12); setTahun(t => t - 1); }
    else setBulan(b => b - 1);
  };

  const handleNextMonth = () => {
    if (bulan === 12) { setBulan(1); setTahun(t => t + 1); }
    else setBulan(b => b + 1);
  };

  const applyLocationFilter = () => {
    if (tempKabkota) {
      setLocation({ provinsi: tempProvinsi, kabkota: tempKabkota });
    }
    setShowFilter(false);
  };

  const BULAN_NAMES = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-stone-50/80 dark:bg-gray-950/80 backdrop-blur-xl px-5 pt-6 pb-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-3"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Jadwal Sholat</h1>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 mt-0.5 hover:underline"
            >
              <MapPin className="w-3.5 h-3.5" />
              {location.kabkota}, {location.provinsi}
            </button>
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${showFilter ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Location Filter */}
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-3 space-y-3"
          >
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Provinsi</label>
              <select
                value={tempProvinsi}
                onChange={e => { setTempProvinsi(e.target.value); setTempKabkota(''); }}
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                {provinsiList?.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Kabupaten / Kota</label>
              <select
                value={tempKabkota}
                onChange={e => setTempKabkota(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                <option value="">Pilih Kota...</option>
                {kabkotaList?.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <button
              onClick={applyLocationFilter}
              disabled={!tempKabkota}
              className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-semibold transition-colors"
            >
              Terapkan
            </button>
          </motion.div>
        )}
      </div>

      <div className="px-5 mt-2">
        {/* Today's Schedule Highlight */}
        {todayJadwal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-gray-950 rounded-2xl p-5 mb-5 relative overflow-hidden"
          >
            {/* Decorative */}
            <div className="absolute top-2 right-2 w-20 h-20 border border-white/10 rounded-full" />
            <div className="absolute bottom-2 right-8 w-12 h-12 border border-white/10 rounded-full" />

            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary-200" />
              <p className="text-primary-200 text-sm font-medium">
                Hari Ini — {todayJadwal.hari}, {todayJadwal.tanggal} {BULAN_NAMES[bulan]} {tahun}
              </p>
            </div>

            {nextPrayer && (
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white">
                    {PRAYER_ICONS[nextPrayer]}
                  </div>
                  <span className="text-white/90 text-sm">Menuju <span className="font-bold text-white">{PRAYER_LABELS[nextPrayer]}</span></span>
                </div>
                <span className="text-white font-mono font-bold text-base tracking-wider">{countdown}</span>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {PRAYER_KEYS.map(key => {
                const isNext = key === nextPrayer;
                return (
                  <div
                    key={key}
                    className={`rounded-xl p-2.5 text-center transition-all ${isNext ? 'bg-white/25 ring-2 ring-white/40 scale-105' : 'bg-white/10'}`}
                  >
                    <div className={`flex justify-center mb-1 ${isNext ? 'text-white' : 'text-primary-200'}`}>
                      {PRAYER_ICONS[key]}
                    </div>
                    <p className={`text-[10px] ${isNext ? 'text-white font-bold' : 'text-primary-200'}`}>{PRAYER_LABELS[key]}</p>
                    <p className={`text-sm font-bold ${isNext ? 'text-white' : 'text-white/90'}`}>
                      {todayJadwal[key as keyof JadwalSholat]}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {BULAN_NAMES[bulan]} {tahun}
          </h2>
          <button onClick={handleNextMonth} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Monthly Schedule Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Gagal memuat jadwal sholat</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2 mb-6"
          >
            {jadwalData?.jadwal?.map((j) => {
              const isToday = j.tanggal_lengkap === todayStr;
              return (
                <motion.div
                  key={j.tanggal}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border p-4 transition-all ${
                    isToday
                      ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-200 dark:border-primary-800 ring-1 ring-primary-300 dark:ring-primary-700'
                      : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                  }`}
                >
                  {/* Date header */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${
                        isToday
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}>
                        {j.tanggal}
                      </span>
                      <span className={`text-sm font-medium ${isToday ? 'text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {j.hari}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-600 text-white">
                          HARI INI
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Times grid */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {PRAYER_KEYS.map(key => (
                      <div key={key} className="text-center">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{PRAYER_LABELS[key]}</p>
                        <p className={`text-xs font-semibold ${isToday ? 'text-primary-700 dark:text-primary-400' : 'text-gray-800 dark:text-gray-200'}`}>
                          {j[key as keyof JadwalSholat]}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
