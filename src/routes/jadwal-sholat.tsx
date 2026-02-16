import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { JadwalSholatPage } from '@/features/jadwal-sholat/JadwalSholatPage';

export const jadwalSholatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jadwal-sholat',
  component: JadwalSholatPage,
});
