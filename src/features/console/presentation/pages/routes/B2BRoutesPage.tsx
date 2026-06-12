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
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
        <Loader2 className="animate-spin text-primary-500" size={40} />
        <p className="font-semibold text-gray-700">Cargando inventario de flota...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full pb-24 md:pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-500 font-extrabold text-[0.8125rem] mb-2 uppercase tracking-widest">
            <LayoutGrid size={20} />
            <span>Gestión de Flota</span>
          </div>
          <h2 className="text-[1.875rem] font-extrabold m-0 mb-1 text-gray-900 tracking-tight">Inventario de Vehículos</h2>
          <p className="text-gray-500 m-0 text-base">Despacha vehículos a rutas y controla su estado operativo.</p>
        </div>
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus size={20} />}
          className="w-full md:w-auto"
        >
          Añadir Vehículo
        </Button>
      </header>

      {vehicles.length === 0 ? (
        <Card bordered padding="lg" className="col-span-full py-20 px-8 text-center border-dashed bg-transparent border-gray-300">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6 text-gray-400">
            <Bus size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Tu flota está vacía</h3>
          <p className="text-gray-500 max-w-[400px] mx-auto mb-6 leading-relaxed">Registra las placas de tus unidades para empezar a asignarlas a tus rutas operativas.</p>
          <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>Registrar primer vehículo</Button>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
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

