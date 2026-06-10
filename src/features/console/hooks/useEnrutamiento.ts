import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { routeService, type Point, type RoutingResult } from '../services/routeService';

export const useEnrutamiento = () => {
  const [origin, setOrigin] = useState<Point | null>(null);
  const [destination, setDestination] = useState<Point | null>(null);
  const [originName, setOriginName] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RoutingResult | null>(null);
  const [radiusMsg, setRadiusMsg] = useState('');

  // Reverse Geocoding
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
      return res.data.display_name;
    } catch (err) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Initial Geolocation
    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setOrigin(p);
            const name = await fetchAddress(p.lat, p.lng);
            setOriginName(name);
          },
          () => console.warn("Geolocation error"),
          { enableHighAccuracy: true }
        );
      }
    }, []);

    const useCurrentLocation = useCallback(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setOrigin(p);
            setOriginName('Mi ubicación actual');
            const name = await fetchAddress(p.lat, p.lng);
            setOriginName(name);
          },
          () => console.warn("Geolocation error"),
          { enableHighAccuracy: true }
        );
      }
    }, []);

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
    
    // Simular el cambio de mensaje por radio
    const steps = [20, 50, 100, 200, 300];
    for (const r of steps) {
      setRadiusMsg(`Buscando rutas a ${r}m...`);
      
      try {
        const result = await routeService.searchRoutes(origin, destination, r);
        if (result.results.length > 0) {
          setSearchResults(result);
          setIsSearching(false);
          return;
        }
      } catch {
        console.error("Search error");
      }
      // Pequeño delay para que el usuario vea el escaneo de radios
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    setIsSearching(false);
    setSearchResults({ radius_reached: 300, results: [] }); // Empty results instead of null
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
    clearLocation
  };
};





