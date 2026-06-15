import React from 'react';
import { Card, Button, Select, ActionGroup } from '../../../../../../components/ui';
import { VehicleStatusBadge } from '../../../../../../components/ui/VehicleStatusBadge';
import type { Vehicle } from '../../../../services/vehicleService';
import { Bus, Wrench, CheckCircle2 } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  availableFleets: Array<{ id: string; name: string }>;
  isUpdatingFleet: boolean;
  isUpdatingStatus: boolean;
  isDeleting?: boolean;
  onFleetAssign: (vehicleId: string, fleetId: string) => void;
  onStatusToggle: (vehicleId: string, currentStatus: Vehicle['status']) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: string) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  availableFleets,
  isUpdatingFleet,
  isUpdatingStatus,
  isDeleting,
  onFleetAssign,
  onStatusToggle,
  onEdit,
  onDelete
}) => {
  const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

  return (
    <Card 
      padding="none" 
      className="flex flex-col transition-all duration-200 ease-in-out hover:shadow-lg border border-gray-200 overflow-hidden bg-white"
    >
      <div className="w-full h-36 bg-gray-100 relative border-b border-gray-100">
        {vehicle.photo_front ? (
          <img 
            src={`${STORAGE_URL}/${vehicle.photo_front}`} 
            alt="Frontal" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <Bus size={48} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <VehicleStatusBadge status={vehicle.status} size="lg" />
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col">
            <h4 className="m-0 text-[1.25rem] font-black tracking-wider font-mono text-gray-900 leading-none">
              {vehicle.plate_number}
            </h4>
            <span className="text-sm text-gray-500 font-medium mt-1">
              {vehicle.brand || 'Sin Marca'} {vehicle.model_name ? `• ${vehicle.model_name}` : ''}
            </span>
          </div>
          
          <ActionGroup 
            onEdit={onEdit ? () => onEdit(vehicle) : undefined}
            onDelete={onDelete ? () => onDelete(vehicle.id) : undefined}
            isDeleting={isDeleting}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Select 
            label="Asignación a Flota"
            value={vehicle.fleet_id || ''} 
            onChange={(e) => onFleetAssign(vehicle.id, e.target.value)}
            disabled={isUpdatingFleet}
            options={[
              { value: '', label: '-- Inventario General (Sin Flota) --' },
              ...availableFleets.map(f => ({ value: f.id, label: f.name }))
            ]}
          />
        </div>

        <Button 
          variant={vehicle.status === 'active' ? 'outline' : 'primary'} 
          onClick={() => onStatusToggle(vehicle.id, vehicle.status)}
          disabled={isUpdatingStatus}
          className={`w-full font-bold shadow-sm ${vehicle.status === 'active' ? 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900' : ''}`}
          leftIcon={vehicle.status === 'active' ? <Wrench size={16} /> : <CheckCircle2 size={16} />}
        >
          {vehicle.status === 'active' ? 'Enviar a Mantenimiento' : 'Marcar Operativo'}
        </Button>
      </div>
    </Card>
  );
};

