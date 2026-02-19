import { createRoute } from "@tanstack/react-router";
import { RamadhanTrackerPage } from "@/features/ramadhan-tracker/RamadhanTrackerPage";
import { rootRoute } from './__root';

export const ramadhanTrackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ramadhan-tracker",
  component: RamadhanTrackerPage,
});
