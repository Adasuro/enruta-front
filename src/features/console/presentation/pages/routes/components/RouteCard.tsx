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
    <Card padding="none" elevation="sm" className="overflow-hidden" style={{ borderTop: `4px solid ${route.color_primary}` }}>
      <div className="h-[140px] bg-gray-50 flex items-center justify-center relative overflow-hidden">
        <div className="opacity-60 w-full h-full">
          {pathPoints.length > 0 ? (
              <RoutePreviewSVG points={pathPoints} color={route.color_primary} />
          ) : (
              <div className="flex items-center justify-center h-full">
                  <Bus size={48} style={{ color: route.color_primary, opacity: 0.2 }} />
              </div>
          )}
        </div>

        <div className="absolute top-3 left-3 flex gap-2">
            <div className="px-3 py-1.5 text-white rounded-md font-black text-xl shadow-md" style={{ backgroundColor: route.color_primary }}>
                {route.visual_code}
            </div>
        </div>

        <div className="absolute top-3 right-3">
            <Badge variant={isActive ? 'success' : 'neutral'}>
                {isActive ? 'EN SERVICIO' : 'INACTIVA'}
            </Badge>
        </div>
      </div>

      <CardBody className="p-5">
        <div className="mb-6">
          <h3 className="text-lg font-extrabold text-gray-900 tracking-tight m-0 mb-1 truncate">
            {route.display_name || `Línea ${route.visual_code}`}
          </h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest m-0">
            ID Operativo: {route.id.split('-')[0]}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-[1px] bg-gray-100 border border-gray-100 rounded-xl overflow-hidden mb-6">
          <div className="bg-white p-3 flex flex-col items-center gap-1">
            <Tag size={14} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-900">S/ {parseFloat(currentFare).toFixed(2)}</span>
            <span className="text-[0.625rem] text-gray-400 font-bold uppercase">Pasaje</span>
          </div>
          <div className="bg-white p-3 flex flex-col items-center gap-1">
            <Clock size={14} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-900">{route.frequency_min || '--'}m</span>
            <span className="text-[0.625rem] text-gray-400 font-bold uppercase">Frec.</span>
          </div>
          <div className="bg-white p-3 flex flex-col items-center gap-1">
            <Bus size={14} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-900">{route.vehicles_count || 0}</span>
            <span className="text-[0.625rem] text-gray-400 font-bold uppercase">Flota</span>
          </div>
        </div>

        <div className="flex gap-2">
            <Button variant="outline" onClick={() => onStatusToggle(route.id, route.status)} className="flex-1">
                {isActive ? 'Pausar' : 'Activar'}
            </Button>
            <Button variant="secondary" onClick={() => onManage(route.id)} className="flex-1">
                <Settings2 size={18} />
            </Button>
        </div>
      </CardBody>
    </Card>
  );
};
