import React, { useState, useEffect, useMemo } from 'react';
import Map, { Source, Layer, Marker, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { Undo2, Trash2 } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Point {
  lat: number;
  lng: number;
}

interface RouteCreatorMapProps {
  points: Point[]; // Puntos de control (clics del usuario)
  onPointsChange: (points: Point[]) => void;
  onRouteCalculated?: (densePoints: Point[]) => void; // Puntos detallados para guardar
  routeColor: string;
}

export const RouteCreatorMap: React.FC<RouteCreatorMapProps> = ({ 
  points, 
  onPointsChange,
  onRouteCalculated,
  routeColor 
}) => {
  // Estado local para almacenar los segmentos calculados por OSRM
  const [routeSegments, setRouteSegments] = useState<Point[][]>([]);

  // Configuración inicial de la cámara centrada en Huancayo
  const initialViewState = {
    longitude: -75.2048,
    latitude: -12.0651,
    zoom: 14
  };

  // Función para obtener ruta de OSRM
  const fetchRouteSegment = async (start: Point, end: Point) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&overview=full`
      );
      const data = await response.json();
      if (data.code === 'Ok' && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates;
        return coords.map((c: number[]) => ({ lng: c[0], lat: c[1] }));
      }
    } catch (error) {
      console.error("Error fetching OSRM route:", error);
    }
    // Fallback: línea recta si falla OSRM
    return [start, end];
  };

  // Efecto para calcular rutas cuando los puntos cambian
  useEffect(() => {
    if (points.length === 0) {
      setRouteSegments([]);
      if (onRouteCalculated) onRouteCalculated([]);
      return;
    }

    if (points.length === 1) {
      setRouteSegments([]);
      if (onRouteCalculated) onRouteCalculated([points[0]]);
      return;
    }

    // Si añadimos un punto nuevo
    if (points.length - 1 > routeSegments.length) {
      const start = points[points.length - 2];
      const end = points[points.length - 1];
      
      fetchRouteSegment(start, end).then(newSegment => {
        const newSegments = [...routeSegments, newSegment];
        setRouteSegments(newSegments);
        
        // Aplanar los segmentos para enviarlos al padre
        if (onRouteCalculated) {
          const flatPoints = newSegments.flat();
          onRouteCalculated(flatPoints);
        }
      });
    } 
    // Si eliminamos puntos (Undo)
    else if (points.length - 1 < routeSegments.length) {
      const newSegments = routeSegments.slice(0, points.length - 1);
      setRouteSegments(newSegments);
      
      if (onRouteCalculated) {
        const flatPoints = newSegments.flat();
        // Si no hay segmentos, al menos enviar el primer punto
        onRouteCalculated(flatPoints.length > 0 ? flatPoints : [points[0]]);
      }
    }
  }, [points]); // Dependencia clave: points

  // Manejar el clic en el mapa para añadir un punto
  const handleMapClick = (event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat;
    onPointsChange([...points, { lat, lng }]);
  };

  // Deshacer el último punto
  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (points.length > 0) {
      onPointsChange(points.slice(0, -1));
    }
  };

  // Limpiar todo el trazado
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPointsChange([]);
  };

  // Convertir los segmentos aplanados al formato GeoJSON para dibujar
  const geojsonLine = useMemo(() => {
    const flatPoints = routeSegments.flat();
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: flatPoints.map(p => [p.lng, p.lat])
      }
    };
  }, [routeSegments]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
      
      {/* Botones Flotantes de Herramientas */}
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
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={handleUndo} 
          disabled={points.length === 0}
          title="Deshacer último punto"
          style={{
            background: 'white', border: '1px solid #ccc', borderRadius: '4px',
            padding: '6px 12px', cursor: points.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px', opacity: points.length === 0 ? 0.5 : 1
          }}
        >
          <Undo2 size={16} />
        </button>
        <button 
          onClick={handleClear} 
          disabled={points.length === 0}
          title="Borrar trazado"
          style={{
            background: 'white', border: '1px solid #ff4444', borderRadius: '4px',
            padding: '6px 12px', cursor: points.length === 0 ? 'not-allowed' : 'pointer',
            color: '#ff4444', display: 'flex', alignItems: 'center', gap: '4px',
            opacity: points.length === 0 ? 0.5 : 1
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <Map
        initialViewState={initialViewState}
        // mapStyle con nombres de calles y mayor contraste (voyager en lugar de positron-nolabels)
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        onClick={handleMapClick}
        interactiveLayerIds={['route-line']}
        cursor="crosshair"
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />

        {/* Dibujar la polilínea de la ruta calculada */}
        {routeSegments.length > 0 && (
          <Source id="route-source" type="geojson" data={geojsonLine}>
            <Layer 
              id="route-line"
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': routeColor,
                'line-width': 5,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}

        {/* Mostrar marcadores sólo para los PUNTOS DE CONTROL (donde el usuario hizo clic) */}
        {points.map((point, index) => (
          <Marker 
            key={`marker-${index}`}
            longitude={point.lng} 
            latitude={point.lat} 
            anchor="center"
          >
            <div style={{
              width: '12px', height: '12px', 
              background: index === 0 ? '#10b981' : (index === points.length - 1 ? routeColor : 'white'), 
              border: `2px solid ${index === 0 || index === points.length - 1 ? 'white' : routeColor}`, 
              borderRadius: '50%',
              boxShadow: '0 0 4px rgba(0,0,0,0.5)',
              cursor: 'pointer'
            }} />
          </Marker>
        ))}
      </Map>
    </div>
  );
};
