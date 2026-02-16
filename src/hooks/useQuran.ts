import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
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

function getSavedLocation(): SholatLocation | null {
  try {
    const saved = localStorage.getItem(SHOLAT_LOCATION_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function saveLocation(loc: SholatLocation) {
  localStorage.setItem(SHOLAT_LOCATION_KEY, JSON.stringify(loc));
}

// Best-effort fuzzy match: find the province/city string that contains or is contained by the target
function fuzzyMatch(target: string, candidates: string[]): string | null {
  const t = target.toLowerCase().replace(/\./g, '');
  // Exact match first
  const exact = candidates.find(c => c.toLowerCase() === t);
  if (exact) return exact;
  // Partial match
  const partial = candidates.find(c => {
    const cl = c.toLowerCase().replace(/\./g, '');
    return cl.includes(t) || t.includes(cl);
  });
  return partial ?? null;
}

async function detectLocation(): Promise<SholatLocation | null> {
  try {
    // 1. Get GPS coordinates
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 8000,
        enableHighAccuracy: false,
      });
    });

    const { latitude, longitude } = pos.coords;

    // 2. Reverse geocode via Nominatim (free, no key required)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`,
      { headers: { 'User-Agent': 'RamadhanQuranApp/1.0' } }
    );
    const geo = await res.json();
    const address = geo.address || {};

    // Nominatim returns state as province in Indonesia
    const geoProvinsi = address.state || '';
    const geoKota = address.city || address.county || address.town || address.municipality || '';

    if (!geoProvinsi) return null;

    // 3. Match against shalat API province list
    const provinsiList = await quranApi.getProvinsiList();
    const matchedProvinsi = fuzzyMatch(geoProvinsi, provinsiList);
    if (!matchedProvinsi) return null;

    // 4. Fetch kabkota list and match
    const kabkotaList = await quranApi.getKabKotaList(matchedProvinsi);
    const matchedKabkota = fuzzyMatch(geoKota, kabkotaList);

    // If no city match, use the first available city in that province
    const finalKabkota = matchedKabkota || kabkotaList[0] || '';
    if (!finalKabkota) return null;

    return { provinsi: matchedProvinsi, kabkota: finalKabkota };
  } catch {
    // Geolocation denied, timeout, or network error
    return null;
  }
}

export function useSholatLocation() {
  const [location, setLocationState] = useState<SholatLocation>(
    () => getSavedLocation() || DEFAULT_LOCATION
  );
  const [detecting, setDetecting] = useState(false);

  // Auto-detect on first load if no saved location
  useEffect(() => {
    const saved = getSavedLocation();
    if (saved) return; // Already have a saved preference
    if (!navigator.geolocation) return;

    setDetecting(true);
    detectLocation().then(detected => {
      if (detected) {
        setLocationState(detected);
        saveLocation(detected);
      }
      setDetecting(false);
    });
  }, []);

  const setLocation = useCallback((loc: SholatLocation) => {
    setLocationState(loc);
    saveLocation(loc);
  }, []);

  return { location, setLocation, detecting };
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

