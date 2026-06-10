import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, Bus, LayoutGrid } from 'lucide-react';
import { Button, Card, CardBody } from '../../../../../components/ui';
import { useNotification } from '../../../../../hooks/useNotification';
import { RouteCard } from './components/RouteCard';
import { RouteDetailModal } from './components/RouteDetailModal';
import api from '../../../../../config/api';

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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--color-gray-500)' }}>
        <Loader2 className="animate-spin" size={40} color="var(--brand-primary)" />
        <p style={{ fontWeight: 600 }}>Sincronizando flotas...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <LayoutGrid size={20} color="var(--brand-primary)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Gestión de Flota</span>
          </div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-gray-900)', letterSpacing: '-0.02em' }}>Panel de Operaciones</h2>
          <p style={{ color: 'var(--color-gray-500)', marginTop: '0.25rem', fontSize: '1rem' }}>Gestiona el rendimiento, tarifas y vehículos en tiempo real.</p>
        </div>
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => info('Cargando catálogo maestro...', 'Nueva Concesión')}
          leftIcon={<Plus size={20} />}
        >
          Nueva Concesión
        </Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {routes.map((route) => (
          <RouteCard 
            key={route.id} 
            route={route} 
            onManage={handleManage}
            onStatusToggle={handleStatusToggle}
          />
        ))}

        {routes.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '5rem 2rem' }}>
              <Card bordered padding="none" style={{ borderStyle: 'dashed', backgroundColor: 'transparent' }}>
                <CardBody style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem', padding: '4rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-400)' }}>
                        <Bus size={40} />
                    </div>
                    <div style={{ maxWidth: '400px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '0.5rem' }}>Tu flota está vacía</h3>
                        <p style={{ color: 'var(--color-gray-500)', lineHeight: 1.6 }}>Aún no tienes rutas operativas vinculadas a tu empresa. Empieza trazando una o solicita una concesión.</p>
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
