import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { GameHubPage } from '@/features/game/GameHubPage';
import { GamePlayPage } from '@/features/game/GamePlayPage';

export const gameHubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/game',
  component: GameHubPage,
});

export const gamePlayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/game/$mode',
  component: GamePlayPage,
});
