import React from 'react';
import { Card, Button } from '../../../../../../components/ui';
import { VehicleStatusBadge } from '../../../../../../components/ui/VehicleStatusBadge';
import type { Vehicle } from '../../../../services/vehicleService';

interface VehicleCardProps {
  vehicle: Vehicle;
  availableFleets: Array<{ id: string; name: string }>;
  isUpdatingFleet: boolean;
  isUpdatingStatus: boolean;
  onFleetAssign: (vehicleId: string, fleetId: string) => void;
  onStatusToggle: (vehicleId: string, currentStatus: Vehicle['status']) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  availableFleets,
  isUpdatingFleet,
  isUpdatingStatus,
  onFleetAssign,
  onStatusToggle
}) => {
  return (
    <Card 
      bordered 
      padding="md" 
      className="flex flex-col gap-4 transition-all duration-200 ease-in-out hover:shadow-md"
    >
      {vehicle.photo_front && (
        <div className="w-full h-32 rounded-lg overflow-hidden mb-2 border border-gray-100 relative bg-gray-50">
          <img 
            src={`http://localhost:8000/storage/${vehicle.photo_front}`} 
            alt="Frontal" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <VehicleStatusBadge status={vehicle.status} size="lg" />
          
          <div>
            <h4 className="m-0 mb-1 text-lg font-bold tracking-wider font-mono text-gray-900">
              {vehicle.plate_number}
            </h4>
            <div className="flex items-center gap-2 text-[0.8125rem]">
              <span className="text-gray-500 font-medium">
                {vehicle.brand || 'Sin Marca'} {vehicle.model_name ? `- ${vehicle.model_name}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-[250px] flex flex-col gap-1 max-md:min-w-full">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Asignación a Flota
        </label>
        <select 
          value={vehicle.fleet_id || ''} 
          onChange={(e) => onFleetAssign(vehicle.id, e.target.value)}
          disabled={isUpdatingFleet}
          className={`w-full p-2.5 rounded-lg outline-none transition-all duration-200 cursor-pointer text-sm ${
            vehicle.fleet_id 
              ? 'border border-primary-200 bg-primary-50 text-primary-600 font-bold hover:bg-primary-100' 
              : 'border border-gray-200 bg-white text-gray-700 font-medium hover:border-primary-300'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <option value="">-- Inventario General --</option>
          {availableFleets.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button 
          variant={vehicle.status === 'active' ? 'outline' : 'primary'} 
          size="sm"
          onClick={() => onStatusToggle(vehicle.id, vehicle.status)}
          disabled={isUpdatingStatus}
          className="w-full"
        >
          {vehicle.status === 'active' ? 'Enviar a Taller' : 'Marcar Operativo'}
        </Button>
      </div>
    </Card>
  );
};

