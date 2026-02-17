import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { HafalanPage } from '@/features/hafalan/HafalanPage';

export const hafalanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hafalan',
  component: HafalanPage,
});
