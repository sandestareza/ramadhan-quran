import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Layers,
  Star,
  ChevronRight,
  HandHeart,
  MapPin,
  Clock,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CloudSun,
} from "lucide-react";
import {
  useSurahList,
  useJadwalSholat,
  useSholatLocation,
} from "@/hooks/useQuran";
import { SurahCardSkeleton } from "@/components/Skeleton";
import { ReadingActivityCard } from "@/components/ReadingActivityCard";
import { RecentHistoryCard } from "@/components/RecentHistoryCard";
import { useMemo, useState, useEffect } from "react";
import type { JadwalSholat } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const PRAYER_KEYS = [
  "imsak",
  "subuh",
  "terbit",
  "dhuha",
  "dzuhur",
  "ashar",
  "maghrib",
  "isya",
] as const;
const PRAYER_LABELS: Record<string, string> = {
  imsak: "Imsak",
  subuh: "Subuh",
  terbit: "Terbit",
  dhuha: "Dhuha",
  dzuhur: "Dzuhur",
  ashar: "Ashar",
  maghrib: "Maghrib",
  isya: "Isya",
};
const PRAYER_ICONS: Record<string, React.ReactNode> = {
  imsak: <Moon className="w-3 h-3" />,
  subuh: <Sunrise className="w-3 h-3" />,
  terbit: <Sun className="w-3 h-3" />,
  dhuha: <CloudSun className="w-3 h-3" />,
  dzuhur: <Sun className="w-3 h-3" />,
  ashar: <CloudSun className="w-3 h-3" />,
  maghrib: <Sunset className="w-3 h-3" />,
  isya: <Moon className="w-3 h-3" />,
};

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function HomePage() {
  const navigate = useNavigate();
  const { data: surahs, isLoading } = useSurahList();
  const { location, detecting } = useSholatLocation();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();
  const todayStr = `${tahun}-${String(bulan).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const { data: jadwalData } = useJadwalSholat(
    location.provinsi,
    location.kabkota,
    bulan,
    tahun,
  );

  const todayJadwal = useMemo(() => {
    return jadwalData?.jadwal?.find((j) => j.tanggal_lengkap === todayStr);
  }, [jadwalData, todayStr]);

  const { nextPrayer, countdown } = useMemo(() => {
    if (!todayJadwal) return { nextPrayer: null, countdown: "" };
    const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    for (const key of PRAYER_KEYS) {
      const time = todayJadwal[key as keyof JadwalSholat] as string;
      if (time > nowTime) {
        const [th, tm] = time.split(":").map(Number);
        const targetSec = th * 3600 + tm * 60;
        const nowSec =
          now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const diff = Math.max(0, targetSec - nowSec);
        return { nextPrayer: key, countdown: formatCountdown(diff) };
      }
    }
    return { nextPrayer: null, countdown: "" };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayJadwal, tick]);

  const featuredSurahs =
    surahs?.filter((s) => [1, 36, 55, 56, 67, 78, 112].includes(s.nomor)) || [];

  return (
    <div className="pb-safe">
      {/* Hero */}
      <div className="relative overflow-hidden bg-linear-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-gray-950 rounded-b-4xl px-6 pt-12 pb-10">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white rounded-full" />
          <div className="absolute top-12 right-12 w-20 h-20 border-2 border-white rounded-full" />
          <div className="absolute bottom-4 left-4 w-16 h-16 border border-white rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-primary-200 text-sm mb-1">
            بسم الله الرحمن الرحيم
          </p>
          <h1 className="text-2xl font-bold text-white mb-1">Ramadhan Quran</h1>
          <p className="text-primary-200 text-sm">
            Baca, dengarkan, dan pahami Al-Qur'an
          </p>
        </motion.div>
      </div>

      {/* Features Grid */}
        <div className="px-6 -mt-6 relative z-10 space-y-8">
          
          {/* Ramadhan Special */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
             <button
              onClick={() => navigate({ to: "/ramadhan-tracker" })}
              className="w-full flex items-center gap-4 bg-linear-to-r from-emerald-500 to-teal-600 rounded-3xl p-5 text-left shadow-xl shadow-teal-500/20 relative overflow-hidden group"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 opacity-10 text-9xl transform translate-x-8 -translate-y-4 rotate-12 transition-transform group-hover:scale-110 duration-700">🌙</div>
              <div className="absolute bottom-0 left-0 opacity-10 text-6xl transform -translate-x-4 translate-y-4 -rotate-12">✨</div>
              
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0">
                📅
              </div>
              <div className="flex-1 relative z-10 min-w-0">
                <h3 className="text-white font-bold text-lg mb-1">Ramadhan Tracker</h3>
                <p className="text-teal-100 text-xs font-medium opacity-90 leading-relaxed">
                  Pantau ibadah harian &<br/> target khatam Quran
                </p>
              </div>
              <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
            </button>
          </motion.div>

          {/* Main Features */}
          <div>
            <h3 className="text-gray-900 dark:text-gray-100 font-bold mb-4 px-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" />
              Al-Qur'an & Ibadah
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <MenuCard 
                title="Surah" 
                subtitle="114 Surah" 
                icon={<BookOpen className="w-5 h-5" />} 
                color="blue"
                onClick={() => navigate({ to: "/surah" })}
                delay={0.3}
              />
              <MenuCard 
                title="Juz" 
                subtitle="30 Juz" 
                icon={<Layers className="w-5 h-5" />} 
                color="indigo"
                onClick={() => navigate({ to: "/juz" })}
                delay={0.35}
              />
              <MenuCard 
                title="Doa-doa" 
                subtitle="Harian & Pilihan" 
                icon={<HandHeart className="w-5 h-5" />} 
                color="pink"
                onClick={() => navigate({ to: "/doa" })}
                delay={0.4}
              />
               <MenuCard 
                title="Tasbih" 
                subtitle="Counter Dzikir" 
                icon={<span className="text-xl">📿</span>} 
                color="teal"
                onClick={() => navigate({ to: "/dzikir" })}
                delay={0.45}
              />
            </div>
          </div>

          {/* Activity Features */}
          <div>
             <h3 className="text-gray-900 dark:text-gray-100 font-bold mb-4 px-1 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Belajar & Seru
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <MenuCard 
                title="Hafalan" 
                subtitle="Tracking Hafalan" 
                icon={<span className="text-xl">🎯</span>} 
                color="violet"
                onClick={() => navigate({ to: "/hafalan" })}
                delay={0.5}
              />
              <MenuCard 
                title="Game" 
                subtitle="Kuis Al-Qur'an" 
                icon={<span className="text-xl">🎮</span>} 
                color="orange"
                onClick={() => navigate({ to: "/game" })}
                delay={0.55}
              />
            </div>
          </div>

        </div>
      
      {/* Jadwal Sholat Hari Ini */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-5 mt-5"
      >
        <button
          onClick={() => navigate({ to: "/jadwal-sholat" })}
          className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-primary-200 dark:hover:border-gray-700 transition-all text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Jadwal Sholat Hari Ini
                </p>
                {detecting ? (
                  <p className="text-[10px] text-amber-500 dark:text-amber-400 font-medium flex items-center gap-1 animate-pulse">
                    <MapPin className="w-2.5 h-2.5" />
                    Mendeteksi lokasi...
                  </p>
                ) : (
                  <>
                    {nextPrayer && (
                      <p className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        Menuju {PRAYER_LABELS[nextPrayer]} — {countdown}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {location.kabkota}, {location.provinsi}
                    </p>
                  </>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          {todayJadwal ? (
            <div className="grid grid-cols-4 gap-1.5">
              {PRAYER_KEYS.map((key) => {
                const isNext = key === nextPrayer;
                return (
                  <div
                    key={key}
                    className={`rounded-lg py-1.5 px-1 text-center ${
                      isNext
                        ? "bg-primary-50 dark:bg-primary-950/50 ring-1 ring-primary-200 dark:ring-primary-800"
                        : "bg-gray-50 dark:bg-gray-800/50"
                    }`}
                  >
                    <div
                      className={`flex justify-center mb-0.5 ${isNext ? "text-primary-600 dark:text-primary-400" : "text-gray-400"}`}
                    >
                      {PRAYER_ICONS[key]}
                    </div>
                    <p
                      className={`text-[9px] ${isNext ? "text-primary-600 dark:text-primary-400 font-bold" : "text-gray-400"}`}
                    >
                      {PRAYER_LABELS[key]}
                    </p>
                    <p
                      className={`text-xs font-bold ${isNext ? "text-primary-700 dark:text-primary-300" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      {todayJadwal[key as keyof JadwalSholat]}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg bg-gray-50 dark:bg-gray-800/50 animate-pulse"
                />
              ))}
            </div>
          )}
        </button>
      </motion.div>

      {/* Lanjutkan Bacaan */}
      <RecentHistoryCard />

      {/* Featured Surahs */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Surah Pilihan
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Surah yang sering dibaca
            </p>
          </div>
          <button
            onClick={() => navigate({ to: "/surah" })}
            className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center gap-1 hover:underline"
          >
            Semua <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SurahCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {featuredSurahs.map((surah) => (
              <motion.button
                key={surah.nomor}
                variants={item}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  navigate({
                    to: "/surah/$surahId",
                    params: { surahId: String(surah.nomor) },
                    search: { ayat: undefined },
                  })
                }
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-gray-700 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-400 shrink-0">
                  {surah.nomor}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {surah.namaLatin}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {surah.arti} • {surah.jumlahAyat} Ayat
                  </p>
                </div>
                <div className="text-right">
                  <p className="arabic-text text-lg text-primary-800 dark:text-primary-300">
                    {surah.nama}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-5 mt-8 mb-6"
      >
        <div className="bg-linear-to-r from-primary-50 to-primary-100/50 dark:from-primary-950/30 dark:to-gray-900 rounded-2xl p-5 border border-primary-100 dark:border-primary-900/30">
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-5 h-5 text-gold-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Tentang Al-Qur'an
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                114
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Surah</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                6.236
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ayat</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                30
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Juz</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface MenuCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: "blue" | "indigo" | "pink" | "teal" | "violet" | "orange";
  onClick: () => void;
  delay: number;
}

function MenuCard({ title, subtitle, icon, color, onClick, delay }: MenuCardProps) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    pink: "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col gap-3 p-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-primary-100 dark:hover:border-gray-700 transition-all text-left group relative overflow-hidden"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorStyles[color]} transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300`}>
        {icon}
      </div>
      <div>
        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-0.5">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{subtitle}</p>
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gray-50/50 dark:bg-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.button>
  );
}
