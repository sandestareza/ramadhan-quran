import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { PageWrapper } from './PageWrapper';
import { JuzListPage } from '@/features/juz/JuzListPage';

export const juzRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/juz',
  component: () => <PageWrapper><JuzListPage /></PageWrapper>,
});
