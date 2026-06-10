import React from 'react';
import { Bus, Settings2, Clock, Tag } from 'lucide-react';
import { Button, Card, CardBody, Badge } from '../../../../../../components/ui';
import { RoutePreviewSVG } from './RoutePreviewSVG';

interface RouteCardProps {
  route: {
    id: string;
    visual_code: string;
    display_name: string;
    color_primary: string;
    status: string;
    frequency_min?: number;
    vehicles_count?: number;
    fare_rules?: Array<{
        fare_amount: string;
    }>;
    paths?: Array<{
        geometry: {
            coordinates: number[][];
        }
    }>;
  };
  onManage: (id: string) => void;
  onStatusToggle: (id: string, currentStatus: string) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, onManage, onStatusToggle }) => {
  const currentFare = route.fare_rules?.[0]?.fare_amount || "0.00";
  const isActive = route.status === 'active';

  const pathPoints = route.paths?.[0]?.geometry?.coordinates?.map(c => ({
    lng: c[0],
    lat: c[1]
  })) || [];

  return (
    <Card padding="none" elevation="sm" style={{ borderTop: `4px solid ${route.color_primary}` }}>
      <div style={{ height: '140px', backgroundColor: 'var(--color-gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ opacity: 0.6, width: '100%', height: '100%' }}>
          {pathPoints.length > 0 ? (
              <RoutePreviewSVG points={pathPoints} color={route.color_primary} />
          ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Bus size={48} style={{ color: route.color_primary, opacity: 0.2 }} />
              </div>
          )}
        </div>

        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
            <div style={{ padding: '6px 12px', backgroundColor: route.color_primary, color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 900, fontSize: '1.25rem', boxShadow: 'var(--shadow-md)' }}>
                {route.visual_code}
            </div>
        </div>

        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <Badge variant={isActive ? 'success' : 'neutral'}>
                {isActive ? 'EN SERVICIO' : 'INACTIVA'}
            </Badge>
        </div>
      </div>

      <CardBody style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-gray-900)', letterSpacing: '-0.01em', marginBottom: '0.25rem' }}>
            {route.display_name || `Línea ${route.visual_code}`}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ID Operativo: {route.id.split('-')[0]}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', backgroundColor: 'var(--color-gray-100)', border: '1px solid var(--color-gray-100)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: 'white', padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <Tag size={14} color="var(--color-gray-400)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>S/ {parseFloat(currentFare).toFixed(2)}</span>
            <span style={{ fontSize: '0.625rem', color: 'var(--color-gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Pasaje</span>
          </div>
          <div style={{ backgroundColor: 'white', padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} color="var(--color-gray-400)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{route.frequency_min || '--'}m</span>
            <span style={{ fontSize: '0.625rem', color: 'var(--color-gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Frec.</span>
          </div>
          <div style={{ backgroundColor: 'white', padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <Bus size={14} color="var(--color-gray-400)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{route.vehicles_count || 0}</span>
            <span style={{ fontSize: '0.625rem', color: 'var(--color-gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Flota</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <Button variant="outline" onClick={() => onStatusToggle(route.id, route.status)} style={{ flex: 1 }}>
                {isActive ? 'Pausar' : 'Activar'}
            </Button>
            <Button variant="secondary" onClick={() => onManage(route.id)} style={{ flex: 1 }}>
                <Settings2 size={18} />
            </Button>
        </div>
      </CardBody>
    </Card>
  );
};
