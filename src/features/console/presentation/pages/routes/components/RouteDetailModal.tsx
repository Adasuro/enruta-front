import React from 'react';
import { Bus, Clock, Tag, MapPin, ChevronRight } from 'lucide-react';
import { Modal, Button, Badge, Input } from '../../../../../../components/ui';
import { RouteDetailMap } from '../../../../../../components/ui/Map';

interface RouteStop {
  id: string;
  name: string;
  is_terminal: boolean;
  location: {
    coordinates: [number, number];
  };
}

interface RouteDetail {
  id: string;
  visual_code: string;
  display_name?: string;
  status: string;
  color_primary: string;
  frequency_min?: number;
  fare_rules?: Array<{ fare_amount: string }>;
  paths?: Array<{
    geometry: {
      coordinates: Array<[number, number]>;
    };
    stops: RouteStop[];
  }>;
}

interface RouteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteDetail | null;
}

export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({ isOpen, onClose, route }) => {
  if (!route) return null;

  const currentFare = route.fare_rules?.[0]?.fare_amount || "2.00";
  
  const pathPoints = route.paths?.[0]?.geometry?.coordinates?.map((c: [number, number]) => ({
    lng: c[0],
    lat: c[1]
  })) || [];

  const stops = route.paths?.[0]?.stops || [];
  const isActive = route.status === 'active';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Gestión Operativa: Línea ${route.visual_code}`}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => alert('Próximamente: Guardar cambios operativos')}>
            Guardar Cambios
          </Button>
        </>
      }
    >
      <div className="route-detail-grid">
        {/* Lado Izquierdo: Datos y Controles */}
        <div className="detail-controls">
          <section className="detail-section">
            <h4 className="detail-section-title">Información General</h4>
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">Nombre de Ruta:</span>
                <span className="info-value">{route.display_name || `Línea ${route.visual_code}`}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Estado Operativo:</span>
                <Badge variant={isActive ? 'success' : 'neutral'}>
                    {isActive ? 'EN SERVICIO' : 'EN PAUSA'}
                </Badge>
              </div>
              <div className="info-row">
                <span className="info-label">ID de Sistema:</span>
                <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{route.id}</span>
              </div>
            </div>
          </section>

          <section className="detail-section">
            <h4 className="detail-section-title">Parámetros de Servicio</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                <Input 
                  label="Tarifa General (S/)"
                  type="number"
                  defaultValue={currentFare}
                  leftIcon={<Tag size={16} />}
                />
                <Input 
                  label="Frecuencia (Min)"
                  type="number"
                  defaultValue={route.frequency_min || 5}
                  leftIcon={<Clock size={16} />}
                />
            </div>
          </section>

          <section className="detail-section">
            <h4 className="detail-section-title">Flota Asignada</h4>
            <div className="fleet-list">
              <div className="fleet-item">
                <Bus size={18} color="var(--brand-primary)" />
                <div style={{ flex: 1 }}>
                    <div className="plate-text">W3V-456</div>
                    <div className="model-text">Toyota Hiace 2024</div>
                </div>
                <Badge variant="success" size="sm">ACTIVO</Badge>
                <ChevronRight size={14} style={{ marginLeft: 'var(--spacing-2)', color: 'var(--color-gray-300)' }} />
              </div>
              <Button variant="secondary" fullWidth style={{ marginTop: 'var(--spacing-2)' }}>
                + Vincular Nuevo Vehículo
              </Button>
            </div>
          </section>
        </div>

        {/* Lado Derecho: Mapa Real */}
        <div className="detail-map-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h4 className="detail-section-title">Vista del Recorrido</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '2px' }}>Terminales y paraderos detectados por el motor espacial.</p>
            </div>
            {stops.length > 0 && <Badge variant="info" size="sm">{stops.length} Puntos</Badge>}
          </div>
          
          <div className="detail-map-wrapper">
            <RouteDetailMap 
              points={pathPoints} 
              stops={stops}
              routeColor={route.color_primary} 
            />
          </div>
          
          {stops.length > 0 && (
            <div className="detail-stops-mini-list">
                {stops.filter((s: RouteStop) => s.is_terminal).map((s: RouteStop) => (
                    <div key={s.id} className="stop-entry-item">
                        <MapPin size={12} style={{ color: route.color_primary }} />
                        <span>{s.name}</span>
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
