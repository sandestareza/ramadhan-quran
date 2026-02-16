import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { PageWrapper } from './PageWrapper';
import { DoaPage } from '@/features/doa/DoaPage';

export const doaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/doa',
  component: () => <PageWrapper><DoaPage /></PageWrapper>,
});
