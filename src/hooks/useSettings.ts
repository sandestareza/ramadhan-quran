import { useState, useEffect, useCallback } from 'react';
import type { DisplayMode, AppSettings, QariKey, ArabicFont } from '@/types';

const SETTINGS_KEY = 'ramadhan-quran-settings';

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  displayMode: 'full',
  selectedQari: '05',
  arabicFont: 'isepmisbah',
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
    // Apply dark mode to document
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply arabic font CSS variable
    const fontFamilies: Record<ArabicFont, string> = {
      'isepmisbah': "'LPMQ IsepMisbah', 'Amiri Quran', 'Amiri', 'Traditional Arabic', sans-serif",
      'amiri': "'Amiri', 'Amiri Quran', 'LPMQ IsepMisbah', 'Traditional Arabic', sans-serif",
      'amiri-quran': "'Amiri Quran', 'Amiri', 'LPMQ IsepMisbah', 'Traditional Arabic', sans-serif",
      'traditional': "'Traditional Arabic', 'LPMQ IsepMisbah', 'Amiri Quran', 'Amiri', sans-serif",
    };
    document.documentElement.style.setProperty('--font-arabic', fontFamilies[settings.arabicFont]);
  }, [settings]);

  const toggleDarkMode = useCallback(() => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const setDisplayMode = useCallback((mode: DisplayMode) => {
    setSettings(prev => ({ ...prev, displayMode: mode }));
  }, []);

  const setSelectedQari = useCallback((qari: QariKey) => {
    setSettings(prev => ({ ...prev, selectedQari: qari }));
  }, []);

  const setArabicFont = useCallback((font: ArabicFont) => {
    setSettings(prev => ({ ...prev, arabicFont: font }));
  }, []);

  return {
    settings,
    toggleDarkMode,
    setDisplayMode,
    setSelectedQari,
    setArabicFont,
  };
}
