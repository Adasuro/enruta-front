import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { MAP_CONFIG } from '../config/mapConfig';

export function useMaplibreGL(containerId: string) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (mapRef.current) return;

    // MapLibre uses [lng, lat] for center
    const centerLngLat: [number, number] = [MAP_CONFIG.huancayo.center[1], MAP_CONFIG.huancayo.center[0]];

    const newMap = new maplibregl.Map({
      container: containerId,
      style: MAP_CONFIG.maplibre.style,
      center: centerLngLat,
      zoom: MAP_CONFIG.huancayo.zoom,
      attributionControl: false
    });
    
    mapRef.current = newMap;
    setMap(newMap);

    newMap.addControl(new maplibregl.AttributionControl({
      customAttribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }), 'bottom-right');

    newMap.on('load', () => {
      console.log('[Maplibre] Map loaded');
      setIsReady(true);
    });

    newMap.on('error', (e) => {
      console.error('[Maplibre] Error:', e.error?.message);
    });

    // Cleanup function intentionally empty for React StrictMode compatibility during development
    return () => {};
  }, [containerId]);

  return { map, isReady };
}

