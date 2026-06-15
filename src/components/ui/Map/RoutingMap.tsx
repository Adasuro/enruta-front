import React, { useMemo, useRef, useEffect, useState } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, type MapRef } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { MapPin, CircleDot, ArrowUpCircle, LogOut, Crosshair, Target, Flag, Bus, Lock, Unlock } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { type Journey } from '../../../features/console/services/routeService';
import { VehicleGalleryModal } from '../../domain/VehicleGalleryModal';

interface Point {
  lat: number;
  lng: number;
}

interface RoutingMapProps {
  origin: Point | null;
  destination: Point | null;
  onMapClick: (point: Point) => void;
  onMarkerDrag: (type: 'origin' | 'destination', point: Point) => void;
  onLocateMe: () => void;
  isLocating?: boolean;
  selectedRoute: Journey | null;
  isLocked?: boolean;
  onToggleLock?: () => void;
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

const BoardingMarker = ({ color }: { color: string }) => (
    <div className="flex flex-col items-center animate-bounce">
        <div className="bg-white p-1 rounded-full shadow-md border-2" style={{ borderColor: color }}>
            <ArrowUpCircle size={20} style={{ color }} strokeWidth={3} />
        </div>
        <div className="w-1 h-2 bg-gray-400" />
    </div>
);

const ExitMarker = () => (
    <div className="flex flex-col items-center">
        <div className="bg-white p-1 rounded-full shadow-md border-2 border-danger-500">
            <LogOut size={20} className="text-danger-500" strokeWidth={3} />
        </div>
        <div className="w-1 h-2 bg-gray-400" />
    </div>
);

export const RoutingMap: React.FC<RoutingMapProps> = ({
  origin,
  destination,
  onMapClick,
  onMarkerDrag,
  onLocateMe,
  isLocating = false,
  selectedRoute,
  isLocked = false,
  onToggleLock
}) => {
  const mapRef = useRef<MapRef>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const initialViewState = {
    longitude: -75.2048,
    latitude: -12.0651,
    zoom: 14
  };

  // Auto-center when origin or destination changes
  useEffect(() => {
    if (origin && !selectedRoute && mapRef.current) {
        mapRef.current.flyTo({ 
          center: [origin.lng, origin.lat], 
          zoom: 16, 
          duration: 1500,
          essential: true
        });
    }
  }, [origin, selectedRoute]);

  // Fit bounds when a route is selected
  useEffect(() => {
    if (selectedRoute && mapRef.current) {
        const transitStep = selectedRoute.steps.find(s => s.type === 'TRANSIT');
        if (transitStep) {
            const coords = transitStep.geometry.coordinates;
            const lats = coords.map(c => c[1]);
            const lngs = coords.map(c => c[0]);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);
            
            mapRef.current.fitBounds(
                [[minLng, minLat], [maxLng, maxLat]],
                { 
                  padding: { top: 80, bottom: window.innerWidth < 768 ? 350 : 80, left: 80, right: window.innerWidth < 768 ? 80 : 450 }, 
                  duration: 2000,
                  essential: true
                }
            );
        }
    }
  }, [selectedRoute]);

  const handleGoToOrigin = () => {
      if (!origin) return;
      mapRef.current?.flyTo({ center: [origin.lng, origin.lat], zoom: 16, duration: 1000 });
  };

  const handleGoToDestination = () => {
      if (!destination) return;
      mapRef.current?.flyTo({ center: [destination.lng, destination.lat], zoom: 16, duration: 1000 });
  };

