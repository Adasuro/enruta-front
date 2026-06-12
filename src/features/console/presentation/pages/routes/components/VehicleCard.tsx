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
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: 'var(--spacing-4)', 
        flexWrap: 'wrap',
        transition: 'all 0.2s ease-in-out',
      }}
      className="hover:shadow-md"
    >
      {/* Info del Vehículo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', minWidth: '200px' }}>
        <VehicleStatusBadge status={vehicle.status} size="lg" />
        
        <div>
          <h4 style={{ 
            margin: '0 0 var(--spacing-1) 0', 
            fontSize: '1.125rem', 
            fontWeight: 700, 
            letterSpacing: '0.05em',
            fontFamily: 'monospace'
          }}>
            {vehicle.plate_number}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--color-gray-500)', textTransform: 'capitalize' }}>
              {vehicle.type === 'bus' ? 'Bus' : vehicle.type === 'minibus' ? 'Coaster' : vehicle.type === 'van' ? 'Minivan' : 'Auto'}
            </span>
          </div>
        </div>
      </div>

      {/* Asignación de Ruta */}
      <div style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: 'var(--spacing-1)' }}>
            Ruta Asignada (Despacho)
          </label>
          <select 
            value={vehicle.route_id || ''} 
            onChange={(e) => onRouteAssign(vehicle.id, e.target.value)}
            disabled={isUpdatingRoute}
            style={{ 
              width: '100%', 
              padding: 'var(--spacing-2)', 
              borderRadius: 'var(--radius-sm)', 
              border: `1px solid ${vehicle.route_id ? 'var(--brand-primary-light)' : 'var(--color-gray-200)'}`,
              backgroundColor: vehicle.route_id ? 'var(--brand-primary-light)' : 'var(--color-white)',
              color: vehicle.route_id ? 'var(--brand-primary)' : 'var(--color-gray-700)',
              fontWeight: vehicle.route_id ? 600 : 400,
              outline: 'none',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            <option value="">-- Sin ruta asignada --</option>
            {availableRoutes.map((r) => (
              <option key={r.id} value={r.id}>{r.visual_code} - {r.display_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Acciones de Estado */}
      <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
        <Button 
          variant={vehicle.status === 'active' ? 'outline' : 'primary'} 
          size="sm"
          onClick={() => onStatusToggle(vehicle.id, vehicle.status)}
          disabled={isUpdatingStatus}
        >
          {vehicle.status === 'active' ? 'Enviar a Taller' : 'Marcar Operativo'}
        </Button>
      </div>
    </Card>
  );
};
