import React, { useMemo } from 'react';
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Point {
  lat: number;
  lng: number;
}

interface Stop {
  id?: string;
  name: string;
  is_terminal: boolean;
  location: {
    coordinates: [number, number]; // [lng, lat]
  };
}

interface RouteDetailMapProps {
  points: Point[];
  stops?: Stop[];
  routeColor: string;
}

export const RouteDetailMap: React.FC<RouteDetailMapProps> = ({ 
  points, 
  stops = [],
  routeColor 
}) => {

  // Calcular el centro del mapa basado en los puntos
  const bounds = useMemo(() => {
    if (points.length === 0) return null;
    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);
    return {
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
        minLng: Math.min(...lngs),
        maxLng: Math.max(...lngs),
    };
  }, [points]);

  const initialViewState = {
    longitude: bounds ? (bounds.minLng + bounds.maxLng) / 2 : -75.2048,
    latitude: bounds ? (bounds.minLat + bounds.maxLat) / 2 : -12.0651,
    zoom: 14
  };

  const geojsonLine = useMemo(() => ({
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: points.map(p => [p.lng, p.lat])
    }
  }), [points]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <Map
        initialViewState={initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        interactive={true}
      >
        <NavigationControl position="bottom-right" />

        {points.length >= 2 && (
          <Source id="route-preview-source" type="geojson" data={geojsonLine}>
            <Layer 
              id="route-preview-line"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': routeColor,
                'line-width': 5,
                'line-opacity': 0.9
              }}
            />
          </Source>
        )}

        {/* Marcadores de Paraderos/Terminales */}
        {stops.map((stop, index) => (
          <Marker 
            key={stop.id || index}
            longitude={stop.location.coordinates[0]} 
            latitude={stop.location.coordinates[1]} 
            anchor="bottom"
          >
            <div style={{
              width: stop.is_terminal ? '16px' : '10px',
              height: stop.is_terminal ? '16px' : '10px',
              background: stop.is_terminal ? routeColor : 'white',
              border: `2px solid ${stop.is_terminal ? 'white' : routeColor}`,
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              cursor: 'help'
            }} title={stop.name} />
          </Marker>
        ))}
      </Map>
    </div>
  );
};
