import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, Bus } from 'lucide-react';
import { Button } from '../../../../../components/ui';
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
}

export const B2BRoutesPage: React.FC = () => {
  const { info, success, error, warning } = useNotification();
  const [routes, setRoutes] = useState<FleetRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<FleetRoute | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRoutes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/routes');
      setRoutes(response.data.data);
    } catch (err) {
      error('No pudimos sincronizar tus rutas operativas.', 'Error de Conexión');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) await fetchRoutes();
    };
    load();
    return () => { isMounted = false; };
  }, [fetchRoutes]);

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
        await api.patch(`/routes/${id}/status`, { status: newStatus });
        
        setRoutes(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        
        if (newStatus === 'active') {
            success('Ruta activada. Ahora es visible para los turistas.', 'Ruta en Línea');
        } else {
            warning('Ruta desactivada. Se ha ocultado de los resultados de búsqueda.', 'Ruta Fuera de Servicio');
        }
    } catch {
        error('No se pudo cambiar el estado de la ruta en el servidor.', 'Error de Actualización');
    }
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
      <div className="loading-state">
        <Loader2 className="animate-spin" size={40} color="var(--color-primary-500)" />
        <p>Sincronizando flotas...</p>
      </div>
    );
  }

  return (
    <div className="b2b-routes-layout">
      <div className="b2b-header">
        <div>
          <h2>Panel de Operaciones</h2>
          <p className="text-muted">Gestiona el rendimiento, tarifas y vehículos de tus rutas en tiempo real.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => info('Cargando catálogo maestro...', 'Nueva Concesión')}
          leftIcon={<Plus size={18} />}
        >
          Nueva Concesión
        </Button>
      </div>

      <div className="routes-grid">
        {routes.map((route) => (
          <RouteCard 
            key={route.id} 
            route={route} 
            onManage={handleManage}
            onStatusToggle={handleStatusToggle}
          />
        ))}

        {routes.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
               <Bus size={48} />
            </div>
            <h3>Tu flota está vacía</h3>
            <p>Aún no tienes rutas operativas vinculadas a tu empresa. Empieza trazando una o solicita una concesión.</p>
          </div>
        )}
      </div>

      <RouteDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        route={selectedRoute} 
      />
    </div>
  );
};
