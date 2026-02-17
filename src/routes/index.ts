import { createRouter } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { homeRoute } from './home';
import { surahListRoute, surahDetailRoute } from './surah';
import { juzRoute } from './juz';
import { bookmarkRoute } from './bookmark';
import { settingsRoute } from './settings';
import { doaRoute } from './doa';
import { jadwalSholatRoute } from './jadwal-sholat';
import { gameHubRoute, gamePlayRoute } from './game';
import { kiblatRoute } from './kiblat';
import { hafalanRoute } from './hafalan';
import { dzikirRoute } from './dzikir';

const routeTree = rootRoute.addChildren([
  homeRoute,
  surahListRoute,
  surahDetailRoute,
  juzRoute,
  doaRoute,
  jadwalSholatRoute,
  gameHubRoute,
  gamePlayRoute,
  kiblatRoute,
  hafalanRoute,
  dzikirRoute,
  bookmarkRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

// Type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
