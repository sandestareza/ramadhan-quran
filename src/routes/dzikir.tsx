import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { DzikirPage } from '@/features/dzikir/DzikirPage';

export const dzikirRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dzikir',
  component: DzikirPage,
});
