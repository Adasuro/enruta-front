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
import './RouteCreatorPage.css';

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
    <div className="route-creator-page">
      {/* Botón flotante solo visible en móvil para abrir el formulario */}
      <button 
        className="mobile-form-toggle"
        onClick={() => setIsFormOpen(!isFormOpen)}
      >
        {isFormOpen ? 'Ver Mapa' : 'Configurar Ruta'}
      </button>

      {/* Panel Izquierdo: Formulario */}
      <div className={`route-creator-sidebar ${isFormOpen ? 'open' : ''}`}>
        <div className="route-creator-header">
          <h2>Trazar Nuevo Circuito</h2>
          <p>Define el recorrido circular marcando puntos clave en el mapa.</p>
        </div>

        <div className="form-group" style={{ flexShrink: 0 }}>
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
          
          <div className="ui-input-wrapper">
            <label className="ui-input-label">Color del Circuito</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1.5px solid var(--color-gray-200)', flexShrink: 0 }}>
                  <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)}
                    style={{ position: 'absolute', inset: '-10px', width: '200%', height: '200%', cursor: 'pointer', border: 'none' }}
                  />
              </div>
              <Input 
                value={color}
                onChange={(e) => setColor(e.target.value)}
                leftIcon={<Palette size={16} />}
                style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
              />
            </div>
          </div>
        </div>

        {/* Panel de Puntos de Control */}
        {points.length > 0 && (
          <div className="route-creator-points">
            <h4>Puntos de Control</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {stopsMeta.map(meta => (
                <Card key={meta.index} padding="sm" bordered={true} className={meta.isTerminal ? 'terminal-card' : ''} style={{ borderColor: meta.isTerminal ? color : 'var(--color-gray-100)', borderLeftWidth: '4px', borderLeftColor: meta.isTerminal ? color : 'var(--color-gray-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MapPin size={16} style={{ color: meta.isTerminal ? color : 'var(--color-gray-300)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {meta.streetName}
                        </span>
                        {meta.headingText && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)' }}>Sentido {meta.headingText}</span>
                        )}
                      </div>
                    </div>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}>
                      <input 
                        type="checkbox" 
                        checked={meta.isTerminal} 
                        onChange={() => toggleTerminal(meta.index)}
                        style={{ accentColor: color, width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: meta.isTerminal ? color : 'var(--color-gray-500)' }}>Term.</span>
                    </label>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="route-creator-summary">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Puntos:</span>
                <span style={{ fontWeight: 700, color: points.length < 2 ? 'var(--color-danger)' : 'var(--color-success)' }}>{points.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Terminales:</span>
                <span style={{ fontWeight: 700, color: terminalCount < 2 ? 'var(--color-danger)' : 'var(--color-success)' }}>{terminalCount} / 2</span>
            </div>
          </div>
          
          {(points.length < 2 || terminalCount < 2) && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem', color: 'var(--color-warning)', fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.4 }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} /> 
              <span>{points.length < 2 ? 'Traza al menos 2 puntos.' : 'Marca al menos 2 terminales (inicio/fin).'}</span>
            </div>
          )}
        </div>

        <div className="route-creator-footer">
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
      <div className="route-creator-map-wrapper">
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
