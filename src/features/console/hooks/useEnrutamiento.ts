import { useState, useCallback } from 'react';
import axios from 'axios';
import { routeService, type Point, type RoutingResult } from '../services/routeService';
import { useNotification } from '../../../hooks/useNotification';

export const useEnrutamiento = () => {
  const [origin, setOrigin] = useState<Point | null>(null);
  const [destination, setDestination] = useState<Point | null>(null);
  const [originName, setOriginName] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RoutingResult | null>(null);
  const [radiusMsg, setRadiusMsg] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  
  const { info, warning, error: notifyError } = useNotification();

  // Reverse Geocoding
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
      return res.data.display_name;
    } catch (err) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const updateOriginFromCoords = useCallback(async (lat: number, lng: number) => {
    const p = { lat, lng };
    setOrigin(p);
    setOriginName('Buscando dirección...');
    const name = await fetchAddress(lat, lng);
    setOriginName(name);
    return p;
  }, []);

  const useCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
        notifyError('Tu navegador no soporta geolocalización.');
        return;
    }
    
    setIsLocating(true);
    info('Conectando con el servicio de ubicación...', 'GPS');

    const options = {
        enableHighAccuracy: false, 
        timeout: 15000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            await updateOriginFromCoords(pos.coords.latitude, pos.coords.longitude);
            setIsLocating(false);
            info('Ubicación obtenida.', 'GPS');
        },
        (err) => {
            setIsLocating(false);
            if (err.code === 3) {
                warning(
                    'Tiempo agotado. Windows está tardando en responder. Intenta activar el WiFi o revisa la Privacidad de Ubicación en Windows.',
                    'Soporte Técnico'
                );
            } else if (err.code === 1) {
                warning('Permiso bloqueado. Activa la ubicación en la configuración del navegador.', 'GPS');
            } else {
                notifyError('Error al acceder al sensor de ubicación.');
            }
        },
        options
    );
  }, [updateOriginFromCoords, info, warning, notifyError]);

  const clearLocation = useCallback((type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setOrigin(null);
      setOriginName('');
    } else {
      setDestination(null);
      setDestinationName('');
    }
    setSearchResults(null);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!origin || !destination) return;

    setIsSearching(true);
    setSearchResults(null);
    
    const steps = [20, 50, 100, 200, 300];
    for (const r of steps) {
      setRadiusMsg(`Buscando rutas a ${r}m...`);
      
      try {
        const result = await routeService.searchRoutes(origin, destination, r);
        if (result.journeys && result.journeys.length > 0) {
          setSearchResults(result);
          setIsSearching(false);
          return;
        }
      } catch {
        // Silent error to continue search steps
      }
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    setIsSearching(false);
    setSearchResults({ 
      search_meta: { origin, destination, radius_reached: 300 }, 
      journeys: [] 
    });
    setRadiusMsg('No se encontraron rutas cercanas.');
  }, [origin, destination]);

  return {
    origin,
    setOrigin,
    originName,
    setOriginName,
    destination,
    setDestination,
    destinationName,
    setDestinationName,
    isSearching,
    searchResults,
    setSearchResults,
    radiusMsg,
    handleSearch,
    fetchAddress,
    useCurrentLocation,
    clearLocation,
    isLocating
  };
};
