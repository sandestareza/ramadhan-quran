import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { PageWrapper } from './PageWrapper';
import { JuzListPage } from '@/features/juz/JuzListPage';
import { JuzReadingPage } from '@/features/juz/JuzReadingPage';

export const juzRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/juz',
  component: () => <PageWrapper><JuzListPage /></PageWrapper>,
});

export const juzDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/juz/$juzId',
  component: () => <JuzReadingPage />,
});
