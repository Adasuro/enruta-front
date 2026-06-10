import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useMaplibreGL } from '../../../../../hooks/useMaplibreGL';
import useGeolocation from '../../../../../hooks/useGeolocation';
import { LocateFixed, Save, Undo2, Trash2 } from 'lucide-react';
import { Button, Input } from '../../../../../components/ui';
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
    
  }, [map, isReady, location.coordinates]);

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
      return [start, end];
    } catch (error) {
      console.error('Error fetching route:', error);
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

  // Separate effect to handle the async routing when a new click happens
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
      
      const coordsToAdd = routeCoords.length > 1 ? routeCoords.slice(1) : routeCoords;

      setSegments(prev => [
        ...prev, 
        { controlPoint: newPoint, coordinates: coordsToAdd }
      ]);
      
      setIsRouting(false);
      setMessage('');
    };

    map.on('click', clickListener);

    // Initial setup of layers for drawing
    if (!map.getSource('trace-source')) {
      map.addSource('trace-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

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
      map.off('click', clickListener);
    };
  }, [map, isReady, segments, isRouting, color]);


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

    controlPoints.forEach((pt) => {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: pt },
        properties: {}
      });
    });

    if (fullRouteCoordinates.length >= 2) {
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: fullRouteCoordinates },
        properties: {}
      });
    }

    source.setData({ type: 'FeatureCollection', features });

  }, [segments, controlPoints, fullRouteCoordinates, map, isReady]);

  const undoLastPoint = () => setSegments(prev => prev.slice(0, -1));
  const clearPoints = () => { setSegments([]); setMessage(''); };

  const handleSave = async () => {
    if (fullRouteCoordinates.length < 2) {
      setMessage('❌ Necesitas al menos 2 puntos para crear una ruta.');
      return;
    }

    setLoading(true);
    setMessage('Creando ruta (1/3)...');
    
    try {
      const baseUrl = 'http://localhost:8000/api/v1';
      
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
      <Button 
        onClick={handleLocationClick}
        variant="secondary"
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '20px',
          zIndex: 1000,
          borderRadius: '12px',
          width: '50px',
          height: '50px',
          padding: 0,
          boxShadow: 'var(--shadow-md)'
        }}
        title="Centrar en mi ubicación"
      >
        <LocateFixed size={24} strokeWidth={2.5} />
      </Button>

      {/* Sidebar Form */}
      <div style={{ width: '350px', padding: 'var(--spacing-4)', backgroundColor: 'var(--color-gray-100)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', overflowY: 'auto', zIndex: 10, borderRight: '1px solid var(--color-gray-200)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', color: 'var(--color-gray-900)' }}>Crear Ruta B2B</h2>
        
        <Input 
          label="Código Visual (Letra/Número)"
          value={visualCode} 
          onChange={(e) => setVisualCode(e.target.value)} 
        />

        <Input 
          label="Nombre de la Ruta"
          value={displayName} 
          onChange={(e) => setDisplayName(e.target.value)} 
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
          <label className="ui-input-label">Color Principal</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '100%', height: '40px', padding: '0', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }} />
        </div>

        <Input 
          label="Tarifa Plana (S/)"
          type="number" 
          step="0.50" 
          value={fare.toString()} 
          onChange={(e) => setFare(parseFloat(e.target.value))} 
        />

        <div style={{ marginTop: 'var(--spacing-2)', padding: 'var(--spacing-4)', backgroundColor: 'var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ margin: '0 0 var(--spacing-2) 0' }}>Trazado Inteligente</h4>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)', marginBottom: 'var(--spacing-3)' }}>
            Haz clic en el mapa. La ruta se ajustará automáticamente a las calles reales.
          </p>
          <div style={{ fontSize: 'var(--font-size-sm)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ margin: 0 }}><strong>Nodos de control:</strong> {segments.length}</p>
            <p style={{ margin: 0 }}><strong>Puntos espaciales:</strong> {fullRouteCoordinates.length}</p>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-3)' }}>
            <Button 
              variant="secondary"
              size="sm"
              onClick={undoLastPoint} 
              disabled={segments.length === 0 || isRouting}
              fullWidth
              leftIcon={<Undo2 size={16} />}
            >
              Deshacer
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              onClick={clearPoints} 
              disabled={segments.length === 0 || isRouting}
              fullWidth
              style={{ color: 'var(--color-danger)' }}
              leftIcon={<Trash2 size={16} />}
            >
              Limpiar
            </Button>
          </div>
        </div>

        <Button 
          variant="primary"
          onClick={handleSave} 
          isLoading={loading}
          disabled={fullRouteCoordinates.length < 2 || isRouting}
          fullWidth
          size="lg"
          leftIcon={<Save size={20} />}
        >
          Guardar Ruta Oficial
        </Button>

        {message && (
          <div style={{ 
            marginTop: 'var(--spacing-2)', 
            padding: 'var(--spacing-3)', 
            borderRadius: 'var(--radius-sm)', 
            backgroundColor: message.includes('✅') ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)', 
            color: message.includes('✅') ? 'var(--color-success)' : 'var(--color-danger)', 
            fontSize: 'var(--font-size-sm)', 
            fontWeight: '500' 
          }}>
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
