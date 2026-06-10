import React, { useMemo } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { MapPin, CircleDot } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Point {
  lat: number;
  lng: number;
}

interface RoutingMapProps {
  origin: Point | null;
  destination: Point | null;
  onMapClick: (point: Point) => void;
  onMarkerDrag: (type: 'origin' | 'destination', point: Point) => void;
  selectedRoute: {
    color_primary: string;
    path_geojson: any;
  } | null;
}

const OriginMarker = () => (
  <div className="ui-map-marker ui-map-marker--origin">
    <CircleDot size={20} strokeWidth={2.5} />
  </div>
);

const DestinationMarker = () => (
  <div className="ui-map-marker ui-map-marker--destination">
    <MapPin size={20} strokeWidth={2.5} />
  </div>
);

export const RoutingMap: React.FC<RoutingMapProps> = ({
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
    if (!selectedRoute?.path_geojson) return null;
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: selectedRoute.path_geojson
    };
  }, [selectedRoute]);

  return (
    <div className="ui-routing-map-container">
      <Map
        initialViewState={initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        onClick={handleMapClick}
        cursor="crosshair"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />

        {geojsonRoute && (
          <Source id="selected-route-source" type="geojson" data={geojsonRoute}>
            <Layer
              id="selected-route-line"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': selectedRoute?.color_primary || 'var(--brand-primary)',
                'line-width': 6,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}

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
    </div>
  );
};
