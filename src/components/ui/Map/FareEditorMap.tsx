import React from 'react';
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Stop {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  is_terminal: boolean;
}

interface FareEditorMapProps {
  geometry: {
    type: string;
    coordinates: number[][];
  };
  stops: Stop[];
  routeColor: string;
  selectedStartStopId?: string;
  selectedEndStopId?: string;
  onStopSelect: (stopId: string) => void;
}

export const FareEditorMap: React.FC<FareEditorMapProps> = ({ 
  geometry, 
  stops, 
  routeColor,
  selectedStartStopId,
  selectedEndStopId,
  onStopSelect
}) => {
  // Defensive check for geometry
  const validCoordinates = geometry?.coordinates?.[0] ? geometry.coordinates : [[-75.2048, -12.0651]];
  
  const initialViewState = {
    longitude: validCoordinates[0][0],
    latitude: validCoordinates[0][1],
    zoom: 14
  };

  const geojsonLine = {
    type: 'Feature' as const,
    properties: {},
    geometry: (geometry || { type: 'LineString', coordinates: [] }) as any
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
      <Map
        initialViewState={initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />

        {geometry && (
          <Source id="route-source" type="geojson" data={geojsonLine}>
            <Layer 
              id="route-line"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': routeColor,
                'line-width': 5,
                'line-opacity': 0.6
              }}
            />
          </Source>
        )}

        {stops.map((stop) => {
          const isStart = stop.id === selectedStartStopId;
          const isEnd = stop.id === selectedEndStopId;
          const isSelected = isStart || isEnd;

          return (
            <Marker 
              key={stop.id}
              longitude={stop.location.longitude} 
              latitude={stop.location.latitude} 
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onStopSelect(stop.id);
              }}
            >
              <div 
                className="group relative flex flex-col items-center"
                style={{ cursor: 'pointer' }}
              >
                {/* Etiqueta del paradero */}
                <div className={`
                    absolute bottom-full mb-2 px-2 py-1 rounded bg-white shadow-md border text-[0.625rem] font-bold whitespace-nowrap
                    transition-all duration-200 
                    ${isSelected ? 'opacity-100 scale-100 z-20' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 z-10'}
                `}>
                    {stop.name}
                    {isStart && <span className="ml-1 text-success-600">(ORIGEN)</span>}
                    {isEnd && <span className="ml-1 text-danger-600">(DESTINO)</span>}
                </div>

                {/* Punto del paradero */}
                <div style={{
                  width: isSelected ? '20px' : '14px', 
                  height: isSelected ? '20px' : '14px', 
                  background: isStart ? 'var(--color-success-500)' : (isEnd ? 'var(--color-danger-500)' : 'white'), 
                  border: `2px solid ${isSelected ? 'white' : routeColor}`, 
                  borderRadius: '50%',
                  boxShadow: '0 0 6px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease'
                }} />
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
};
