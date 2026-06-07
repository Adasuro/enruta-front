import { MapContainer, TileLayer, useMap, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { LocateFixed } from 'lucide-react';
import useGeolocation from '../hooks/useGeolocation';
import { COLORS } from '../constants/colors';

// Configuración de niveles de zoom
const ZOOM_LEVELS = {
  CITY: 13,      // Vista amplia de la ciudad
  STREET: 18,    // Máximo detalle de calles y nombres
};

/**
 * Componente interno para manejar acciones directas sobre el mapa de Leaflet
 */
const MapController = ({ userLocation, shouldFocus }: { userLocation: [number, number] | null, shouldFocus: boolean }) => {
  const map = useMap();

  useEffect(() => {
    if (shouldFocus && userLocation) {
      map.flyTo(userLocation, ZOOM_LEVELS.STREET, {
        animate: true,
        duration: 1.5
      });
    }
  }, [shouldFocus, userLocation, map]);

  return null;
};

const MapView = () => {
  const { location, getPosition } = useGeolocation();
  const [shouldFocus, setShouldFocus] = useState(false);

  const handleLocationClick = () => {
    setShouldFocus(true);
    getPosition();
    setTimeout(() => setShouldFocus(false), 2000);
  };

  const userPosition: [number, number] | null = location.coordinates 
    ? [location.coordinates.lat, location.coordinates.lng] 
    : null;

  const defaultCenter: [number, number] = [-12.068, -75.210];

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      
      {/* Botón Flotante de Ubicación */}
      <button 
        onClick={handleLocationClick}
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: 'white',
          border: 'none',
          borderRadius: '12px',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.brand.primary,
          transition: 'all 0.2s ease'
        }}
        className="control-button"
        title="Centrar en mi ubicación"
      >
        <LocateFixed size={24} strokeWidth={2.5} />
      </button>

      <MapContainer 
        center={defaultCenter} 
        zoom={ZOOM_LEVELS.CITY} 
        minZoom={12} // Evita alejarse demasiado
        maxZoom={18} // Límite estricto para evitar que el mapa desaparezca (blanco)
        scrollWheelZoom={true} 
        zoomControl={false}
        style={{ height: '100%', width: '100%', background: COLORS.brand.background }}
      >
        <MapController userLocation={userPosition} shouldFocus={shouldFocus} />
        
        {/* Capa Base (Calles y Geometría) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
        />

        {/* Capa de Etiquetas de Alta Densidad (Nombres de calles siempre arriba) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
          pane="shadowPane" // Forzamos que las etiquetas tengan su propio contexto de renderizado
        />

        {userPosition && (
          <CircleMarker 
            center={userPosition}
            radius={8}
            pathOptions={{
              fillColor: COLORS.brand.accent,
              fillOpacity: 0.9,
              color: 'white',
              weight: 3
            }}
          >
            <Popup>Estás aquí</Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