  const handleMapClick = (event: MapLayerMouseEvent) => {
    if (isLocked) return;
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

  const transitStep = selectedRoute?.steps.find(s => s.type === 'TRANSIT');
  const transitColor = transitStep?.route_info?.color_primary || 'var(--brand-primary)';
  
  const boardingCoords = useMemo(() => {
    const transit = selectedRoute?.steps.find(s => s.type === 'TRANSIT');
    if (!transit) return null;
    const coords = transit.geometry.coordinates;
    return coords[0];
  }, [selectedRoute]);

  const exitCoords = useMemo(() => {
    const transit = selectedRoute?.steps.find(s => s.type === 'TRANSIT');
    if (!transit) return null;
    const coords = transit.geometry.coordinates;
    return coords[coords.length - 1];
  }, [selectedRoute]);

  return (
    <div className="ui-routing-map-container relative h-full w-full">
      {/* Tactical Map Actions */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
          {/* Custom GPS Button */}
          <button 
            onClick={onLocateMe}
            disabled={isLocating}
            className={`w-12 h-12 rounded-2xl bg-white border-2 flex items-center justify-center shadow-xl transition-all duration-300 ${
                isLocating ? 'border-primary-500 text-primary-500 animate-pulse' : 'border-gray-100 text-gray-700 hover:scale-105 active:scale-95'
            }`}
            title="Mi ubicación real"
          >
              <Crosshair size={24} className={isLocating ? 'animate-spin' : ''} />
          </button>

          {/* Quick Snap: Origin */}
          {origin && (
            <button 
                onClick={handleGoToOrigin}
                className="w-12 h-12 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center text-success-500 shadow-xl hover:scale-105 active:scale-95 transition-all"
                title="Ir al Origen"
            >
                <Target size={24} />
            </button>
          )}

          {/* Quick Snap: Destination */}
          {destination && (
            <button 
                onClick={handleGoToDestination}
                className="w-12 h-12 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center text-danger-500 shadow-xl hover:scale-105 active:scale-95 transition-all"
                title="Ir al Destino"
            >
                <Flag size={24} />
            </button>
          )}

          {/* Bus Reference Overlay Trigger */}
          {selectedRoute && (
            <button 
                onClick={() => setIsGalleryOpen(true)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95`}
                style={{ backgroundColor: transitColor }}
                title="Ver referencias del bus"
            >
                <Bus size={24} />
            </button>
          )}

          {/* Map Lock Toggle */}
          {onToggleLock && (origin || destination) && (
              <button 
                  onClick={onToggleLock}
                  className={`w-12 h-12 rounded-2xl bg-white border-2 flex items-center justify-center shadow-xl transition-all duration-300 ${
                      isLocked ? 'border-warning-500 text-warning-500' : 'border-gray-100 text-gray-400 hover:text-gray-900'
                  }`}
                  title={isLocked ? "Mapa bloqueado (Seguimiento)" : "Mapa libre"}
              >
                  {isLocked ? <Lock size={22} /> : <Unlock size={22} />}
              </button>
          )}
      </div>

      {/* Vehicle Gallery Modal */}
      {transitStep && (
          <VehicleGalleryModal 
            isOpen={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            routeName={transitStep.route_info?.name || null}
            visualCode={transitStep.route_info?.visual_code || '---'}
            color={transitColor}
            references={transitStep.vehicle_references || []}
          />
      )}

      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        onClick={handleMapClick}
        cursor={isLocked ? "default" : "crosshair"}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />

        {/* Capa Caminata (Línea punteada azul) */}
        {walkFeatures && (
          <Source id="walk-source" type="geojson" data={walkFeatures}>
            <Layer
              id="walk-line"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': '#3B82F6', 
                'line-width': 4,
                'line-dasharray': [1, 2], 
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}

        {/* Capa Tránsito (Línea continua gruesa) */}
        {transitFeature && (
          <Source id="transit-source" type="geojson" data={transitFeature}>
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
            {/* Arrows for direction */}
            <Layer 
              id="transit-arrows"
              type="symbol"
              layout={{
                  'symbol-placement': 'line',
                  'symbol-spacing': 100,
                  'text-field': '▶',
                  'text-size': 12,
                  'text-keep-upright': false,
                  'text-allow-overlap': true,
                  'text-ignore-placement': true
              }}
              paint={{
                  'text-color': '#FFFFFF',
                  'text-halo-color': transitColor,
                  'text-halo-width': 1
              }}
            />
          </Source>
        )}

        {origin && (
          <Marker
            longitude={origin.lng}
            latitude={origin.lat}
            anchor="center"
            draggable={!isLocked}
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
            draggable={!isLocked}
            onDragEnd={(e) => onMarkerDrag('destination', { lat: e.lngLat.lat, lng: e.lngLat.lng })}
          >
            <DestinationMarker />
          </Marker>
        )}

        {/* Itinerary Markers */}
        {boardingCoords && (
            <Marker longitude={boardingCoords[0]} latitude={boardingCoords[1]} anchor="bottom">
                <BoardingMarker color={transitColor} />
            </Marker>
        )}

        {exitCoords && (
            <Marker longitude={exitCoords[0]} latitude={exitCoords[1]} anchor="bottom">
                <ExitMarker />
            </Marker>
        )}
      </Map>

      <style>{`
        .animate-spin-slow {
            animation: spin 3s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
