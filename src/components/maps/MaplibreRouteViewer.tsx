import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMaplibreGL } from '../../hooks/useMaplibreGL';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface Route {
  id: string;
  visual_code: string;
  display_name: string;
  color_primary: string;
  path_geojson: GeoJSON.Feature;
  boarding_stop: { lat: number; lng: number; name: string };
  fare: { amount: number; currency: string };
}

interface Props {
  searchResults: Route[];
  selectedRoute: Route | null;
  onSelectRoute: (route: Route) => void;
}

export function MaplibreRouteViewer({ searchResults, selectedRoute, onSelectRoute }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { map, isReady } = useMaplibreGL('maplibre-container');
  const addedSourcesRef = useRef<Set<string>>(new Set());
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!map || !isReady) return;

    // Limpiar capas anteriores
    addedSourcesRef.current.forEach((sourceId) => {
      if (map.getLayer(`route-line-${sourceId}`)) {
        map.removeLayer(`route-line-${sourceId}`);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    });

    const newSources = new Set<string>();

    // Agregar todas las rutas
    searchResults.forEach((route) => {
      const sourceId = `route-${route.id}`;
      newSources.add(sourceId);

      map.addSource(sourceId, {
        type: 'geojson',
        data: route.path_geojson,
      });

      map.addLayer({
        id: `route-line-${sourceId}`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': route.color_primary,
          'line-width': selectedRoute?.id === route.id ? 6 : 3,
          'line-opacity': selectedRoute?.id === route.id ? 1 : 0.5,
        },
      });

      const clickHandler = () => onSelectRoute(route);
      map.on('click', `route-line-${sourceId}`, clickHandler);

      // Cursor interaction
      map.on('mouseenter', `route-line-${sourceId}`, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', `route-line-${sourceId}`, () => {
        map.getCanvas().style.cursor = '';
      });
    });

    addedSourcesRef.current = newSources;
  }, [map, isReady, searchResults, selectedRoute, onSelectRoute]);

  // Marcador de paradero
  useEffect(() => {
    if (!map || !isReady || !selectedRoute) return;

    // Cleanup old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const el = document.createElement('div');
    el.className = 'maplibre-boarding-marker';
    el.style.backgroundColor = selectedRoute.color_primary;
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    el.title = selectedRoute.boarding_stop.name;

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([selectedRoute.boarding_stop.lng, selectedRoute.boarding_stop.lat])
      .addTo(map);

    markersRef.current.push(marker);

    // Center map on boarding stop or fit bounds
    map.flyTo({
      center: [selectedRoute.boarding_stop.lng, selectedRoute.boarding_stop.lat],
      zoom: 15,
      essential: true
    });

  }, [map, isReady, selectedRoute]);

  return (
    <div
      id="maplibre-container"
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        zIndex: 1
      }}
    />
  );
}

