import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { routeService, type Point, type RoutingResult } from '../services/routeService';
import { useNotification } from '../../../hooks/useNotification';

export interface SavedSearch {
    id: string;
    origin: Point;
    originName: string;
    destination: Point;
    destinationName: string;
    timestamp: number;
}

export const useEnrutamiento = () => {
  const [origin, setOrigin] = useState<Point | null>(null);
  const [destination, setDestination] = useState<Point | null>(null);
  const [originName, setOriginName] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RoutingResult | null>(null);
  const [radiusMsg, setRadiusMsg] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  
  // New States: Locking and History
  const [isLocked, setIsLocked] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SavedSearch[]>([]);

  const { info, warning, error: notifyError } = useNotification();

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('enruta_history');
    if (saved) {
        try {
            setRecentSearches(JSON.parse(saved));
        } catch {
            localStorage.removeItem('enruta_history');
        }
    }
  }, []);

  const saveToHistory = useCallback((origin: Point, originName: string, dest: Point, destName: string) => {
    const newSearch: SavedSearch = {
        id: crypto.randomUUID(),
        origin,
        originName,
        destination: dest,
        destinationName: destName,
        timestamp: Date.now()
    };
    
    setRecentSearches(prev => {
        const filtered = prev.filter(s => s.originName !== originName || s.destinationName !== destName);
        const updated = [newSearch, ...filtered].slice(0, 5); // Keep last 5
        localStorage.setItem('enruta_history', JSON.stringify(updated));
        return updated;
    });
  }, []);

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
    if (isLocked) {
        info('Desbloquea el mapa para cambiar tu ubicación.', 'Mapa Bloqueado');
        return;
    }

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
  }, [updateOriginFromCoords, info, warning, notifyError, isLocked]);

  const clearLocation = useCallback((type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setOrigin(null);
      setOriginName('');
    } else {
      setDestination(null);
      setDestinationName('');
    }
    setSearchResults(null);
    setIsLocked(false);
  }, []);

  const loadFromHistory = useCallback((saved: SavedSearch) => {
      setOrigin(saved.origin);
      setOriginName(saved.originName);
      setDestination(saved.destination);
      setDestinationName(saved.destinationName);
      setSearchResults(null);
      setIsLocked(false);
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
          // Auto-lock when results found to allow "Following"
          setIsLocked(true);
          saveToHistory(origin, originName, destination, destinationName);
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
  }, [origin, destination, originName, destinationName, saveToHistory]);

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
    isLocating,
    isLocked,
    setIsLocked,
    recentSearches,
    loadFromHistory
  };
};
