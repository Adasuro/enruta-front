import React from 'react';
import { Bus, Clock, Tag, MapPin, ChevronRight } from 'lucide-react';
import { Modal } from '../../../../../../components/atoms/Modal';
import { Button } from '../../../../../../components/atoms/Button';
import { RouteDetailMap } from '../../../components/maps/RouteDetailMap';
import './RouteDetailModal.css';

interface RouteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: any;
}

export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({ isOpen, onClose, route }) => {
  if (!route) return null;

  const currentFare = route.fare_rules?.[0]?.fare_amount || "2.00";
  
  const pathPoints = route.paths?.[0]?.geometry?.coordinates?.map((c: any) => ({
    lng: c[0],
    lat: c[1]
  })) || [];

  const stops = route.paths?.[0]?.stops || [];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Centro de Control: Ruta ${route.visual_code}`}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
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
                <span className={`status-pill ${route.status === 'active' ? 'active' : 'pending'}`}>
                  {route.status === 'active' ? 'EN SERVICIO' : 'EN PAUSA'}
                </span>
              </div>
            </div>
          </section>

          <section className="detail-section">
            <h4 className="detail-section-title">Finanzas y Frecuencia</h4>
            <div className="control-group">
              <label className="detail-field-label"><Tag size={16} /> Pasaje General (S/)</label>
              <input type="number" step="0.10" defaultValue={currentFare} className="detail-input" />
            </div>
            <div className="control-group">
              <label className="detail-field-label"><Clock size={16} /> Frecuencia Estimada (Min)</label>
              <input type="number" defaultValue={route.frequency_min || 5} className="detail-input" />
            </div>
          </section>

          <section className="detail-section">
            <h4 className="detail-section-title">Flota Vinculada</h4>
            <div className="fleet-list">
              <div className="fleet-item">
                <Bus size={16} />
                <span className="plate-text">W3V-456</span>
                <span className="model-text">Toyota Hiace 2024</span>
                <ChevronRight size={14} className="ml-auto text-muted" />
              </div>
              <Button variant="secondary" fullWidth style={{ marginTop: '10px' }}>
                + Vincular Vehículo a esta Ruta
              </Button>
            </div>
          </section>
        </div>

        {/* Lado Derecho: Mapa Real */}
        <div className="detail-map-panel">
          <div className="detail-map-header">
            <h4 className="detail-section-title">Verificación de Trazado</h4>
            <p className="text-sm text-muted">Mapa interactivo con paraderos y terminales oficiales.</p>
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
                <h5 className="text-xs uppercase font-bold text-muted mb-2">Terminales Detectados</h5>
                {stops.filter((s: any) => s.is_terminal).map((s: any) => (
                    <div key={s.id} className="stop-entry-item">
                        <MapPin size={12} color={route.color_primary} />
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
