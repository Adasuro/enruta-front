import React from 'react';

interface Point {
  lat: number;
  lng: number;
}

interface RoutePreviewSVGProps {
  points: Point[];
  color: string;
  width?: number;
  height?: number;
}

export const RoutePreviewSVG: React.FC<RoutePreviewSVGProps> = ({ 
  points, 
  color, 
  width = 280, 
  height = 100 
}) => {
  if (!points || points.length < 2) return null;

  // 1. Encontrar los lÃ­mites (Bounding Box) de las coordenadas
  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const rangeLat = maxLat - minLat || 0.001;
  const rangeLng = maxLng - minLng || 0.001;

  // 2. Normalizar coordenadas a pixeles del SVG con un margen del 10%
  const padding = 10;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const getX = (lng: number) => padding + ((lng - minLng) / rangeLng) * innerWidth;
  // En SVG, Y=0 es arriba, por lo que invertimos la latitud
  const getY = (lat: number) => padding + (innerHeight - ((lat - minLat) / rangeLat) * innerHeight);

  // 3. Construir el path string (M x,y L x,y ...)
  const pathData = points.reduce((acc, p, i) => {
    const x = getX(p.lng);
    const y = getY(p.lat);
    return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
  }, "");

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
    >
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'all 0.5s ease' }}
      />
      {/* CÃ­rculo de Inicio */}
      <circle cx={getX(points[0].lng)} cy={getY(points[0].lat)} r="3" fill="#10b981" />
      {/* CÃ­rculo de Fin */}
      <circle cx={getX(points[points.length-1].lng)} cy={getY(points[points.length-1].lat)} r="3" fill={color} />
    </svg>
  );
};
