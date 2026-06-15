import React from 'react';
import { Bus, Clock, Tag } from 'lucide-react';
import { Button, Card, Badge, ActionGroup } from '../../../../../../components/ui';
import { RoutePreviewSVG } from './RoutePreviewSVG';

interface RouteCardProps {
  route: {
    id: string;
    visual_code: string;
    display_name: string;
    color_primary: string;
    color_secondary: string | null;
    status: string;
    frequency_min?: number;
    fleets_count?: number;
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
  onDelete?: (id: string) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, onManage, onStatusToggle, onDelete }) => {
  const currentFare = route.fare_rules?.[0]?.fare_amount || "0.00";
  const isActive = route.status === 'active';

  const pathPoints = route.paths?.[0]?.geometry?.coordinates?.map(c => ({
    lng: c[0],
    lat: c[1]
  })) || [];

  return (
    <Card 
      padding="none" 
      className="flex flex-col transition-all duration-200 ease-in-out hover:shadow-lg border border-gray-200 overflow-hidden bg-white"
    >
      <div className="w-full h-36 bg-gray-50 relative border-b border-gray-100 flex items-center justify-center">
        <div className="opacity-60 w-full h-full">
          {pathPoints.length > 0 ? (
              <RoutePreviewSVG points={pathPoints} color={route.color_primary} />
          ) : (
              <div className="flex items-center justify-center h-full">
                  <Bus size={48} style={{ color: route.color_primary, opacity: 0.2 }} strokeWidth={1.5} />
              </div>
          )}
        </div>

        <div className="absolute top-3 left-3">
          <div className="px-3 py-1.5 rounded-md font-black text-xl shadow-md border border-white/20" style={{ backgroundColor: route.color_primary, color: route.color_secondary || '#ffffff' }}>
            {route.visual_code}
          </div>
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          <div className="shadow-sm">
            <Badge variant={isActive ? 'success' : 'neutral'}>
              {isActive ? 'EN SERVICIO' : 'INACTIVA'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="text-[1.25rem] font-extrabold text-gray-900 tracking-tight m-0 mb-1 truncate leading-none">
              {route.display_name || `Línea ${route.visual_code}`}
            </h3>
            <p className="text-[0.6875rem] text-gray-500 font-bold uppercase tracking-widest m-0 mt-1">
              ID Operativo: {route.id.split('-')[0]}
            </p>
          </div>
          
          <ActionGroup 
            onSettings={() => onManage(route.id)}
            onDelete={onDelete ? () => onDelete(route.id) : undefined}
          />
        </div>

        <div className="grid grid-cols-3 gap-[1px] bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
          <div className="bg-white p-3 flex flex-col items-center gap-1.5">
            <Tag size={16} className="text-gray-400" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-gray-900 leading-none mb-1">S/ {parseFloat(currentFare).toFixed(2)}</span>
              <span className="text-[0.625rem] text-gray-400 font-bold uppercase tracking-wide">Pasaje</span>
            </div>
          </div>
          <div className="bg-white p-3 flex flex-col items-center gap-1.5">
            <Clock size={16} className="text-gray-400" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-gray-900 leading-none mb-1">{route.frequency_min || '--'}m</span>
              <span className="text-[0.625rem] text-gray-400 font-bold uppercase tracking-wide">Frec.</span>
            </div>
          </div>
          <div className="bg-white p-3 flex flex-col items-center gap-1.5">
            <Bus size={16} className="text-gray-400" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-gray-900 leading-none mb-1">{route.fleets_count || 0}</span>
              <span className="text-[0.625rem] text-gray-400 font-bold uppercase tracking-wide">Flotas</span>
            </div>
          </div>
        </div>

        <Button 
          variant={isActive ? 'outline' : 'primary'} 
          onClick={() => onStatusToggle(route.id, route.status)} 
          className={`w-full font-bold shadow-sm ${isActive ? 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900' : ''}`}
        >
          {isActive ? 'Pausar Operación' : 'Activar Ruta'}
        </Button>
      </div>
    </Card>
  );
};
