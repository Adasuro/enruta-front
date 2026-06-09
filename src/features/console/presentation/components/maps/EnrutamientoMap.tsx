import React, { useMemo } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { MapPin, CircleDot } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { type Point, type RouteResult } from '../../../services/routeService';

interface EnrutamientoMapProps {
  origin: Point | null;
  destination: Point | null;
  onMapClick: (point: Point) => void;
  onMarkerDrag: (type: 'origin' | 'destination', point: Point) => void;
  selectedRoute: RouteResult | null;
}

// Componentes de Marcador Personalizados
const OriginMarker = () => (
  <div className="custom-marker origin-marker">
    <CircleDot size={20} strokeWidth={2.5} />
  </div>
);

const DestinationMarker = () => (
  <div className="custom-marker destination-marker">
    <MapPin size={20} strokeWidth={2.5} />
  </div>
);


export const EnrutamientoMap: React.FC<EnrutamientoMapProps> = ({
  origin,
  destination,
  onMapClick,
  onMarkerDrag,
  selectedRoute
}) => {
  const initialViewState = {
    longitude: -75.2048,
    latitude: -12.0651,
    zoom: 14
  };

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat;
    onMapClick({ lat, lng });
  };

  const geojsonRoute = useMemo(() => {
    if (!selectedRoute) return null;
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: selectedRoute.path_geojson
    };
  }, [selectedRoute]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
      <Map
        initialViewState={initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        onClick={handleMapClick}
        cursor="crosshair"
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />

        {/* Render Selected Route Path */}
        {geojsonRoute && (
          <Source id="selected-route-source" type="geojson" data={geojsonRoute}>
            <Layer
              id="selected-route-line"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': selectedRoute?.color_primary || '#0b62a0',
                'line-width': 6,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}

        {/* Origin Marker */}
        {origin && (
          <Marker
            longitude={origin.lng}
            latitude={origin.lat}
            anchor="center"
            draggable
            onDragEnd={(e) => onMarkerDrag('origin', { lat: e.lngLat.lat, lng: e.lngLat.lng })}
          >
            <OriginMarker />
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker
            longitude={destination.lng}
            latitude={destination.lat}
            anchor="center"
            draggable
            onDragEnd={(e) => onMarkerDrag('destination', { lat: e.lngLat.lat, lng: e.lngLat.lng })}
          >
            <DestinationMarker />
          </Marker>
        )}
      </Map>

      <style>{`
        .custom-marker {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.1);
          cursor: grab;
          transition: transform 0.1s ease-in-out;
        }
        .custom-marker:active {
          cursor: grabbing;
          transform: scale(1.1);
        }
        .origin-marker {
          border: 3px solid var(--color-success-500);
          color: var(--color-success-500);
        }
        .destination-marker {
          border: 3px solid var(--color-danger-500);
          color: var(--color-danger-500);
        }
      `}</style>
    </div>
  );
};
