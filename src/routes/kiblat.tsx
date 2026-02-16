import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { KiblatPage } from '@/features/kiblat/KiblatPage';

export const kiblatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kiblat',
  component: KiblatPage,
});
