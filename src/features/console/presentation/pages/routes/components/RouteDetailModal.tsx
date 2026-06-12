import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bus, Clock, Tag, MapPin, Trash2, Check } from 'lucide-react';
import { Modal, Button, Badge, Input } from '../../../../../../components/ui';
import { RouteDetailMap } from '../../../../../../components/ui/Map';
import api from '../../../../../../config/api';
import { useNotification } from '../../../../../../hooks/useNotification';

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
  business_id: string;
  visual_code: string;
  display_name?: string;
  status: string;
  color_primary: string;
  frequency_min?: number;
  fare_rules?: Array<{ fare_amount: string }>;
  fleets?: Array<{ id: string; name: string; status: string; vehicles_count: number }>;
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
  availableFleets?: Array<{ id: string; name: string }>;
}

export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({ isOpen, onClose, route, availableFleets = [] }) => {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();
  
  const [isLinking, setIsLinking] = useState(false);
  const [selectedFleetIds, setSelectedFleetIds] = useState<string[]>([]);
  
  const [frequencyMin, setFrequencyMin] = useState<number | string>(5);
  const [fareAmount, setFareAmount] = useState<number | string>("2.00");

  useEffect(() => {
    if (route) {
      setFrequencyMin(route.frequency_min || 5);
      setFareAmount(route.fare_rules?.[0]?.fare_amount || "2.00");
    }
  }, [route]);

  const attachMutation = useMutation({
    mutationFn: async (fleetIds: string[]) => {
      await api.post(`/routes/${route?.id}/fleets`, { fleet_ids: fleetIds });
    },
    onSuccess: () => {
      success('Flotas vinculadas exitosamente a la ruta.', 'Vinculación Exitosa');
      queryClient.invalidateQueries({ queryKey: ['routes', route?.business_id] });
      setIsLinking(false);
      setSelectedFleetIds([]);
    },
    onError: () => error('Error al vincular las flotas.', 'Error')
  });

  const detachMutation = useMutation({
    mutationFn: async (fleetId: string) => {
      await api.delete(`/routes/${route?.id}/fleets/${fleetId}`);
    },
    onSuccess: () => {
      success('Flota desvinculada de la ruta.', 'Desvinculación Exitosa');
      queryClient.invalidateQueries({ queryKey: ['routes', route?.business_id] });
    },
    onError: () => error('Error al desvincular la flota.', 'Error')
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/routes/${route?.id}`, {
        frequency_min: Number(frequencyMin),
        fare_amount: Number(fareAmount)
      });
    },
    onSuccess: () => {
      success('Parámetros operativos guardados correctamente.', 'Guardado Exitoso');
      queryClient.invalidateQueries({ queryKey: ['routes', route?.business_id] });
      onClose();
    },
    onError: () => error('Error al guardar los cambios operativos.', 'Error')
  });

  if (!route) return null;

  const pathPoints = route.paths?.[0]?.geometry?.coordinates?.map((c: [number, number]) => ({
    lng: c[0],
    lat: c[1]
  })) || [];

  const stops = route.paths?.[0]?.stops || [];
  const fleets = route.fleets || [];
  const isActive = route.status === 'active';

  const unassignedFleets = availableFleets.filter(af => !fleets.some(f => f.id === af.id));

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Gestión Operativa: Línea ${route.visual_code}`}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancelar</Button>
          <Button 
            variant="primary" 
            onClick={() => updateMutation.mutate()} 
            isLoading={updateMutation.isPending}
            className="w-full sm:w-auto"
          >
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
            <div className="bg-gray-50 p-4 md:p-5 rounded-xl flex flex-col gap-4 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1">
                <span className="text-gray-500 font-semibold">Nombre de Ruta:</span>
                <span className="font-bold text-gray-900">{route.display_name || `Línea ${route.visual_code}`}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
                <span className="text-gray-500 font-semibold">Estado Operativo:</span>
                <div className="self-start">
                  <Badge variant={isActive ? 'success' : 'neutral'}>
                      {isActive ? 'EN SERVICIO' : 'EN PAUSA'}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1">
                <span className="text-gray-500 font-semibold">ID de Sistema:</span>
                <span className="font-mono text-xs text-gray-500 bg-gray-200/50 px-2 py-1 rounded w-fit">{route.id}</span>
              </div>
            </div>
          </section>

          <section className="flex flex-col">
            <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-4 m-0">Parámetros de Servicio</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Tarifa General (S/)"
                  type="number"
                  value={fareAmount}
                  onChange={(e) => setFareAmount(e.target.value)}
                  leftIcon={<Tag size={16} />}
                />
                <Input 
                  label="Frecuencia (Min)"
                  type="number"
                  value={frequencyMin}
                  onChange={(e) => setFrequencyMin(e.target.value)}
                  leftIcon={<Clock size={16} />}
                />
            </div>
          </section>

          <section className="flex flex-col">
            <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-4 m-0">Flotas Operativas</h4>
            <div className="flex flex-col gap-2">
              {fleets.map(fleet => (
                <div key={fleet.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <Bus size={20} className="text-primary-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 leading-tight truncate">{fleet.name}</div>
                      <div className="text-xs text-gray-500 font-medium truncate">{fleet.vehicles_count} vehículos asignados</div>
                  </div>
                  <div className="shrink-0 flex items-center">
                    <Badge variant={fleet.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                      {fleet.status === 'ACTIVE' ? 'ACTIVA' : 'INACTIVA'}
                    </Badge>
                  </div>
                  <button 
                    onClick={() => {
                      if (window.confirm('¿Desvincular esta flota de la ruta?')) {
                        detachMutation.mutate(fleet.id);
                      }
                    }}
                    disabled={detachMutation.isPending}
                    className="ml-1 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 shrink-0 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              {fleets.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                  No hay flotas asignadas a esta ruta
                </div>
              )}
              
              {isLinking ? (
                <div className="flex flex-col gap-2 mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-1">
                    {unassignedFleets.map(f => (
                      <label key={f.id} className="flex items-center gap-3 text-sm cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedFleetIds.includes(f.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedFleetIds([...selectedFleetIds, f.id]);
                            else setSelectedFleetIds(selectedFleetIds.filter(id => id !== f.id));
                          }}
                          className="w-4 h-4 rounded text-primary-500 border-gray-300 focus:ring-primary-500 cursor-pointer"
                        />
                        <span className="font-medium text-gray-700">{f.name}</span>
                      </label>
                    ))}
                    {unassignedFleets.length === 0 && (
                      <p className="text-xs text-gray-500 text-center">No hay más flotas disponibles para asignar.</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { setIsLinking(false); setSelectedFleetIds([]); }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      disabled={selectedFleetIds.length === 0 || attachMutation.isPending}
                      onClick={() => attachMutation.mutate(selectedFleetIds)}
                      className="flex-1"
                    >
                      <Check size={16} className="mr-1" /> Vincular
                    </Button>
                  </div>
                </div>
              ) : (
                unassignedFleets.length > 0 && (
                  <Button 
                    variant="secondary" 
                    fullWidth 
                    onClick={() => setIsLinking(true)}
                    className="mt-2 border-dashed border-2 border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-primary-300 hover:text-primary-600 transition-all text-gray-600"
                  >
                    + Vincular Flota(s)
                  </Button>
                )
              )}
            </div>
          </section>
        </div>

        {/* Lado Derecho: Mapa Real */}
        <div className="flex flex-col h-[400px] md:h-full md:min-h-[500px] border border-gray-200 rounded-xl overflow-hidden shadow-sm relative">
          <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center z-10 shrink-0">
            <div>
                <h4 className="text-sm font-extrabold text-gray-900 m-0">Vista del Recorrido</h4>
                <p className="text-xs text-gray-500 m-0 mt-0.5 font-medium">Terminales y paraderos detectados por el motor espacial.</p>
            </div>
            {stops.length > 0 && (
              <div className="hidden sm:flex items-center">
                <Badge variant="info" size="sm">{stops.length} Puntos</Badge>
              </div>
            )}
          </div>
          
          <div className="flex-1 w-full bg-gray-100 relative min-h-[300px]">
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
                        <span className="whitespace-nowrap">{s.name}</span>
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
