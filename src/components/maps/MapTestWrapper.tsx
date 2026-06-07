import { useState } from 'react';
import { MaplibreRouteViewer } from './MaplibreRouteViewer';
import type { Route } from './MaplibreRouteViewer';

const MOCK_ROUTES: Route[] = [
  {
    id: '1',
    visual_code: 'A',
    display_name: 'Ruta A - El Tambo',
    color_primary: '#FF0000',
    path_geojson: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-75.204, -12.065],
          [-75.205, -12.066],
          [-75.206, -12.068],
          [-75.208, -12.070],
        ]
      }
    },
    boarding_stop: { lat: -12.065, lng: -75.204, name: 'Paradero Inicial' },
    fare: { amount: 1.50, currency: 'PEN' }
  },
  {
    id: '2',
    visual_code: 'B',
    display_name: 'Ruta B - Chilca',
    color_primary: '#0000FF',
    path_geojson: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-75.210, -12.068],
          [-75.208, -12.068],
          [-75.206, -12.068],
        ]
      }
    },
    boarding_stop: { lat: -12.068, lng: -75.206, name: 'Cruce Central' },
    fare: { amount: 1.50, currency: 'PEN' }
  }
];

export default function MapTestWrapper() {
  const [selected, setSelected] = useState<Route | null>(null);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      <div style={{ width: '300px', padding: '20px', backgroundColor: '#f5f5f5', overflowY: 'auto' }}>
        <h2>Rutas Encontradas</h2>
        <p>Prueba de MapLibre GL</p>
        {MOCK_ROUTES.map(route => (
          <div 
            key={route.id}
            onClick={() => setSelected(route)}
            style={{
              padding: '10px',
              margin: '10px 0',
              backgroundColor: 'white',
              borderLeft: `5px solid ${route.color_primary}`,
              cursor: 'pointer',
              boxShadow: selected?.id === route.id ? '0 0 5px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            <h3>{route.visual_code} - {route.display_name}</h3>
            <p>Tarifa: {route.fare.currency} {route.fare.amount}</p>
          </div>
        ))}
      </div>
      <div style={{ flexGrow: 1 }}>
        <MaplibreRouteViewer 
          searchResults={MOCK_ROUTES} 
          selectedRoute={selected} 
          onSelectRoute={setSelected} 
        />
      </div>
    </div>
  );
}
