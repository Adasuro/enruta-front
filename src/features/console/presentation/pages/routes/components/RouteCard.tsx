import React from 'react';
import { Bus, Settings2, Clock, Tag } from 'lucide-react';
import { Button } from '../../../../../../components/atoms/Button';
import { RoutePreviewSVG } from './RoutePreviewSVG';

interface RouteCardProps {
  route: {
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
            coordinates: number[][];
        }
    }>;
  };
  onManage: (id: string) => void;
  onStatusToggle: (id: string, currentStatus: string) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, onManage, onStatusToggle }) => {
  const currentFare = route.fare_rules?.[0]?.fare_amount || "0.00";
  const isActive = route.status === 'active';

  // Extraer puntos del primer path para el SVG
  const pathPoints = route.paths?.[0]?.geometry?.coordinates?.map(c => ({
    lng: c[0],
    lat: c[1]
  })) || [];

  return (
    <div className="route-card">
      <div className="route-card-visual" style={{ backgroundColor: `${route.color_primary}15` }}>
        <div className="mini-map-placeholder">
          {pathPoints.length > 0 ? (
              <RoutePreviewSVG points={pathPoints} color={route.color_primary} />
          ) : (
              <Bus size={32} style={{ color: route.color_primary, opacity: 0.5 }} />
          )}
          <span className="visual-code-overlay" style={{ backgroundColor: route.color_primary }}>
            {route.visual_code}
          </span>
        </div>
        
        {/* Switch de Estado Operativo */}
        <div className="status-switch-container" title={isActive ? 'Desactivar ruta' : 'Activar ruta'}>
            <label className="switch">
                <input 
                    type="checkbox" 
                    checked={isActive} 
                    onChange={() => onStatusToggle(route.id, route.status)} 
                />
                <span className="slider round"></span>
            </label>
        </div>
      </div>

      <div className="route-card-content">
        <div className="route-info">
          <h3>{route.display_name || `Ruta ${route.visual_code}`}</h3>
          <div className="status-row">
            <span className={`status-dot ${isActive ? 'active' : 'pending'}`}></span>
            <span className="status-text">
              {isActive ? 'En Servicio' : 'Inactiva / Revisión'}
            </span>
          </div>
        </div>

        <div className="route-stats-grid">
          <div className="stat-item" title="Tarifa Base">
            <Tag size={14} />
            <span className="stat-value">S/ {currentFare}</span>
            <span className="stat-label">Pasaje</span>
          </div>
          <div className="stat-item" title="Frecuencia Estimada">
            <Clock size={14} />
            <span className="stat-value">{route.frequency_min || '--'} m</span>
            <span className="stat-label">Frecuencia</span>
          </div>
          <div className="stat-item" title="Buses en esta ruta">
            <Bus size={14} />
            <span className="stat-value">{route.vehicles_count || 0}</span>
            <span className="stat-label">Flota</span>
          </div>
        </div>

        <div className="route-actions">
          <Button variant="secondary" fullWidth onClick={() => onManage(route.id)}>
            <Settings2 size={16} /> Gestionar Operación
          </Button>
        </div>
      </div>
    </div>
  );
};
