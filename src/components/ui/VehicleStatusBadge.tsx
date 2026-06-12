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
          colorVar: 'var(--color-success)',
          bgVar: 'rgba(16, 185, 129, 0.1)',
        };
      case 'maintenance':
        return {
          icon: <Wrench size={size === 'sm' ? 14 : size === 'lg' ? 24 : 16} />,
          text: 'En Taller',
          colorVar: 'var(--color-warning)',
          bgVar: 'rgba(245, 158, 11, 0.1)',
        };
      case 'inactive':
        return {
          icon: <ShieldAlert size={size === 'sm' ? 14 : size === 'lg' ? 24 : 16} />,
          text: 'Inactivo',
          colorVar: 'var(--color-danger)',
          bgVar: 'rgba(239, 68, 68, 0.1)',
        };
      default:
        return {
          icon: <Bus size={size === 'sm' ? 14 : size === 'lg' ? 24 : 16} />,
          text: 'Desconocido',
          colorVar: 'var(--color-gray-500)',
          bgVar: 'var(--color-gray-100)',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
      <div
        style={{
          width: size === 'sm' ? '24px' : size === 'lg' ? '48px' : '36px',
          height: size === 'sm' ? '24px' : size === 'lg' ? '48px' : '36px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: config.bgVar,
          color: config.colorVar,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {config.icon}
      </div>
      <span style={{ color: config.colorVar, fontWeight: 600, fontSize: size === 'sm' ? '0.75rem' : '0.8125rem' }}>
        {config.text}
      </span>
    </div>
  );
};
