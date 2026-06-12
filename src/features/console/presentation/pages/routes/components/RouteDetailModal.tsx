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
      <div className="flex flex-col md:grid md:grid-cols-[380px_1fr] gap-8">
        {/* Lado Izquierdo: Datos y Controles */}
        <div className="flex flex-col gap-8">
          <section className="flex flex-col">
            <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-4 m-0">Información General</h4>
            <div className="bg-gray-50 p-5 rounded-xl flex flex-col gap-4 border border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-semibold">Nombre de Ruta:</span>
                <span className="font-bold text-gray-900">{route.display_name || `Línea ${route.visual_code}`}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-semibold">Estado Operativo:</span>
                <Badge variant={isActive ? 'success' : 'neutral'}>
                    {isActive ? 'EN SERVICIO' : 'EN PAUSA'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-semibold">ID de Sistema:</span>
                <span className="font-mono text-xs text-gray-500 bg-gray-200/50 px-2 py-1 rounded">{route.id}</span>
              </div>
            </div>
          </section>

          <section className="flex flex-col">
            <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-4 m-0">Parámetros de Servicio</h4>
            <div className="grid grid-cols-2 gap-4">
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

          <section className="flex flex-col">
            <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-4 m-0">Flota Asignada</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors shadow-sm">
                <Bus size={20} className="text-primary-500" />
                <div className="flex-1">
                    <div className="font-mono font-bold text-gray-900 leading-tight">W3V-456</div>
                    <div className="text-xs text-gray-500 font-medium">Toyota Hiace 2024</div>
                </div>
                <Badge variant="success" size="sm">ACTIVO</Badge>
                <ChevronRight size={16} className="ml-1 text-gray-300" />
              </div>
              <Button variant="secondary" fullWidth className="mt-2 border-dashed border-2 border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-primary-300 hover:text-primary-600 transition-all text-gray-600">
                + Vincular Nuevo Vehículo
              </Button>
            </div>
          </section>
        </div>

        {/* Lado Derecho: Mapa Real */}
        <div className="flex flex-col h-full min-h-[500px] border border-gray-200 rounded-xl overflow-hidden shadow-sm relative">
          <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center z-10 shrink-0">
            <div>
                <h4 className="text-sm font-extrabold text-gray-900 m-0">Vista del Recorrido</h4>
                <p className="text-xs text-gray-500 m-0 mt-0.5 font-medium">Terminales y paraderos detectados por el motor espacial.</p>
            </div>
            {stops.length > 0 && <Badge variant="info" size="sm">{stops.length} Puntos</Badge>}
          </div>
          
          <div className="flex-1 w-full bg-gray-100 relative">
            <RouteDetailMap 
              points={pathPoints} 
              stops={stops}
              routeColor={route.color_primary} 
            />
          </div>
          
          {stops.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-white flex gap-3 overflow-x-auto max-w-[calc(100%-2rem)] z-10 [scrollbar-width:none]">
                {stops.filter((s: RouteStop) => s.is_terminal).map((s: RouteStop) => (
                    <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md shadow-sm border border-gray-100 shrink-0 text-sm font-semibold text-gray-700">
                        <MapPin size={14} style={{ color: route.color_primary }} />
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
