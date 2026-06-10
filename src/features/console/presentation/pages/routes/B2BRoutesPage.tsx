import React, { useState } from 'react';
import { Plus, Loader2, Bus, LayoutGrid } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardBody } from '../../../../../components/ui';
import { useNotification } from '../../../../../hooks/useNotification';
import { RouteCard } from './components/RouteCard';
import { RouteDetailModal } from './components/RouteDetailModal';
import api from '../../../../../config/api';
import './B2BRoutesPage.css';

interface FleetRoute {
  id: string;
  visual_code: string;
  display_name: string;
  color_primary: string;
  status: string;
  frequency_min?: number;
  vehicles_count?: number;
  fare_rules?: Array<{
    fare_amount: string;
  }>;
  paths?: Array<{
    geometry: {
        coordinates: [number, number][];
    };
    stops: any[];
  }>;
}

export const B2BRoutesPage: React.FC = () => {
  const { info, success, error, warning } = useNotification();
  const [selectedRoute, setSelectedRoute] = useState<FleetRoute | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: routes = [], isLoading, isError } = useQuery<FleetRoute[]>({
    queryKey: ['routes'],
    queryFn: async () => {
      const response = await api.get('/routes');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string, newStatus: string }) => {
      await api.patch(`/routes/${id}/status`, { status: newStatus });
      return { id, newStatus };
    },
    onMutate: async ({ id, newStatus }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['routes'] });
      const previousRoutes = queryClient.getQueryData<FleetRoute[]>(['routes']);
      
      queryClient.setQueryData<FleetRoute[]>(['routes'], old => 
        old?.map(route => route.id === id ? { ...route, status: newStatus } : route)
      );

      return { previousRoutes };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousRoutes) {
        queryClient.setQueryData(['routes'], context.previousRoutes);
      }
      error('No se pudo cambiar el estado de la ruta en el servidor.', 'Error de Actualización');
    },
    onSuccess: (data) => {
      if (data.newStatus === 'active') {
        success('Ruta activada. Ahora es visible para los turistas.', 'Ruta en Línea');
      } else {
        warning('Ruta desactivada. Se ha ocultado de los resultados de búsqueda.', 'Ruta Fuera de Servicio');
      }
      // Re-fetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    }
  });

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({ id, newStatus });
  };

  const handleManage = (id: string) => {
    const route = routes.find(r => r.id === id);
    if (route) {
        setSelectedRoute(route);
        setIsModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="b2b-routes-loading">
        <Loader2 className="animate-spin" size={40} color="var(--brand-primary)" />
        <p style={{ fontWeight: 600 }}>Sincronizando flotas...</p>
      </div>
    );
  }

  if (isError) {
    // Handling error gracefully instead of just throwing toast
    error('No pudimos sincronizar tus rutas operativas.', 'Error de Conexión');
  }

  return (
    <div className="b2b-routes-page">
      <header className="b2b-routes-header">
        <div>
          <div className="b2b-routes-header-badge">
            <LayoutGrid size={20} color="var(--brand-primary)" />
            <span>Gestión de Flota</span>
          </div>
          <h2>Panel de Operaciones</h2>
          <p>Gestiona el rendimiento, tarifas y vehículos en tiempo real.</p>
        </div>
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => info('Cargando catálogo maestro...', 'Nueva Concesión')}
          leftIcon={<Plus size={20} />}
          className="b2b-routes-new-btn"
        >
          Nueva Concesión
        </Button>
      </header>

      <div className="b2b-routes-grid">
        {routes.map((route) => (
          <RouteCard 
            key={route.id} 
            route={route} 
            onManage={handleManage}
            onStatusToggle={handleStatusToggle}
          />
        ))}

        {routes.length === 0 && (
          <div className="b2b-routes-empty-state">
              <Card bordered padding="none" className="empty-state-card">
                <CardBody className="empty-state-body">
                    <div className="empty-state-icon">
                        <Bus size={40} />
                    </div>
                    <div className="empty-state-text">
                        <h3>Tu flota está vacía</h3>
                        <p>Aún no tienes rutas operativas vinculadas a tu empresa. Empieza trazando una o solicita una concesión.</p>
                    </div>
                    <Button variant="outline" onClick={() => window.location.href='/console/routes/editor'}>Ir al Creador de Rutas</Button>
                </CardBody>
              </Card>
          </div>
        )}
      </div>

      <RouteDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        route={selectedRoute as any} 
      />
    </div>
  );
};
