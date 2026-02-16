import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { PageWrapper } from './PageWrapper';
import { SurahListPage } from '@/features/surah/SurahListPage';
import { SurahDetailPage } from '@/features/surah/SurahDetailPage';

export const surahListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/surah',
  component: () => <PageWrapper><SurahListPage /></PageWrapper>,
});

export const surahDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/surah/$surahId',
  validateSearch: (search: Record<string, unknown>): { ayat?: number } => ({
    ayat: search.ayat ? Number(search.ayat) : undefined,
  }),
  component: () => <PageWrapper><SurahDetailPage /></PageWrapper>,
});
