import React, { useMemo } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { MapPin, Navigation } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { type Point, type RouteResult } from '../../../services/routeService';

interface EnrutamientoMapProps {
  origin: Point | null;
  destination: Point | null;
  onMapClick: (point: Point) => void;
  onMarkerDrag: (type: 'origin' | 'destination', point: Point) => void;
  selectedRoute: RouteResult | null;
}

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
            anchor="bottom"
            draggable
            onDragEnd={(e) => onMarkerDrag('origin', { lat: e.lngLat.lat, lng: e.lngLat.lng })}
          >
            <div className="marker-origin">
              <Navigation size={24} color="#10b981" fill="#10b981" style={{ transform: 'rotate(45deg)' }} />
              <div className="marker-label">Origen</div>
            </div>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker
            longitude={destination.lng}
            latitude={destination.lat}
            anchor="bottom"
            draggable
            onDragEnd={(e) => onMarkerDrag('destination', { lat: e.lngLat.lat, lng: e.lngLat.lng })}
          >
            <div className="marker-destination">
              <MapPin size={32} color="#d81020" fill="#d81020" />
              <div className="marker-label">Destino</div>
            </div>
          </Marker>
        )}
      </Map>

      <style>{`
        .marker-origin, .marker-destination {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: grab;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
        .marker-origin:active, .marker-destination:active {
          cursor: grabbing;
        }
        .marker-label {
          background: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          margin-top: 2px;
          border: 1px solid var(--color-border-default);
          color: var(--color-text-heading);
        }
      `}</style>
    </div>
  );
};
