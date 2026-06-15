import React, { useMemo, useRef, useEffect, useState } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, type MapRef } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { MapPin, CircleDot, ArrowUpCircle, LogOut, Crosshair, Target, Flag, Bus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../../hooks/useNotification';
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
  onGeolocate: (point: Point) => void;
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
  onGeolocate,
  selectedRoute
}) => {
  const mapRef = useRef<MapRef>(null);
  const { warning, error: notifyError, info } = useNotification();
  const [isLocating, setIsLocating] = useState(false);
  const [showVehicleOverlay, setShowVehicleOverlay] = useState(false);

  const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

  const initialViewState = {
    longitude: -75.2048,
    latitude: -12.0651,
    zoom: 14
  };

  // Auto-center when origin or destination changes manually
  useEffect(() => {
    if (origin && !selectedRoute && mapRef.current) {
        mapRef.current.flyTo({ 
          center: [origin.lng, origin.lat], 
          zoom: 15, 
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

  const handleCustomGeolocate = () => {
      if (!navigator.geolocation) {
          notifyError('Tu navegador no soporta geolocalización.');
          return;
      }

      setIsLocating(true);
      info('Obteniendo tu posición GPS...', 'Ubicación');

      const options = {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
      };

      const success = (pos: GeolocationPosition) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          onGeolocate(p);
          mapRef.current?.flyTo({ center: [p.lng, p.lat], zoom: 16, duration: 1500 });
          setIsLocating(false);
          info('Ubicación obtenida con éxito.', 'GPS');
      };

      const failure = (err: GeolocationPositionError) => {
          console.warn(`GPS Attempt failed (Code ${err.code}): ${err.message}`);
          
          // Fallback: If High Accuracy failed due to timeout, try once more with low accuracy
          if (err.code === 3 && options.enableHighAccuracy) {
              info('GPS lento, reintentando con precisión básica...', 'Ubicación');
              navigator.geolocation.getCurrentPosition(success, (err2) => {
                  console.error("GPS Final Error:", err2);
                  setIsLocating(false);
                  notifyError('Tiempo de espera agotado. Revisa si el GPS de tu equipo está activo.');
              }, { ...options, enableHighAccuracy: false, timeout: 10000 });
              return;
          }

          setIsLocating(false);
          if (err.code === 1) {
              warning('Permiso denegado. Activa la ubicación en tu navegador y sistema operativo.', 'GPS Bloqueado');
          } else if (err.code === 2) {
              notifyError('Posición no disponible. Asegúrate de tener señal o WiFi.');
          } else {
              notifyError('No se pudo obtener tu ubicación.');
          }
      };

      navigator.geolocation.getCurrentPosition(success, failure, options);
  };

  const handleGoToOrigin = () => {
      if (!origin) return;
      mapRef.current?.flyTo({ center: [origin.lng, origin.lat], zoom: 16, duration: 1000 });
  };

  const handleGoToDestination = () => {
      if (!destination) return;
      mapRef.current?.flyTo({ center: [destination.lng, destination.lat], zoom: 16, duration: 1000 });
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
            onClick={handleCustomGeolocate}
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
                onClick={() => setShowVehicleOverlay(!showVehicleOverlay)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-300 ${
                    showVehicleOverlay ? 'scale-110 ring-4 ring-white/50' : 'hover:scale-105 active:scale-95'
                }`}
                style={{ backgroundColor: transitColor }}
                title="Ver referencias del bus"
            >
                <Bus size={24} />
            </button>
          )}
      </div>

      {/* Vehicle Photos Overlay */}
      <AnimatePresence>
        {showVehicleOverlay && selectedRoute && (
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-4 right-20 z-50 flex flex-col gap-3 pointer-events-none"
            >
                {selectedRoute.steps.find(s => s.type === 'TRANSIT')?.vehicle_references?.map((veh, i) => (
                    <motion.div 
                        key={i}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border-2 border-white pointer-events-auto flex flex-col gap-2"
                    >
                        {veh.photo_sign_url && (
                            <div className="w-48 h-32 rounded-xl overflow-hidden relative shadow-inner">
                                <img src={`${STORAGE_URL}/${veh.photo_sign_url}`} alt="Letrero" className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm">
                                    <span className="text-[0.625rem] font-black text-white uppercase tracking-tighter">Letrero Actual</span>
                                </div>
                            </div>
                        )}
                        {veh.photo_front_url && (
                            <div className="w-48 h-32 rounded-xl overflow-hidden relative shadow-inner">
                                <img src={`${STORAGE_URL}/${veh.photo_front_url}`} alt="Unidad" className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm">
                                    <span className="text-[0.625rem] font-black text-white uppercase tracking-tighter">Vista Frontal</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </motion.div>
        )}
      </AnimatePresence>

      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        onClick={handleMapClick}
        cursor="crosshair"
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
