import React from 'react';
import { Card, Button } from '../../../../../../components/ui';
import { VehicleStatusBadge } from '../../../../../../components/ui/VehicleStatusBadge';
import type { Vehicle } from '../../../../services/vehicleService';

interface VehicleCardProps {
  vehicle: Vehicle;
  availableRoutes: Array<{ id: string; visual_code: string; display_name: string }>;
  isUpdatingRoute: boolean;
  isUpdatingStatus: boolean;
  onRouteAssign: (vehicleId: string, routeId: string) => void;
  onStatusToggle: (vehicleId: string, currentStatus: Vehicle['status']) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  availableRoutes,
  isUpdatingRoute,
  isUpdatingStatus,
  onRouteAssign,
  onStatusToggle
}) => {
  return (
    <Card 
      bordered 
      padding="md" 
      className="flex items-center justify-between gap-4 flex-wrap transition-all duration-200 ease-in-out hover:shadow-md max-md:flex-col max-md:items-stretch"
    >
      {/* Info del Vehículo */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <VehicleStatusBadge status={vehicle.status} size="lg" />
        
        <div>
          <h4 className="m-0 mb-1 text-lg font-bold tracking-wider font-mono text-gray-900">
            {vehicle.plate_number}
          </h4>
          <div className="flex items-center gap-2 text-[0.8125rem]">
            <span className="text-gray-500 capitalize font-medium">
              {vehicle.type === 'bus' ? 'Bus' : vehicle.type === 'minibus' ? 'Coaster' : vehicle.type === 'van' ? 'Minivan' : 'Auto'}
            </span>
          </div>
        </div>
      </div>

      {/* Asignación de Ruta */}
      <div className="flex-1 min-w-[250px] flex items-center gap-4 max-md:min-w-full">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            Ruta Asignada (Despacho)
          </label>
          <select 
            value={vehicle.route_id || ''} 
            onChange={(e) => onRouteAssign(vehicle.id, e.target.value)}
            disabled={isUpdatingRoute}
            className={`w-full p-2.5 rounded-lg outline-none transition-all duration-200 cursor-pointer text-sm ${
              vehicle.route_id 
                ? 'border border-primary-200 bg-primary-50 text-primary-600 font-bold hover:bg-primary-100' 
                : 'border border-gray-200 bg-white text-gray-700 font-medium hover:border-primary-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">-- Sin ruta asignada --</option>
            {availableRoutes.map((r) => (
              <option key={r.id} value={r.id}>{r.visual_code} - {r.display_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Acciones de Estado */}
      <div className="flex gap-2 max-md:mt-2">
        <Button 
          variant={vehicle.status === 'active' ? 'outline' : 'primary'} 
          size="sm"
          onClick={() => onStatusToggle(vehicle.id, vehicle.status)}
          disabled={isUpdatingStatus}
          className="max-md:w-full"
        >
          {vehicle.status === 'active' ? 'Enviar a Taller' : 'Marcar Operativo'}
        </Button>
      </div>
    </Card>
  );
};
