import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Map, { Source, Layer, Marker, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { Undo2, Trash2 } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Point {
  lat: number;
  lng: number;
}

interface RouteCreatorMapProps {
  points: Point[];
  onPointsChange: (points: Point[]) => void;
  onRouteCalculated?: (densePoints: Point[]) => void;
  routeColor: string;
}

export const RouteCreatorMap: React.FC<RouteCreatorMapProps> = ({ 
  points, 
  onPointsChange,
  onRouteCalculated,
  routeColor 
}) => {
  const [routeSegments, setRouteSegments] = useState<Point[][]>([]);

  const initialViewState = {
    longitude: -75.2048,
    latitude: -12.0651,
    zoom: 14
  };

  const fetchRouteSegment = useCallback(async (start: Point, end: Point) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&overview=full`
      );
      const data = await response.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates;
        return coords.map((c: number[]) => ({ lng: c[0], lat: c[1] }));
      }
    } catch (error) {
      console.error("Error fetching OSRM route:", error);
    }
    return [start, end];
  }, []);

  useEffect(() => {
    // Caso: No hay puntos
    if (points.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRouteSegments(prev => prev.length > 0 ? [] : prev);
      onRouteCalculated?.([]);
      return;
    }

    // Caso: Solo un punto (inicio)
    if (points.length === 1) {
      if (routeSegments.length > 0) {
        setRouteSegments([]);
      }
      onRouteCalculated?.([points[0]]);
      return;
    }

    // Si añadimos un punto nuevo (basado en la longitud)
    if (points.length - 1 > routeSegments.length) {
      const start = points[points.length - 2];
      const end = points[points.length - 1];
      
      fetchRouteSegment(start, end).then(newSegment => {
        setRouteSegments(prev => {
          const updated = [...prev, newSegment];
          onRouteCalculated?.(updated.flat());
          return updated;
        });
      });
    } 
    // Si eliminamos puntos (Undo)
    else if (points.length - 1 < routeSegments.length) {
      const updated = routeSegments.slice(0, points.length - 1);
      setRouteSegments(updated);
      onRouteCalculated?.(updated.length > 0 ? updated.flat() : [points[0]]);
    }
  }, [points, fetchRouteSegment, onRouteCalculated, routeSegments.length]);

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat;
    onPointsChange([...points, { lat, lng }]);
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (points.length > 0) {
      onPointsChange(points.slice(0, -1));
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPointsChange([]);
  };

  const geojsonLine = useMemo(() => ({
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: routeSegments.flat().map(p => [p.lng, p.lat])
    }
  }), [routeSegments]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        display: 'flex',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <button 
          onClick={handleUndo} 
          disabled={points.length === 0}
          title="Deshacer último punto"
          style={{
            background: 'white', border: '1px solid var(--color-gray-300)', borderRadius: '4px',
            padding: '6px 12px', cursor: points.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          <Undo2 size={16} />
        </button>
        <button 
          onClick={handleClear} 
          disabled={points.length === 0}
          title="Borrar trazado"
          style={{
            background: 'white', border: '1px solid var(--color-danger)', borderRadius: '4px',
            padding: '6px 12px', cursor: points.length === 0 ? 'not-allowed' : 'pointer',
            color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <Map
        initialViewState={initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        onClick={handleMapClick}
        interactiveLayerIds={['route-line']}
        cursor="crosshair"
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />

        {routeSegments.length > 0 && (
          <Source id="route-source" type="geojson" data={geojsonLine}>
            <Layer 
              id="route-line"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': routeColor,
                'line-width': 5,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}

        {points.map((point, index) => (
          <Marker 
            key={`marker-${index}`}
            longitude={point.lng} 
            latitude={point.lat} 
            anchor="center"
          >
            <div style={{
              width: '12px', height: '12px', 
              background: index === 0 ? 'var(--color-success)' : (index === points.length - 1 ? routeColor : 'white'), 
              border: `2px solid ${index === 0 || index === points.length - 1 ? 'white' : routeColor}`, 
              borderRadius: '50%',
              boxShadow: '0 0 4px rgba(0,0,0,0.3)',
              cursor: 'pointer'
            }} />
          </Marker>
        ))}
      </Map>
    </div>
  );
};
