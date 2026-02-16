import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { PageWrapper } from './PageWrapper';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => <PageWrapper><SettingsPage /></PageWrapper>,
});
