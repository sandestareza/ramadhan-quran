import { useState, useEffect, useCallback, useRef } from 'react';
import { quranApi } from '@/services/api';
import type { JadwalSholat, SholatLocation } from '@/types';

const NOTIF_SETTINGS_KEY = 'prayer-notification-settings';
const NOTIFIED_KEY_PREFIX = 'prayer-notified-';

// Prayer times we want to notify (excluding terbit/dhuha)
const PRAYER_NAMES: Record<string, string> = {
  imsak: 'Imsak',
  subuh: 'Subuh',
  dzuhur: 'Dzuhur',
  ashar: 'Ashar',
  maghrib: 'Maghrib',
  isya: 'Isya',
};

const PRAYER_EMOJIS: Record<string, string> = {
  imsak: '🌙',
  subuh: '🌅',
  dzuhur: '☀️',
  ashar: '🌤️',
  maghrib: '🌇',
  isya: '🌙',
};

interface NotifSettings {
  enabled: boolean;
  minutesBefore: number; // notify X minutes before prayer time
}

const DEFAULT_SETTINGS: NotifSettings = {
  enabled: false,
  minutesBefore: 5,
};

function loadNotifSettings(): NotifSettings {
  try {
    const raw = localStorage.getItem(NOTIF_SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

function saveNotifSettings(s: NotifSettings) {
  localStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(s));
}

// Check if already notified for this prayer today
function wasNotified(prayer: string, date: string): boolean {
  return localStorage.getItem(`${NOTIFIED_KEY_PREFIX}${prayer}-${date}`) === 'true';
}

function markNotified(prayer: string, date: string) {
  localStorage.setItem(`${NOTIFIED_KEY_PREFIX}${prayer}-${date}`, 'true');
}

// Parse "HH:MM" to minutes since midnight
function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Get location from localStorage (same key as useQuran hook)
function getSavedLocation(): SholatLocation | null {
  try {
    const saved = localStorage.getItem('sholat-location');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

async function sendPrayerNotification(prayer: string, time: string, minutesBefore: number) {
  const emoji = PRAYER_EMOJIS[prayer] || '🕌';
  const name = PRAYER_NAMES[prayer] || prayer;

  const title = minutesBefore > 0
    ? `${emoji} ${minutesBefore} menit menuju ${name}`
    : `${emoji} Waktu ${name} telah tiba!`;

  const body = minutesBefore > 0
    ? `Bersiap untuk sholat ${name} pukul ${time}`
    : `Saatnya sholat ${name} — pukul ${time}`;

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const reg = await navigator.serviceWorker?.ready;
      if (reg) {
        // Use service worker notification (works in background)
        reg.showNotification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: `prayer-${prayer}`,
          vibrate: [200, 100, 200],
        } as NotificationOptions);
      } else {
        // Fallback to regular notification
        new Notification(title, { body, icon: '/icon.svg', tag: `prayer-${prayer}` });
      }
    } catch {
      new Notification(title, { body, icon: '/icon.svg', tag: `prayer-${prayer}` });
    }
  }
}

export function usePrayerNotification() {
  const [settings, setSettings] = useState<NotifSettings>(loadNotifSettings);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const todayScheduleRef = useRef<JadwalSholat | null>(null);

  // Persist settings
  useEffect(() => {
    saveNotifSettings(settings);
  }, [settings]);

  // Fetch today's schedule
  useEffect(() => {
    if (!settings.enabled) return;

    const location = getSavedLocation();
    if (!location) return;

    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();
    const tanggal = now.getDate();

    quranApi.getJadwalSholat(location.provinsi, location.kabkota, bulan, tahun)
      .then(data => {
        const today = data.jadwal.find(j => j.tanggal === tanggal);
        if (today) {
          todayScheduleRef.current = today;
        }
      })
      .catch(() => { /* silently fail */ });
  }, [settings.enabled]);

  // Check prayer times every 30 seconds
  useEffect(() => {
    if (!settings.enabled || permissionState !== 'granted') return;

    const checkPrayers = () => {
      const schedule = todayScheduleRef.current;
      if (!schedule) return;

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const today = now.toISOString().split('T')[0];

      for (const [key] of Object.entries(PRAYER_NAMES)) {
        const time = (schedule as any)[key] as string;
        if (!time) continue;

        const prayerMinutes = parseTimeToMinutes(time);
        const notifyAt = prayerMinutes - settings.minutesBefore;

        // Check if we should notify (within 1 minute window)
        if (
          currentMinutes >= notifyAt &&
          currentMinutes <= notifyAt + 1 &&
          !wasNotified(key, today)
        ) {
          markNotified(key, today);
          sendPrayerNotification(key, time, settings.minutesBefore);
        }
      }
    };

    // Check immediately and then every 30s
    checkPrayers();
    const interval = setInterval(checkPrayers, 30_000);
    return () => clearInterval(interval);
  }, [settings.enabled, settings.minutesBefore, permissionState]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setPermissionState('denied');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermissionState(result);

    if (result === 'granted') {
      setSettings(prev => ({ ...prev, enabled: true }));
      return true;
    }
    return false;
  }, []);

  // Toggle notifications
  const toggleNotifications = useCallback(async () => {
    if (settings.enabled) {
      // Turn off
      setSettings(prev => ({ ...prev, enabled: false }));
    } else {
      // Turn on — request permission first if needed
      if (permissionState !== 'granted') {
        await requestPermission();
      } else {
        setSettings(prev => ({ ...prev, enabled: true }));
      }
    }
  }, [settings.enabled, permissionState, requestPermission]);

  // Set minutes before
  const setMinutesBefore = useCallback((minutes: number) => {
    setSettings(prev => ({ ...prev, minutesBefore: minutes }));
  }, []);

  return {
    enabled: settings.enabled,
    minutesBefore: settings.minutesBefore,
    permissionState,
    toggleNotifications,
    setMinutesBefore,
    requestPermission,
  };
}
