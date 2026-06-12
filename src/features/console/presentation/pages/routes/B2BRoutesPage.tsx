import React, { useState } from 'react';
import { Plus, Loader2, Bus, LayoutGrid } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card } from '../../../../../components/ui';
import { useNotification } from '../../../../../hooks/useNotification';
import { useAuth } from '../../../../../contexts/AuthContext';
import { vehicleService } from '../../../services/vehicleService';
import type { Vehicle } from '../../../services/vehicleService';
import api from '../../../../../config/api';
import { VehicleModal } from './components/VehicleModal';
import { VehicleCard } from './components/VehicleCard';
import './B2BRoutesPage.css'; 

export const B2BRoutesPage: React.FC = () => {
  const { success, error, warning } = useNotification();
  const queryClient = useQueryClient();
  const { activeBusinessId } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles', activeBusinessId],
    queryFn: async () => {
      if (!activeBusinessId) return [];
      return vehicleService.getVehicles(activeBusinessId);
    },
    enabled: !!activeBusinessId,
    staleTime: 1000 * 60 * 5, 
  });

  const { data: availableRoutes = [] } = useQuery({
    queryKey: ['routes', activeBusinessId],
    queryFn: async () => {
      const response = await api.get('/routes');
      return response.data.data;
    },
    enabled: !!activeBusinessId,
  });

  const updateRouteMutation = useMutation({
    mutationFn: async ({ id, routeId }: { id: string, routeId: string | null }) => {
      return vehicleService.updateRoute(id, routeId);
    },
    onSuccess: () => {
      success('Vehículo reasignado correctamente.', 'Despacho Exitoso');
      queryClient.invalidateQueries({ queryKey: ['vehicles', activeBusinessId] });
    },
    onError: () => {
      error('No se pudo reasignar el vehículo.', 'Error');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: Vehicle['status'] }) => {
      return vehicleService.updateStatus(id, status);
    },
    onSuccess: (updatedVehicle) => {
      if (updatedVehicle.status === 'maintenance') warning('Vehículo enviado a taller.', 'Mantenimiento');
      else if (updatedVehicle.status === 'active') success('Vehículo operativo.', 'En Línea');
      queryClient.invalidateQueries({ queryKey: ['vehicles', activeBusinessId] });
    },
    onError: () => {
      error('No se pudo cambiar el estado del vehículo.', 'Error');
    }
  });

  const handleRouteChange = (vehicleId: string, newRouteId: string) => {
    updateRouteMutation.mutate({ id: vehicleId, routeId: newRouteId || null });
  };

  const handleStatusToggle = (vehicleId: string, currentStatus: Vehicle['status']) => {
    updateStatusMutation.mutate({ id: vehicleId, status: currentStatus === 'active' ? 'maintenance' : 'active' });
  };

  if (isLoading) {
    return (
      <div className="b2b-routes-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'var(--spacing-4)' }}>
        <Loader2 className="animate-spin" size={40} color="var(--brand-primary)" />
        <p style={{ fontWeight: 600 }}>Cargando inventario de flota...</p>
      </div>
    );
  }

  return (
    <div className="b2b-routes-page" style={{ padding: 'var(--spacing-6)', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="b2b-routes-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-8)' }}>
        <div>
          <div className="b2b-routes-header-badge" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.875rem', marginBottom: 'var(--spacing-2)' }}>
            <LayoutGrid size={20} />
            <span>Gestión de Flota</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 var(--spacing-2) 0', color: 'var(--color-text-heading)' }}>Inventario de Vehículos</h2>
          <p style={{ color: 'var(--color-text-body)', margin: 0 }}>Despacha vehículos a rutas y controla su estado operativo.</p>
        </div>
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus size={20} />}
        >
          Añadir Vehículo
        </Button>
      </header>

      {vehicles.length === 0 ? (
        <Card bordered padding="lg" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--spacing-6) auto' }}>
            <Bus size={32} color="var(--color-text-muted)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--spacing-2)' }}>Tu flota está vacía</h3>
          <p style={{ color: 'var(--color-text-body)', maxWidth: '400px', margin: '0 auto var(--spacing-6) auto' }}>Registra las placas de tus unidades para empezar a asignarlas a tus rutas operativas.</p>
          <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>Registrar primer vehículo</Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          {vehicles.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              availableRoutes={availableRoutes}
              isUpdatingRoute={updateRouteMutation.isPending && updateRouteMutation.variables?.id === vehicle.id}
              isUpdatingStatus={updateStatusMutation.isPending && updateStatusMutation.variables?.id === vehicle.id}
              onRouteAssign={handleRouteChange}
              onStatusToggle={handleStatusToggle}
            />
          ))}
        </div>
      )}
      
      {activeBusinessId && (
        <VehicleModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          businessId={activeBusinessId} 
        />
      )}
    </div>
  );
};

