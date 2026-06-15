import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, MapPin, Palette } from 'lucide-react';
import bearing from '@turf/bearing';
import { point as turfPoint } from '@turf/helpers';
import { RouteCreatorMap } from '../../../../../components/ui/Map/RouteCreatorMap';
import { Button, Input, Card } from '../../../../../components/ui';
import { useNotification } from '../../../../../hooks/useNotification';
import { useAuth } from '../../../../../contexts/AuthContext';
import api from '../../../../../config/api';

interface Point {
  lat: number;
  lng: number;
}

interface StopMetadata {
  index: number;
  streetName: string;
  isTerminal: boolean;
  headingText?: string;
}

export const RouteCreatorPage: React.FC = () => {
  const [visualCode, setVisualCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [color, setColor] = useState('#0b62a0');
  const [points, setPoints] = useState<Point[]>([]);
  const [densePoints, setDensePoints] = useState<Point[]>([]);
  const [stopsMeta, setStopsMeta] = useState<StopMetadata[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false); // For mobile bottom sheet
  
  const { success, error: notifyError } = useNotification();
  const { user, activeBusinessId } = useAuth();

  useEffect(() => {
    const fetchStreetName = async (lat: number, lng: number, index: number) => {
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const address = res.data.address;
        const street = address.road || address.pedestrian || address.neighbourhood || address.suburb || "Calle desconocida";
        
        let headingText = '';
        if (index > 0) {
          const prev = points[index - 1];
          const angle = bearing(turfPoint([prev.lng, prev.lat]), turfPoint([lng, lat]));
          if (angle >= -45 && angle <= 45) headingText = 'Norte';
          else if (angle > 45 && angle < 135) headingText = 'Este';
          else if (angle >= 135 || angle <= -135) headingText = 'Sur';
          else headingText = 'Oeste';
        }

        setStopsMeta(prev => {
          const newMeta = [...prev];
          if (!newMeta.find(m => m.index === index)) {
            newMeta.push({
              index,
              streetName: street,
              isTerminal: index === 0,
              headingText
            });
          }
          return newMeta.sort((a, b) => a.index - b.index);
        });
      } catch (err) {
        console.error("Nominatim error:", err);
      }
    };

    if (points.length > 0 && !stopsMeta.find(m => m.index === points.length - 1)) {
      const lastPoint = points[points.length - 1];
      fetchStreetName(lastPoint.lat, lastPoint.lng, points.length - 1);
    }
    
    if (stopsMeta.length > points.length) {
      setStopsMeta(prev => prev.filter(m => m.index < points.length));
    }
  }, [points, stopsMeta]);


  const toggleTerminal = (index: number) => {
    setStopsMeta(prev => prev.map(meta => 
      meta.index === index ? { ...meta, isTerminal: !meta.isTerminal } : meta
    ));
  };

  const terminalCount = stopsMeta.filter(m => m.isTerminal).length;
  const isFormValid = points.length >= 2 && visualCode.trim() !== '' && terminalCount >= 2;

  const handleSaveRoute = async () => {
    const finalPoints = densePoints.length > 0 ? densePoints : points;
    if (!isFormValid) return;
    setIsSaving(true);
    
    const activeBusiness = user?.businesses?.find(b => b.id === activeBusinessId) || user?.businesses?.[0];
    
    try {
      const payload = {
        business_id: activeBusiness?.id || '', 
        city_id: activeBusiness?.city_id || user?.city_id || '',
        visual_code: visualCode,
        display_name: displayName,
        color_primary: color,
        path: {
          direction: 1, 
          points: finalPoints.map((p, index) => ({
            lat: p.lat,
            lng: p.lng,
            sequence: index + 1
          }))
        },
        stops: stopsMeta.filter(m => m.isTerminal).map(m => ({
          sequence_order: m.index + 1,
          name: m.streetName,
          is_terminal: true
        }))
      };

      await api.post('/routes', payload);

      success('El circuito ha sido procesado y guardado en la base de datos espacial.', '¡Ruta Guardada!');
      setPoints([]);
      setDensePoints([]);
      setStopsMeta([]);
      setVisualCode('');
      setDisplayName('');
      setIsFormOpen(false);
      
    } catch (error: any) {
      console.error("Error guardando la ruta:", error);
      
      let errorMsg = 'Revisa tu conexión o que los IDs sean válidos.';
      if (error.response?.status === 422 && error.response?.data?.errors) {
         const firstErrorKey = Object.keys(error.response.data.errors)[0];
         errorMsg = error.response.data.errors[firstErrorKey][0];
      } else if (error.response?.data?.message) {
         errorMsg = error.response.data.message;
      }
      
      notifyError(errorMsg, 'Error al guardar la ruta');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden relative w-full flex-col md:flex-row">
      {/* Botón flotante solo visible en móvil para abrir el formulario */}
      <button 
        className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary-500 text-white border-none py-3 px-6 rounded-full font-bold shadow-lg cursor-pointer"
        onClick={() => setIsFormOpen(!isFormOpen)}
      >
        {isFormOpen ? 'Ver Mapa' : 'Configurar Ruta'}
      </button>

      {/* Panel Izquierdo: Formulario */}
      <div className={`
        bg-white flex flex-col z-10 overflow-y-auto p-6 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        md:w-[400px] md:min-w-[400px] md:border-r md:border-gray-200 md:h-full md:transform-none md:static
        max-md:absolute max-md:top-0 max-md:left-0 max-md:right-0 max-md:bottom-0 max-md:w-full max-md:h-auto max-md:max-h-[85vh] max-md:mt-auto max-md:rounded-t-2xl max-md:shadow-[0_-4px_20px_rgba(0,0,0,0.15)] max-md:z-40 max-md:pb-20
        ${isFormOpen ? 'max-md:translate-y-0' : 'max-md:translate-y-full'}
      `}>
        <div className="mb-8 shrink-0">
          <h2 className="text-xl font-extrabold text-primary-500 tracking-tight">Trazar Nuevo Circuito</h2>
          <p className="text-sm text-gray-500 mt-1">Define el recorrido circular marcando puntos clave en el mapa.</p>
        </div>

        <div className="flex flex-col gap-4 shrink-0">
          <Input 
            label="Código / Letra Visual" 
            placeholder="Ej. A, 15, W" 
            value={visualCode}
            onChange={(e) => setVisualCode(e.target.value)}
            maxLength={10}
            required
          />
          <Input 
            label="Nombre Descriptivo" 
            placeholder="Ej. Terminal - Centro - Retorno" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 tracking-wider">Color Principal del Letrero (Fondo)</label>
            <div className="flex gap-3 items-center">
              <div className="relative w-12 h-12 rounded-md overflow-hidden border-[1.5px] border-gray-200 shrink-0">
                  <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute -inset-2.5 w-[200%] h-[200%] cursor-pointer border-none"
                  />
              </div>
              <div className="flex-1">
                <Input 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  leftIcon={<Palette size={16} />}
                  className="font-mono uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Puntos de Control */}
        {points.length > 0 && (
          <div className="mt-8 flex-1">
            <h4 className="text-[0.8125rem] font-bold text-gray-400 uppercase tracking-wider mb-4">Puntos de Control</h4>
            
            <div className="flex flex-col gap-2">
              {stopsMeta.map(meta => (
                <Card key={meta.index} padding="sm" bordered={true} className="border-l-4" style={{ borderColor: meta.isTerminal ? color : 'var(--color-gray-100)', borderLeftColor: meta.isTerminal ? color : 'var(--color-gray-200)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <MapPin size={16} style={{ color: meta.isTerminal ? color : 'var(--color-gray-300)' }} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[0.8125rem] font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                          {meta.streetName}
                        </span>
                        {meta.headingText && (
                          <span className="text-xs text-gray-400">Sentido {meta.headingText}</span>
                        )}
                      </div>
                    </div>
                    
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={meta.isTerminal} 
                        onChange={() => toggleTerminal(meta.index)}
                        className="w-4 h-4"
                        style={{ accentColor: color }}
                      />
                      <span className="text-xs font-semibold" style={{ color: meta.isTerminal ? color : 'var(--color-gray-500)' }}>Term.</span>
                    </label>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[0.8125rem]">
                <span className="text-gray-500">Puntos:</span>
                <span className={`font-bold ${points.length < 2 ? 'text-danger-500' : 'text-success-500'}`}>{points.length}</span>
            </div>
            <div className="flex justify-between text-[0.8125rem]">
                <span className="text-gray-500">Terminales:</span>
                <span className={`font-bold ${terminalCount < 2 ? 'text-danger-500' : 'text-success-500'}`}>{terminalCount} / 2</span>
            </div>
          </div>
          
          {(points.length < 2 || terminalCount < 2) && (
            <div className="flex gap-2 mt-3 text-warning text-xs font-medium leading-snug">
              <AlertCircle size={14} className="shrink-0" /> 
              <span>{points.length < 2 ? 'Traza al menos 2 puntos.' : 'Marca al menos 2 terminales (inicio/fin).'}</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <Button 
            variant="primary" 
            fullWidth 
            size="lg"
            onClick={handleSaveRoute}
            isLoading={isSaving}
            disabled={!isFormValid}
            leftIcon={<Save size={20} />}
          >
            Guardar Circuito
          </Button>
        </div>
      </div>

      {/* Panel Derecho: Mapa */}
      <div className="flex-1 relative bg-gray-100 max-md:h-full max-md:w-full">
        <RouteCreatorMap 
          points={points} 
          onPointsChange={setPoints}
          onRouteCalculated={setDensePoints}
          routeColor={color}
        />
      </div>
    </div>
  );
};
