import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Save, Plus, Trash2, CreditCard, MapPin, ArrowRight } from 'lucide-react';
import { Input, Button, Card, Select, IconButton, Badge } from '../../../../../components/ui';
import { FareEditorMap } from '../../../../../components/ui/Map/FareEditorMap';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useNotification } from '../../../../../hooks/useNotification';
import api from '../../../../../config/api';

export const FareManagerPage: React.FC = () => {
  const { activeBusinessId } = useAuth();
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotification();
  
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [flatFare, setFlatFare] = useState<string>('1.50');
  
  // Dynamic Segment State
  const [startStopId, setStartStopId] = useState<string>('');
  const [endStopId, setEndStopId] = useState<string>('');
  const [segmentFare, setSegmentFare] = useState<string>('');
  const [segmentName, setSegmentName] = useState<string>('');

  // Fetch routes for selection
  const { data: routesResponse } = useQuery({
    queryKey: ['routes', activeBusinessId],
    queryFn: async () => {
      const response = await api.get('/routes');
      return response.data.data;
    },
    enabled: !!activeBusinessId,
  });
  const routes = routesResponse || [];

  // Fetch current route detail (including stops and fares)
  const { data: routeDetailResponse, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['route-detail', selectedRouteId],
    queryFn: async () => {
      const response = await api.get(`/routes/${selectedRouteId}`);
      return response.data.data;
    },
    enabled: !!selectedRouteId,
  });
  const routeDetail = routeDetailResponse || null;

  const updateFlatFareMutation = useMutation({
    mutationFn: async (amount: number) => {
      return api.post(`/v1/routes/${selectedRouteId}/fares/flat`, { fare_amount: amount });
    },
    onSuccess: () => {
      success('La tarifa plana ha sido actualizada para toda la ruta.', 'Tarifa Actualizada');
      queryClient.invalidateQueries({ queryKey: ['route-detail', selectedRouteId] });
    },
    onError: (err: any) => {
      notifyError(err.response?.data?.message || 'Error al actualizar la tarifa.');
    }
  });

  const createSegmentFareMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post(`/v1/routes/${selectedRouteId}/fares`, data);
    },
    onSuccess: () => {
      success('Se ha creado una nueva regla de tramo.', 'Segmento Guardado');
      setStartStopId('');
      setEndStopId('');
      setSegmentFare('');
      setSegmentName('');
      queryClient.invalidateQueries({ queryKey: ['route-detail', selectedRouteId] });
    },
    onError: (err: any) => {
      notifyError(err.response?.data?.message || 'Error al crear la regla.');
    }
  });

  const deleteFareMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/v1/fares/${id}`);
    },
    onSuccess: () => {
      success('La regla de tarifa ha sido eliminada.', 'Regla Eliminada');
      queryClient.invalidateQueries({ queryKey: ['route-detail', selectedRouteId] });
    },
    onError: (err: any) => {
      notifyError(err.response?.data?.message || 'Error al eliminar.');
    }
  });

  const handleRouteSelect = (id: string) => {
    setSelectedRouteId(id);
    const route = routes.find((r: any) => r.id === id);
    // Find the 'General' fare rule if it exists in the simplified list
    // (Note: routeDetail has the full list, routes only has latest)
    const flat = route?.fare_rules?.find((f: any) => f.zone_name === 'General');
    if (flat) {
      setFlatFare(flat.fare_amount);
    } else {
      setFlatFare('1.50');
    }
  };

  const handleStopSelectFromMap = (stopId: string) => {
    if (!startStopId || (startStopId && endStopId)) {
        setStartStopId(stopId);
        setEndStopId('');
    } else if (startStopId && !endStopId) {
        if (stopId === startStopId) {
            setStartStopId('');
        } else {
            setEndStopId(stopId);
            // Auto-generate a name
            const start = routeDetail.paths[0].stops.find((s: any) => s.id === startStopId);
            const end = routeDetail.paths[0].stops.find((s: any) => s.id === stopId);
            setSegmentName(`${start.name} ➔ ${end.name}`);
        }
    }
  };

  const handleCreateSegment = () => {
      if (!startStopId || !endStopId || !segmentFare) return;
      createSegmentFareMutation.mutate({
          zone_name: segmentName,
          fare_amount: parseFloat(segmentFare),
          from_stop_id: startStopId,
          to_stop_id: endStopId
      });
  };

  const stops = routeDetail?.paths?.[0]?.stops || [];
  const terminalStops = stops.filter((s: any) => s.is_terminal === true);
  const fares = routeDetail?.fare_rules || [];
  const flatRule = fares.find((f: any) => f.zone_name === 'General');
  const segmentRules = fares.filter((f: any) => f.zone_name !== 'General');

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto w-full pb-20 md:pb-0">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500 shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Gestor de Tarifas</h2>
            <p className="text-sm text-gray-500">Configura cuánto cuesta viajar en cada uno de tus circuitos.</p>
          </div>
        </div>
        
        <div className="w-full md:w-80">
          <Select 
            label="Selecciona una Ruta"
            value={selectedRouteId}
            onChange={(e) => handleRouteSelect(e.target.value)}
            options={[
              { value: '', label: 'Seleccionar ruta...' },
              ...routes.map((r: any) => ({
                value: r.id,
                label: `(${r.visual_code}) ${r.display_name || 'Sin nombre'}`
              }))
            ]}
          />
        </div>
      </div>

      {!selectedRouteId ? (
        <Card bordered padding="lg" className="py-20 px-8 text-center border-dashed bg-white border-gray-300 shadow-none">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6 text-gray-300">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Selecciona una ruta para empezar</h3>
          <p className="text-gray-500 max-w-[400px] mx-auto leading-relaxed">
            Debes elegir un circuito de la lista superior para configurar sus reglas de cobro.
          </p>
        </Card>
      ) : isLoadingDetail ? (
        <div className="py-20 text-center text-gray-500 font-bold animate-pulse">Cargando detalles de ruta y paraderos...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel Izquierdo: Controles */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Tarifa Plana */}
            <Card bordered padding="lg" className="bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center text-success-600">
                  <Save size={18} />
                </div>
                <h4 className="font-bold text-gray-900">Tarifa Plana (Base)</h4>
              </div>
              
              <div className="flex flex-col gap-4">
                <Input 
                  label="Monto General (S/)"
                  type="number"
                  step="0.10"
                  value={flatFare}
                  onChange={(e) => setFlatFare(e.target.value)}
                  placeholder="1.50"
                />
                <Button 
                  fullWidth 
                  variant="primary" 
                  onClick={() => updateFlatFareMutation.mutate(parseFloat(flatFare))}
                  isLoading={updateFlatFareMutation.isPending}
                  leftIcon={<Save size={18} />}
                >
                  Actualizar Base
                </Button>
              </div>
            </Card>

            {/* Nuevo Segmento */}
            <Card bordered padding="lg" className="bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                  <Plus size={18} />
                </div>
                <h4 className="font-bold text-gray-900">Nuevo Tramo</h4>
              </div>

              <div className="flex flex-col gap-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                        <MapPin size={12} className="text-success-500" /> Origen: 
                        <span className="text-gray-900 truncate">{startStopId ? stops.find((s: any) => s.id === startStopId)?.name : 'Toca el mapa'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                        <MapPin size={12} className="text-danger-500" /> Destino: 
                        <span className="text-gray-900 truncate">{endStopId ? stops.find((s: any) => s.id === endStopId)?.name : 'Toca el mapa'}</span>
                    </div>
                </div>

                <Input 
                  label="Nombre del Tramo"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  placeholder="Ej. Interurbano"
                  disabled={!startStopId || !endStopId}
                />

                <Input 
                  label="Precio Especial (S/)"
                  type="number"
                  step="0.10"
                  value={segmentFare}
                  onChange={(e) => setSegmentFare(e.target.value)}
                  placeholder="2.00"
                  disabled={!startStopId || !endStopId}
                />

                <Button 
                  fullWidth 
                  variant="outline" 
                  onClick={handleCreateSegment}
                  isLoading={createSegmentFareMutation.isPending}
                  disabled={!startStopId || !endStopId || !segmentFare}
                  leftIcon={<Plus size={18} />}
                >
                  Crear Regla
                </Button>
              </div>
            </Card>
          </div>

          {/* Panel Derecho: Mapa y Listado */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Mapa de Selección */}
            <Card bordered padding="none" className="bg-white overflow-hidden h-[450px]">
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-3 rounded-xl border border-gray-200 shadow-sm max-w-[200px]">
                    <p className="text-[0.6875rem] font-bold text-gray-600 leading-tight">
                        Toca dos paraderos en el mapa para definir un tramo con precio especial.
                    </p>
                </div>
                <FareEditorMap 
                    geometry={routeDetail.paths[0].geometry}
                    stops={terminalStops.map((s: any) => {
                        // Handle EloquentSpatial Point format { type: 'Point', coordinates: [lng, lat] }
                        const [lng, lat] = s.location.coordinates;
                        return {
                            id: s.id,
                            name: s.name,
                            location: {
                                latitude: lat,
                                longitude: lng
                            },
                            is_terminal: s.is_terminal
                        };
                    })}
                    routeColor={routeDetail.color_primary}
                    selectedStartStopId={startStopId}
                    selectedEndStopId={endStopId}
                    onStopSelect={handleStopSelectFromMap}
                />
            </Card>

            {/* Listado de Reglas */}
            <Card bordered padding="none" className="bg-white overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h4 className="font-bold text-gray-900 text-sm">Reglas de Cobro Activas</h4>
                    <Badge variant="neutral">{fares.length} Reglas</Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="text-gray-400 uppercase text-[0.625rem] tracking-widest border-b border-gray-100">
                                <th className="px-6 py-3 font-bold">Concepto / Tramo</th>
                                <th className="px-6 py-3 font-bold text-right">Monto</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {/* Flat Fare Row */}
                            {flatRule && (
                                <tr className="bg-success-50/20">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-success-500"></div>
                                            <span className="font-bold text-gray-900">Tarifa Plana (Global)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-success-700 font-mono">
                                        S/ {parseFloat(flatRule.fare_amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-[0.625rem] font-bold text-gray-400 uppercase">Principal</span>
                                    </td>
                                </tr>
                            )}

                            {/* Segment Rules */}
                            {segmentRules.map((rule: any) => {
                                const fromStop = stops.find((s: any) => s.id === rule.from_stop_id);
                                const toStop = stops.find((s: any) => s.id === rule.to_stop_id);
                                
                                return (
                                    <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-xs uppercase tracking-tight mb-1">{rule.zone_name}</span>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <span className="truncate max-w-[120px]">{fromStop?.name || 'Origen'}</span>
                                                    <ArrowRight size={10} className="shrink-0" />
                                                    <span className="truncate max-w-[120px]">{toStop?.name || 'Destino'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-primary-600 font-mono">
                                            S/ {parseFloat(rule.fare_amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <IconButton 
                                                icon={<Trash2 size={16} />} 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-danger-500 hover:bg-danger-50"
                                                onClick={() => deleteFareMutation.mutate(rule.id)}
                                                isLoading={deleteFareMutation.isPending}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}

                            {segmentRules.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">
                                        No hay reglas de tramos específicas creadas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
