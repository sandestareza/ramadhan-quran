import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { PageWrapper } from './PageWrapper';
import { BookmarkPage } from '@/features/bookmark/BookmarkPage';

export const bookmarkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bookmark',
  component: () => <PageWrapper><BookmarkPage /></PageWrapper>,
});
