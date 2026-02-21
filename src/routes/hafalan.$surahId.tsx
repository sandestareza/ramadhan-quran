import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { HafalanSessionPage } from '@/features/hafalan/HafalanSessionPage';

export const hafalanSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hafalan/$surahId',
  component: HafalanSessionPage,
});
