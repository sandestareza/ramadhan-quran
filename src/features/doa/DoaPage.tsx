import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Tag, BookOpen, Filter } from 'lucide-react';
import { useDoaList } from '@/hooks/useQuran';
import { SurahCardSkeleton } from '@/components/Skeleton';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function DoaPage() {
  const { data: doaList, isLoading, error } = useDoaList();
  const [search, setSearch] = useState('');
  const [selectedGrup, setSelectedGrup] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Get unique groups
  const groups = useMemo(() => {
    if (!doaList) return [];
    const set = new Set(doaList.map(d => d.grup));
    return Array.from(set);
  }, [doaList]);

  // Filter doa
  const filtered = useMemo(() => {
    if (!doaList) return [];
    let result = doaList;
    if (selectedGrup) {
      result = result.filter(d => d.grup === selectedGrup);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        d =>
          (d.nama || '').toLowerCase().includes(q) ||
          (d.idn || '').toLowerCase().includes(q) ||
          (d.grup || '').toLowerCase().includes(q) ||
          (Array.isArray(d.tag) && d.tag.some(t => (t || '').toLowerCase().includes(q)))
      );
    }
    return result;
  }, [doaList, search, selectedGrup]);

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Kumpulan Doa</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {doaList ? `${doaList.length} doa` : 'Memuat...'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari doa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
        </div>

        {/* Group filter dropdown */}
        <div className="relative mt-3">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={selectedGrup ?? ''}
            onChange={(e) => setSelectedGrup(e.target.value || null)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 appearance-none cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            {groups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 mt-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SurahCardSkeleton key={i} />)
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Gagal memuat data doa</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Tidak ada doa yang ditemukan</p>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3" key={`${search}-${selectedGrup}`}>
            {filtered.map((doa) => (
              <motion.div
                key={doa.id}
                variants={item}
                className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                {/* Doa header - always visible */}
                <button
                  onClick={() => setExpandedId(expandedId === doa.id ? null : doa.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-400 shrink-0 mt-0.5">
                      {doa.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                        {doa.nama}
                      </p>
                      <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">{doa.grup}</p>
                      {doa.tag.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          <Tag className="w-3 h-3 text-gray-400" />
                          {doa.tag.map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-gray-400">
                      {expandedId === doa.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {expandedId === doa.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4">
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-4" />

                        {/* Arabic */}
                        {doa.ar && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Arab</p>
                            <p className="arabic-text text-xl leading-[2.5] text-right text-gray-900 dark:text-gray-100">
                              {doa.ar}
                            </p>
                          </div>
                        )}

                        {/* Latin */}
                        {doa.tr && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Latin</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                              {doa.tr}
                            </p>
                          </div>
                        )}

                        {/* Translation */}
                        {doa.idn && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Artinya</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {doa.idn}
                            </p>
                          </div>
                        )}

                        {/* Source */}
                        {doa.tentang && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Keterangan</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed whitespace-pre-line">
                              {doa.tentang}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
