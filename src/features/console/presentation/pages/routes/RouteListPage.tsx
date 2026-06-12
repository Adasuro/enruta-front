import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Loader2, Route as RouteIcon } from 'lucide-react';
import { Input, Button, Card } from '../../../../../components/ui';
import { RouteCard } from './components/RouteCard';
import { RouteDetailModal } from './components/RouteDetailModal';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useNotification } from '../../../../../hooks/useNotification';
import api from '../../../../../config/api';

export const RouteListPage: React.FC = () => {
  const { activeBusinessId } = useAuth();
  const queryClient = useQueryClient();
  const { success, error } = useNotification();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // Fetch routes for this business
  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['routes', activeBusinessId],
    queryFn: async () => {
      const response = await api.get('/routes');
      return response.data.data;
    },
    enabled: !!activeBusinessId,
  });

  // Mutation to toggle status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const newStatus = status === 'active' ? 'inactive' : 'active';
      const response = await api.patch(`/routes/${id}/status`, { status: newStatus });
      return response.data.data;
    },
    onSuccess: (data: any) => {
      success(`La ruta está ahora ${data?.status === 'active' ? 'en servicio' : 'en pausa'}.`, 'Estado Actualizado');
      queryClient.invalidateQueries({ queryKey: ['routes', activeBusinessId] });
    },
    onError: () => {
      error('No se pudo actualizar el estado de la ruta.', 'Error Operativo');
    }
  });

  const handleStatusToggle = (id: string, currentStatus: string) => {
    updateStatusMutation.mutate({ id, status: currentStatus });
  };

  const filteredRoutes = routes.filter((r: any) => 
    r.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.visual_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRoute = routes.find((r: any) => r.id === selectedRouteId) || null;

  const { data: availableFleets = [] } = useQuery({
    queryKey: ['fleets', activeBusinessId],
    queryFn: async () => {
      const response = await api.get(`/v1/fleets?business_id=${activeBusinessId}`);
      return response.data;
    },
    enabled: !!activeBusinessId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-500">
        <Loader2 className="animate-spin text-primary-500" size={40} />
        <p className="font-semibold">Cargando malla de rutas...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-20 md:pb-0">
      {/* Barra de Herramientas (Toolbar) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="w-full md:w-96">
          <Input 
            placeholder="Buscar por nombre o código..." 
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
            className="!min-h-[40px]" // Sobrescribir min-height
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" leftIcon={<Filter size={16} />} className="w-full md:w-auto">
            Filtros
          </Button>
        </div>
      </div>

      {/* Grid de Rutas */}
      {filteredRoutes.length === 0 ? (
        <Card bordered padding="lg" className="py-20 px-8 text-center border-dashed bg-transparent border-gray-300 shadow-none">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6 text-gray-400">
            <RouteIcon size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron rutas</h3>
          <p className="text-gray-500 max-w-[400px] mx-auto mb-6 leading-relaxed">
            {searchTerm ? 'No hay rutas que coincidan con tu búsqueda.' : 'Aún no tienes circuitos operativos trazados en el sistema.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] items-start">
          {filteredRoutes.map((route: any) => (
            <RouteCard 
              key={route.id} 
              route={route} 
              onManage={(id: string) => setSelectedRouteId(id)}
              onStatusToggle={handleStatusToggle}
            />
          ))}
        </div>
      )}

      {/* Modal Detalle */}
      <RouteDetailModal 
        isOpen={!!selectedRouteId} 
        onClose={() => setSelectedRouteId(null)} 
        route={selectedRoute} 
        availableFleets={availableFleets}
      />
    </div>
  );
};
