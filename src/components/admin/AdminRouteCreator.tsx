import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useMaplibreGL } from '../../hooks/useMaplibreGL';
import useGeolocation from '../../hooks/useGeolocation';
import { LocateFixed } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

interface RouteSegment {
  controlPoint: [number, number];
  coordinates: [number, number][]; // The path from the previous control point to this one
}

export function AdminRouteCreator() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { map, isReady } = useMaplibreGL('admin-maplibre-container');
  const { location, getPosition } = useGeolocation();
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  
  // States
  const [segments, setSegments] = useState<RouteSegment[]>([]);
  const [visualCode, setVisualCode] = useState('A');
  const [displayName, setDisplayName] = useState('Ruta Principal');
  const [color, setColor] = useState('#ff0000');
  const [fare, setFare] = useState<number>(1.50);
  const [loading, setLoading] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [message, setMessage] = useState('');

  const handleLocationClick = () => {
    getPosition();
    if (location.coordinates && map) {
      map.flyTo({
        center: [location.coordinates.lng, location.coordinates.lat],
        zoom: 16,
        essential: true,
        duration: 1500
      });
    }
  };

  // User location marker effect
  useEffect(() => {
    if (!map || !isReady || !location.coordinates) return;

    const { lat, lng } = location.coordinates;

    if (!userMarkerRef.current) {
      // Create a blue dot for user location
      const el = document.createElement('div');
      el.className = 'user-location-marker';
      el.style.width = '18px';
      el.style.height = '18px';
      el.style.backgroundColor = '#3b82f6'; // Tailwind blue-500
      el.style.border = '3px solid white';
      el.style.borderRadius = '50%';
      el.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.6)';

      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([lng, lat]);
    }
    
    // Do not clean up the marker on every re-render, 
    // it will be reused since we store it in a ref.
  }, [map, isReady, location.coordinates?.lat, location.coordinates?.lng]);

  // Derived state: flat list of all coordinates for the LineString
  const fullRouteCoordinates = segments.flatMap(s => s.coordinates);
  const controlPoints = segments.map(s => s.controlPoint);

  // Helper to fetch route from OSRM
  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&overview=full`
      );
      if (!response.ok) throw new Error('OSRM API error');
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        return data.routes[0].geometry.coordinates as [number, number][];
      }
      // Fallback to straight line if routing fails
      return [start, end];
    } catch (error) {
      console.error('Error fetching route:', error);
      // Fallback to straight line
      return [start, end];
    }
  };

  // Keyboard shortcut for Undo (Ctrl+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        setSegments(prev => prev.length > 0 ? prev.slice(0, -1) : prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle map click
  useEffect(() => {
    if (!map || !isReady) return;

    const handleMapClick = async (e: maplibregl.MapMouseEvent) => {
      // Prevent multiple clicks while routing
      if (isRouting) return;
      
      const { lng, lat } = e.lngLat;
      const newPoint: [number, number] = [lng, lat];

      setIsRouting(true);
      
      setSegments(prev => {
        // If it's the first point, just add it
        if (prev.length === 0) {
          setIsRouting(false);
          return [{ controlPoint: newPoint, coordinates: [newPoint] }];
        }
        return prev; // Return previous state, we will update it after fetch
      });
    };

    map.on('click', handleMapClick);

    // Initial setup of layers for drawing
    if (!map.getSource('trace-source')) {
      map.addSource('trace-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Casing layer (borde más oscuro)
      map.addLayer({
        id: 'trace-line-casing',
        type: 'line',
        source: 'trace-source',
        paint: {
          'line-color': '#000000',
          'line-width': 8,
          'line-opacity': 0.3
        }
      });

      // Line layer principal
      map.addLayer({
        id: 'trace-line',
        type: 'line',
        source: 'trace-source',
        paint: {
          'line-color': color,
          'line-width': 4,
          'line-opacity': 1
        }
      });

      // Points layer (control points only)
      map.addLayer({
        id: 'trace-points',
        type: 'circle',
        source: 'trace-source',
        paint: {
          'circle-radius': 6,
          'circle-color': '#ffffff',
          'circle-stroke-width': 3,
          'circle-stroke-color': color
        }
      });
    }

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, isReady, isRouting, color]);

  // Separate effect to handle the async routing when a new click happens
  // We attach a specific click listener that gets the latest state
  useEffect(() => {
    if (!map || !isReady) return;

    const clickListener = async (e: maplibregl.MapMouseEvent) => {
      if (isRouting) return;
      
      const newPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      
      if (segments.length === 0) {
        setSegments([{ controlPoint: newPoint, coordinates: [newPoint] }]);
        return;
      }

      setIsRouting(true);
      setMessage('Calculando ruta por las calles...');
      
      const lastPoint = segments[segments.length - 1].controlPoint;
      const routeCoords = await fetchRoute(lastPoint, newPoint);
      
      // Avoid duplicate coordinates at the junction
      const coordsToAdd = routeCoords.length > 1 ? routeCoords.slice(1) : routeCoords;

      setSegments(prev => [
        ...prev, 
        { controlPoint: newPoint, coordinates: coordsToAdd }
      ]);
      
      setIsRouting(false);
      setMessage('');
    };

    // Using a ref or cleaning up correctly
    map.on('click', clickListener);

    return () => {
      map.off('click', clickListener);
    };
  }, [map, isReady, segments, isRouting]);


  // Update line color when state changes
  useEffect(() => {
    if (map && isReady && map.getLayer('trace-line')) {
      map.setPaintProperty('trace-line', 'line-color', color);
      map.setPaintProperty('trace-points', 'circle-stroke-color', color);
    }
  }, [color, map, isReady]);

  // Update GeoJSON when segments change
  useEffect(() => {
    if (!map || !isReady || !map.getSource('trace-source')) return;

    const source = map.getSource('trace-source') as maplibregl.GeoJSONSource;
    
    const features: GeoJSON.Feature[] = [];

    // Add control points
    controlPoints.forEach((pt) => {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: pt
        },
        properties: {}
      });
    });

    // Add line if we have coordinates
    if (fullRouteCoordinates.length >= 2) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: fullRouteCoordinates
        },
        properties: {}
      });
    }

    source.setData({
      type: 'FeatureCollection',
      features
    });

  }, [segments, controlPoints, fullRouteCoordinates, map, isReady]);

  const undoLastPoint = () => {
    setSegments(prev => prev.slice(0, -1));
  };

  const clearPoints = () => {
    setSegments([]);
    setMessage('');
  };

  const handleSave = async () => {
    if (fullRouteCoordinates.length < 2) {
      setMessage('❌ Necesitas al menos 2 puntos para crear una ruta.');
      return;
    }

    setLoading(true);
    setMessage('Creando ruta (1/3)...');
    
    try {
      const baseUrl = 'http://localhost:8000/api/v1';
      
      // 1. Crear Ruta
      const routeRes = await fetch(`${baseUrl}/routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          visual_code: visualCode,
          display_name: displayName,
          color_primary: color,
        })
      });

      if (!routeRes.ok) throw new Error('Error al crear la ruta base');
      const route = await routeRes.json();

      setMessage('Trazando puntos espaciales (2/3)...');

      // 2. Crear Path y Puntos (Enviamos la ruta detallada snappeada a calles)
      const pathRes = await fetch(`${baseUrl}/paths`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          route_id: route.id,
          direction: 1,
          points: fullRouteCoordinates.map((p, idx) => ({
            sequence_order: idx + 1,
            lng: p[0],
            lat: p[1],
          }))
        })
      });

      if (!pathRes.ok) throw new Error('Error al procesar la geometría en PostGIS');

      setMessage('Guardando tarifa plana (3/3)...');

      // 3. Crear Tarifa
      const fareRes = await fetch(`${baseUrl}/routes/${route.id}/fare-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          fare_amount: fare,
        })
      });

      if (!fareRes.ok) throw new Error('Error al guardar la regla de tarifa');

      setMessage(`✅ Ruta creada exitosamente (ID: ${route.id})`);
      setSegments([]);
      setVisualCode('');
      setDisplayName('');
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', position: 'relative' }}>
      
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
          color: '#2563eb',
          transition: 'all 0.2s ease'
        }}
        title="Centrar en mi ubicación"
      >
        <LocateFixed size={24} strokeWidth={2.5} />
      </button>

      {/* Sidebar Form */}
      <div style={{ width: '350px', padding: '20px', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', zIndex: 10, borderRight: '1px solid #e5e7eb' }}>
        <h2>Crear Ruta B2B</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label>Código Visual (Letra/Número)</label>
          <input value={visualCode} onChange={(e) => setVisualCode(e.target.value)} style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label>Nombre de la Ruta</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label>Color Principal</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '100%', height: '40px', padding: '0', border: 'none', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label>Tarifa Plana (S/)</label>
          <input type="number" step="0.50" value={fare} onChange={(e) => setFare(parseFloat(e.target.value))} style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
        </div>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e5e7eb', borderRadius: '8px' }}>
          <h4>Trazado Inteligente</h4>
          <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '10px' }}>
            Haz clic en el mapa. La ruta se ajustará automáticamente a las calles reales.
          </p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}><strong>Nodos de control:</strong> {segments.length}</p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}><strong>Puntos espaciales:</strong> {fullRouteCoordinates.length}</p>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              onClick={undoLastPoint} 
              disabled={segments.length === 0 || isRouting}
              style={{ flex: 1, padding: '8px', cursor: (segments.length === 0 || isRouting) ? 'not-allowed' : 'pointer', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white' }}
            >
              Deshacer (Ctrl+Z)
            </button>
            <button 
              onClick={clearPoints} 
              disabled={segments.length === 0 || isRouting}
              style={{ flex: 1, padding: '8px', cursor: (segments.length === 0 || isRouting) ? 'not-allowed' : 'pointer', color: 'red', border: '1px solid #fecaca', borderRadius: '4px', backgroundColor: '#fef2f2' }}
            >
              Limpiar
            </button>
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={loading || fullRouteCoordinates.length < 2 || isRouting}
          style={{ 
            marginTop: '20px', 
            padding: '12px', 
            backgroundColor: (fullRouteCoordinates.length < 2 || loading || isRouting) ? '#9ca3af' : '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: (fullRouteCoordinates.length < 2 || loading || isRouting) ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {loading ? 'Guardando...' : 'Guardar Ruta Oficial'}
        </button>

        {message && (
          <div style={{ marginTop: '10px', padding: '10px', borderRadius: '4px', backgroundColor: message.includes('✅') ? '#dcfce3' : (message.includes('❌') || message.includes('Error')) ? '#fee2e2' : '#e0f2fe', color: message.includes('✅') ? '#166534' : (message.includes('❌') || message.includes('Error')) ? '#991b1b' : '#0369a1', fontSize: '14px', fontWeight: '500' }}>
            {message}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div 
        id="admin-maplibre-container" 
        ref={mapContainer} 
        style={{ flexGrow: 1, height: '100%', cursor: isRouting ? 'wait' : 'crosshair', zIndex: 1 }} 
      />
    </div>
  );
}
