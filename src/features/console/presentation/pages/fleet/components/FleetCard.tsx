import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Card, ActionGroup } from '../../../../../../components/ui';
import type { Fleet } from '../../../../services/fleetService';

interface FleetCardProps {
  fleet: Fleet;
  onEdit: (fleet: Fleet) => void;
  onDelete: (id: string) => void;
}

export const FleetCard: React.FC<FleetCardProps> = ({ fleet, onEdit, onDelete }) => {
  return (
    <Card 
      padding="none"
      className="flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md border border-gray-200 bg-white" 
    >
      <div className="flex flex-col h-full" style={{ borderLeft: `5px solid ${fleet.color_code || '#94a3b8'}` }}>
        <div className="p-5 pb-4 flex justify-between items-start gap-4">
          <div className="flex flex-col">
            <h3 className="text-[1.125rem] font-extrabold text-gray-900 m-0 leading-tight">
              {fleet.name}
            </h3>
            <div className="mt-2">
              <span className={`inline-flex items-center text-[0.6875rem] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                fleet.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {fleet.status === 'ACTIVE' ? 'Operativa' : 'Inactiva'}
              </span>
            </div>
          </div>

          <ActionGroup 
            onEdit={() => onEdit(fleet)} 
            onDelete={() => onDelete(fleet.id)} 
          />
        </div>
        
        <div className="mt-auto px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center text-xs text-gray-600 font-bold uppercase tracking-wide">
          <ShieldAlert size={14} className="mr-2 text-gray-400" /> 
          {fleet.vehicles_count || 0} vehículos asignados
        </div>
      </div>
    </Card>
  );
};
