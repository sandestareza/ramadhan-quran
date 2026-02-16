import { useState, useCallback, useEffect } from 'react';
import type { Bookmark, Ayat } from '@/types';

const BOOKMARKS_KEY = 'ramadhan-quran-bookmarks';

function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks: Bookmark[]) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function useBookmark() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  const addBookmark = useCallback((
    surahNomor: number,
    surahNama: string,
    surahNamaLatin: string,
    ayat: Ayat
  ) => {
    const id = `${surahNomor}:${ayat.nomorAyat}`;
    setBookmarks(prev => {
      if (prev.some(b => b.id === id)) return prev;
      return [...prev, {
        id,
        surahNomor,
        surahNama,
        surahNamaLatin,
        ayatNomor: ayat.nomorAyat,
        teksArab: ayat.teksArab,
        teksIndonesia: ayat.teksIndonesia,
        createdAt: Date.now(),
      }];
    });
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  }, []);

  const isBookmarked = useCallback((surahNomor: number, ayatNomor: number) => {
    return bookmarks.some(b => b.id === `${surahNomor}:${ayatNomor}`);
  }, [bookmarks]);

  const toggleBookmark = useCallback((
    surahNomor: number,
    surahNama: string,
    surahNamaLatin: string,
    ayat: Ayat
  ) => {
    const id = `${surahNomor}:${ayat.nomorAyat}`;
    if (bookmarks.some(b => b.id === id)) {
      removeBookmark(id);
    } else {
      addBookmark(surahNomor, surahNama, surahNamaLatin, ayat);
    }
  }, [bookmarks, addBookmark, removeBookmark]);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
  };
}
