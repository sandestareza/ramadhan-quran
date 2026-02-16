import { useState, useEffect, useCallback } from 'react';

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Calculate Qibla bearing from a given location using the great circle formula.
 * Returns bearing in degrees from North (0-360).
 */
function calculateQiblaBearing(lat: number, lng: number): number {
  const lat1 = toRadians(lat);
  const lat2 = toRadians(KAABA_LAT);
  const dLng = toRadians(KAABA_LNG - lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

interface QiblaCompassState {
  /** User's GPS latitude */
  latitude: number | null;
  /** User's GPS longitude */
  longitude: number | null;
  /** Qibla bearing from North (degrees, 0-360) */
  qiblaBearing: number | null;
  /** Device compass heading (degrees, 0-360) */
  compassHeading: number | null;
  /** Qibla direction relative to device heading */
  qiblaDirection: number | null;
  /** Error message */
  error: string | null;
  /** Whether geolocation is loading */
  locationLoading: boolean;
  /** Whether compass is supported */
  compassSupported: boolean;
  /** Whether iOS permission has been requested */
  needsPermission: boolean;
}

export function useQiblaCompass() {
  const [state, setState] = useState<QiblaCompassState>({
    latitude: null,
    longitude: null,
    qiblaBearing: null,
    compassHeading: null,
    qiblaDirection: null,
    error: null,
    locationLoading: true,
    compassSupported: true,
    needsPermission: false,
  });

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation tidak didukung', locationLoading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const bearing = calculateQiblaBearing(latitude, longitude);
        setState(prev => ({
          ...prev,
          latitude,
          longitude,
          qiblaBearing: bearing,
          locationLoading: false,
        }));
      },
      (err) => {
        let errorMsg = 'Gagal mendapatkan lokasi';
        if (err.code === 1) errorMsg = 'Izin lokasi ditolak. Aktifkan GPS untuk menggunakan kompas kiblat.';
        if (err.code === 2) errorMsg = 'Lokasi tidak tersedia';
        if (err.code === 3) errorMsg = 'Waktu permintaan lokasi habis';
        setState(prev => ({ ...prev, error: errorMsg, locationLoading: false }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Device orientation (compass heading)
  useEffect(() => {
    // Check if DeviceOrientationEvent is available
    const hasOrientation = 'DeviceOrientationEvent' in window;

    if (!hasOrientation) {
      setState(prev => ({ ...prev, compassSupported: false }));
      return;
    }

    // iOS 13+ requires permission
    const doeAny = DeviceOrientationEvent as any;
    if (typeof doeAny.requestPermission === 'function') {
      setState(prev => ({ ...prev, needsPermission: true }));
      return;
    }

    // Android / older browsers - just listen
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading: number | null = null;

      // webkitCompassHeading for iOS Safari
      const evt = event as any;
      if (evt.webkitCompassHeading !== undefined) {
        heading = evt.webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Android: alpha is degrees from North
        heading = (360 - event.alpha) % 360;
      }

      if (heading !== null) {
        setState(prev => {
          const qiblaDir = prev.qiblaBearing !== null
            ? (prev.qiblaBearing - heading! + 360) % 360
            : null;
          return {
            ...prev,
            compassHeading: heading,
            qiblaDirection: qiblaDir,
          };
        });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, []);

  // Request iOS permission
  const requestPermission = useCallback(async () => {
    try {
      const doeAny = DeviceOrientationEvent as any;
      const permission = await doeAny.requestPermission();
      if (permission === 'granted') {
        setState(prev => ({ ...prev, needsPermission: false }));

        const handleOrientation = (event: DeviceOrientationEvent) => {
          const evt = event as any;
          let heading: number | null = null;
          if (evt.webkitCompassHeading !== undefined) {
            heading = evt.webkitCompassHeading;
          } else if (event.alpha !== null) {
            heading = (360 - event.alpha) % 360;
          }

          if (heading !== null) {
            setState(prev => {
              const qiblaDir = prev.qiblaBearing !== null
                ? (prev.qiblaBearing - heading! + 360) % 360
                : null;
              return { ...prev, compassHeading: heading, qiblaDirection: qiblaDir };
            });
          }
        };

        window.addEventListener('deviceorientation', handleOrientation, true);
      } else {
        setState(prev => ({ ...prev, compassSupported: false, needsPermission: false }));
      }
    } catch {
      setState(prev => ({ ...prev, compassSupported: false, needsPermission: false }));
    }
  }, []);

  return { ...state, requestPermission };
}
