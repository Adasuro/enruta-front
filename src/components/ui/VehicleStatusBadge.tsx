import React from 'react';
import { Bus, BusFront, Wrench, ShieldAlert } from 'lucide-react';
import type { Vehicle } from '../../features/console/services/vehicleService';

interface VehicleStatusBadgeProps {
  status: Vehicle['status'];
  size?: 'sm' | 'md' | 'lg';
}

export const VehicleStatusBadge: React.FC<VehicleStatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: <BusFront size={size === 'sm' ? 14 : size === 'lg' ? 24 : 16} />,
          text: 'Operativo',
          textColor: 'text-success-600',
          bgColor: 'bg-success-500/10',
        };
      case 'maintenance':
        return {
          icon: <Wrench size={size === 'sm' ? 14 : size === 'lg' ? 24 : 16} />,
          text: 'En Taller',
          textColor: 'text-warning',
          bgColor: 'bg-warning/10',
        };
      case 'inactive':
        return {
          icon: <ShieldAlert size={size === 'sm' ? 14 : size === 'lg' ? 24 : 16} />,
          text: 'Inactivo',
          textColor: 'text-danger-600',
          bgColor: 'bg-danger-500/10',
        };
      default:
        return {
          icon: <Bus size={size === 'sm' ? 14 : size === 'lg' ? 24 : 16} />,
          text: 'Desconocido',
          textColor: 'text-gray-500',
          bgColor: 'bg-gray-100',
        };
    }
  };

  const config = getStatusConfig();
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-[0.8125rem]',
    lg: 'text-sm'
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`rounded-md flex items-center justify-center ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
      >
        {config.icon}
      </div>
      <span className={`font-semibold ${config.textColor} ${textSizeClasses[size]}`}>
        {config.text}
      </span>
    </div>
  );
};
