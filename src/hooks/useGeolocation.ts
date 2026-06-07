import { useState, useEffect, useCallback } from 'react';

interface LocationState {
  loaded: boolean;
  coordinates?: { lat: number; lng: number };
  error?: { code: number; message: string };
}

const useGeolocation = () => {
  const [location, setLocation] = useState<LocationState>({
    loaded: false,
    coordinates: { lat: -12.068, lng: -75.210 }, // Default: Huancayo
  });

  const onSuccess = useCallback((location: GeolocationPosition) => {
    setLocation({
      loaded: true,
      coordinates: {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      },
    });
  }, []);

  const onError = useCallback((error: GeolocationPositionError) => {
    setLocation({
      loaded: true,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }, []);

  const getPosition = useCallback(() => {
    if (!("geolocation" in navigator)) {
      onError({
        code: 0,
        message: "Geolocalización no soportada",
      } as GeolocationPositionError);
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    let mounted = true;

    if (!("geolocation" in navigator)) {
      if (mounted) {
        // Schedule state update to avoid synchronous update in effect body
        setTimeout(() => {
          if (mounted) {
            setLocation({
              loaded: true,
              error: {
                code: 0,
                message: "Geolocalización no soportada",
              },
            });
          }
        }, 0);
      }
    } else {
      navigator.geolocation.getCurrentPosition(
        (loc) => {
          if (mounted) {
            setLocation({
              loaded: true,
              coordinates: {
                lat: loc.coords.latitude,
                lng: loc.coords.longitude,
              },
            });
          }
        },
        (error) => {
          if (mounted) {
            setLocation({
              loaded: true,
              error: {
                code: error.code,
                message: error.message,
              },
            });
          }
        }
      );
    }

    return () => {
      mounted = false;
    };
  }, []);

  return { location, getPosition };
};

export default useGeolocation;

