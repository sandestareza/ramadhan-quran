import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { PageWrapper } from './PageWrapper';
import { HomePage } from '@/features/home/HomePage';

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <PageWrapper><HomePage /></PageWrapper>,
});
