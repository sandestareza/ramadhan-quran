import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { usePrayerNotification } from '@/hooks/usePrayerNotification';

function useInitSettings() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem('ramadhan-quran-settings');
      if (raw) {
        const settings = JSON.parse(raw);
        if (settings.darkMode) {
          document.documentElement.classList.add('dark');
        }
      }
    } catch { /* ignore */ }
  }, []);
}

function RootLayout() {
  useInitSettings();
  // Start prayer notification watcher (runs in background)
  usePrayerNotification();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-lg mx-auto relative">
        <Outlet />
        <BottomNav />
      </div>
    </div>
  );
}

export const rootRoute = createRootRoute({
  component: RootLayout,
});
