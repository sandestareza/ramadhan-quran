import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { quranApi } from '@/services/api';
import type { SholatLocation } from '@/types';

export function useSurahList() {
  return useQuery({
    queryKey: ['surah-list'],
    queryFn: quranApi.getSurahList,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useSurahDetail(nomor: number) {
  return useQuery({
    queryKey: ['surah-detail', nomor],
    queryFn: () => quranApi.getSurahDetail(nomor),
    enabled: nomor > 0,
    staleTime: 1000 * 60 * 60,
  });
}

export function useTafsir(nomor: number) {
  return useQuery({
    queryKey: ['tafsir', nomor],
    queryFn: () => quranApi.getTafsir(nomor),
    enabled: nomor > 0,
    staleTime: 1000 * 60 * 60,
  });
}

export function useDoaList() {
  return useQuery({
    queryKey: ['doa-list'],
    queryFn: quranApi.getDoaList,
    staleTime: 1000 * 60 * 60,
  });
}

// Shalat hooks
const SHOLAT_LOCATION_KEY = 'sholat-location';
const DEFAULT_LOCATION: SholatLocation = { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta' };

function getSavedLocation(): SholatLocation {
  try {
    const saved = localStorage.getItem(SHOLAT_LOCATION_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return DEFAULT_LOCATION;
}

export function useSholatLocation() {
  const [location, setLocationState] = useState<SholatLocation>(getSavedLocation);

  const setLocation = useCallback((loc: SholatLocation) => {
    setLocationState(loc);
    localStorage.setItem(SHOLAT_LOCATION_KEY, JSON.stringify(loc));
  }, []);

  return { location, setLocation };
}

export function useProvinsiList() {
  return useQuery({
    queryKey: ['shalat-provinsi'],
    queryFn: quranApi.getProvinsiList,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export function useKabKotaList(provinsi: string) {
  return useQuery({
    queryKey: ['shalat-kabkota', provinsi],
    queryFn: () => quranApi.getKabKotaList(provinsi),
    enabled: !!provinsi,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useJadwalSholat(provinsi: string, kabkota: string, bulan: number, tahun: number) {
  return useQuery({
    queryKey: ['jadwal-sholat', provinsi, kabkota, bulan, tahun],
    queryFn: () => quranApi.getJadwalSholat(provinsi, kabkota, bulan, tahun),
    enabled: !!provinsi && !!kabkota,
    staleTime: 1000 * 60 * 60,
  });
}

