import React, { useMemo } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { MapPin, CircleDot } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { type Journey } from '../../../features/console/services/routeService';

interface Point {
  lat: number;
  lng: number;
}

interface RoutingMapProps {
  origin: Point | null;
  destination: Point | null;
  onMapClick: (point: Point) => void;
  onMarkerDrag: (type: 'origin' | 'destination', point: Point) => void;
  selectedRoute: Journey | null;
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

  const walkFeatures = useMemo(() => {
    if (!selectedRoute) return null;
    const walkSteps = selectedRoute.steps.filter(s => s.type === 'WALK');
    if (walkSteps.length === 0) return null;

    return {
      type: 'FeatureCollection' as const,
      features: walkSteps.map(step => ({
        type: 'Feature' as const,
        properties: {},
        geometry: step.geometry
      }))
    };
  }, [selectedRoute]);

  const transitFeature = useMemo(() => {
    if (!selectedRoute) return null;
    const transitStep = selectedRoute.steps.find(s => s.type === 'TRANSIT');
    if (!transitStep) return null;

    return {
      type: 'Feature' as const,
      properties: {
        color: transitStep.route_info?.color_primary || 'var(--brand-primary)'
      },
      geometry: transitStep.geometry
    };
  }, [selectedRoute]);

  const transitColor = selectedRoute?.steps.find(s => s.type === 'TRANSIT')?.route_info?.color_primary || 'var(--brand-primary)';

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

        {/* Capa Caminata (Línea punteada azul) */}
        {walkFeatures && (
          <Source id="walk-source" type="geojson" data={walkFeatures}>
            <Layer
              id="walk-line"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': '#3B82F6', // Azul claro para caminar
                'line-width': 4,
                'line-dasharray': [1, 2], // Punteado
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}

        {/* Capa Tránsito (Línea continua gruesa) */}
        {transitFeature && (
          <Source id="transit-source" type="geojson" data={transitFeature}>
            {/* Sombra o borde blanco para contrastar */}
            <Layer
              id="transit-line-bg"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': '#FFFFFF',
                'line-width': 8,
                'line-opacity': 0.9
              }}
            />
            {/* Color del letrero de la ruta */}
            <Layer
              id="transit-line"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': transitColor,
                'line-width': 5,
                'line-opacity': 1
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
