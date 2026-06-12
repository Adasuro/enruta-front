import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Loader2, Bus } from 'lucide-react';
import { Input, Button, Card } from '../../../../../components/ui';
import { VehicleCard } from '../routes/components/VehicleCard';
import { VehicleModal } from '../routes/components/VehicleModal';
import { FleetManager } from './components/FleetManager';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useNotification } from '../../../../../hooks/useNotification';
import { vehicleService } from '../../../../console/services/vehicleService';
import type { Vehicle } from '../../../../console/services/vehicleService';
import api from '../../../../../config/api';

export const FleetListPage: React.FC = () => {
  const { activeBusinessId } = useAuth();
  const queryClient = useQueryClient();
  const { success, error, warning } = useNotification();
  
  const [activeTab, setActiveTab] = useState<'vehicles' | 'fleets'>('vehicles');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Escuchar evento personalizado del Layout
  useEffect(() => {
    const handleOpenModal = () => setIsAddModalOpen(true);
    window.addEventListener('open-add-vehicle-modal', handleOpenModal);
    return () => window.removeEventListener('open-add-vehicle-modal', handleOpenModal);
  }, []);

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles', activeBusinessId],
    queryFn: async () => {
      if (!activeBusinessId) return [];
      return vehicleService.getVehicles(activeBusinessId);
    },
    enabled: !!activeBusinessId && activeTab === 'vehicles',
    staleTime: 1000 * 60 * 5, 
  });

  const { data: availableFleets = [] } = useQuery({
    queryKey: ['fleets', activeBusinessId],
    queryFn: async () => {
      const response = await api.get(`/v1/fleets?business_id=${activeBusinessId}`);
      return response.data;
    },
    enabled: !!activeBusinessId,
  });

  const updateFleetMutation = useMutation({
    mutationFn: async ({ id, fleetId }: { id: string, fleetId: string | null }) => {
      return vehicleService.updateFleet(id, fleetId);
    },
    onSuccess: () => {
      success('Vehículo reasignado correctamente.', 'Asignación Exitosa');
      queryClient.invalidateQueries({ queryKey: ['vehicles', activeBusinessId] });
    },
    onError: () => {
      error('No se pudo reasignar el vehículo a la flota.', 'Error');
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

  const handleFleetChange = (vehicleId: string, newFleetId: string) => {
    updateFleetMutation.mutate({ id: vehicleId, fleetId: newFleetId || null });
  };

  const handleStatusToggle = (vehicleId: string, currentStatus: Vehicle['status']) => {
    updateStatusMutation.mutate({ id: vehicleId, status: currentStatus === 'active' ? 'maintenance' : 'active' });
  };

  const filteredVehicles = vehicles.filter((v: any) => 
    v.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-20 md:pb-0">
      
      {/* Pestañas de Navegación */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-max">
        <button 
          onClick={() => setActiveTab('vehicles')} 
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'vehicles' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Directorio de Vehículos
        </button>
        <button 
          onClick={() => setActiveTab('fleets')} 
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'fleets' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Gestión de Flotas
        </button>
      </div>

      {activeTab === 'vehicles' ? (
        <>
          {/* Barra de Herramientas (Toolbar) */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-full md:w-96">
              <Input 
                placeholder="Buscar por placa, marca o modelo..." 
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={18} />}
                className="!min-h-[40px]"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" leftIcon={<Filter size={16} />} className="w-full md:w-auto">
                Filtros
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-500">
              <Loader2 className="animate-spin text-primary-500" size={40} />
              <p className="font-semibold">Cargando inventario de flota...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <Card bordered padding="lg" className="py-20 px-8 text-center border-dashed bg-transparent border-gray-300 shadow-none">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6 text-gray-400">
                <Bus size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron vehículos</h3>
              <p className="text-gray-500 max-w-[400px] mx-auto mb-6 leading-relaxed">
                {searchTerm ? 'No hay unidades que coincidan con tu búsqueda.' : 'Tu flota está vacía. Registra las placas de tus unidades para empezar a operar.'}
              </p>
              {!searchTerm && (
                <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>Registrar primer vehículo</Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] items-start">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  availableFleets={availableFleets}
                  isUpdatingFleet={updateFleetMutation.isPending && updateFleetMutation.variables?.id === vehicle.id}
                  isUpdatingStatus={updateStatusMutation.isPending && updateStatusMutation.variables?.id === vehicle.id}
                  onFleetAssign={handleFleetChange}
                  onStatusToggle={handleStatusToggle}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <FleetManager />
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