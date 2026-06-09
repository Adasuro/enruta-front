import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, MapPin } from 'lucide-react';
import bearing from '@turf/bearing';
import { point as turfPoint } from '@turf/helpers';
import { RouteCreatorMap } from '../../components/maps/RouteCreatorMap';
import { Input } from '../../../../../components/atoms/Input';
import { Button } from '../../../../../components/atoms/Button';
import { useNotification } from '../../../../../contexts/NotificationContext';
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
  
  const { success, error: notifyError } = useNotification();

  // Cada vez que points cambia (se añade un punto), hacemos reverse geocoding
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
          // Convertir el angle a texto cardinal simple
          if (angle >= -45 && angle <= 45) headingText = 'Norte';
          else if (angle > 45 && angle < 135) headingText = 'Este';
          else if (angle >= 135 || angle <= -135) headingText = 'Sur';
          else headingText = 'Oeste';
        }

        setStopsMeta(prev => {
          const newMeta = [...prev];
          // Solo lo añadimos si no existe
          if (!newMeta.find(m => m.index === index)) {
            newMeta.push({
              index,
              streetName: street,
              isTerminal: index === 0, // Por defecto el primero es terminal
              headingText
            });
          }
          return newMeta.sort((a, b) => a.index - b.index); // Mantener el orden
        });

      } catch (err) {
        console.error("Nominatim error:", err);
      }
    };

    // Solo buscamos si hay un punto nuevo que no está en la meta
    if (points.length > 0 && !stopsMeta.find(m => m.index === points.length - 1)) {
      const lastPoint = points[points.length - 1];
      fetchStreetName(lastPoint.lat, lastPoint.lng, points.length - 1);
    }
    
    // Si eliminaron puntos, limpiamos la meta sobrante
    if (stopsMeta.length > points.length) {
      setStopsMeta(prev => prev.filter(m => m.index < points.length));
    }
  }, [points]);


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
    
    try {
      // Formatear payload
      const payload = {
        business_id: '019ea9e0-fae2-7074-a1e4-c09590cb52fd', 
        city_id: '620d31b6-504a-4c26-ad57-f2d5a9205d2a',
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

      await axios.post('http://localhost:8000/api/routes', payload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('enruta_token')}`,
          'Accept': 'application/json'
        }
      });

      success('El circuito ha sido procesado y guardado en la base de datos espacial.', '¡Ruta Guardada!');
      setPoints([]);
      setDensePoints([]);
      setStopsMeta([]);
      setVisualCode('');
      setDisplayName('');
      
    } catch (error) {
      console.error("Error guardando la ruta:", error);
      notifyError('Revisa tu conexión o que los IDs sean válidos.', 'Error al guardar la ruta');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="route-creator-layout">
      {/* Panel Izquierdo: Formulario CRUD */}
      <div className="route-form-panel" style={{ overflowY: 'auto' }}>
        <div className="panel-header">
          <h2>Trazar Nuevo Circuito</h2>
          <p className="text-muted text-sm">Define el recorrido circular haciendo clics en el mapa. Selecciona los terminales clave.</p>
        </div>

        <div className="form-group">
          <Input 
            label="Código / Letra Visual *" 
            placeholder="Ej. A, 15, W" 
            value={visualCode}
            onChange={(e) => setVisualCode(e.target.value)}
            maxLength={10}
          />
          <Input 
            label="Nombre Descriptivo (Opcional)" 
            placeholder="Ej. Terminal - Centro - Retorno" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          
          <div className="color-picker-group">
            <label className="atom-input-label">Color del Circuito</label>
            <div className="color-input-wrapper">
              <input 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)}
                className="color-picker"
              />
              <Input 
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>
        </div>

        {/* Panel de Paraderos Inteligentes */}
        {points.length > 0 && (
          <div className="form-group" style={{ background: '#f8f9fa', padding: '10px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#495057' }}>Puntos de Control & Terminales</h4>
            
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {stopsMeta.map(meta => (
                <div key={meta.index} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px', background: 'white', marginBottom: '4px', borderRadius: '4px',
                  borderLeft: meta.isTerminal ? `3px solid ${color}` : '3px solid transparent'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color={meta.isTerminal ? color : '#adb5bd'} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '12px', fontWeight: meta.isTerminal ? 'bold' : 'normal' }}>
                        {meta.streetName}
                      </span>
                      {meta.headingText && (
                        <span style={{ fontSize: '10px', color: '#6c757d' }}>Sentido: {meta.headingText}</span>
                      )}
                    </div>
                  </div>
                  
                  <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={meta.isTerminal} 
                      onChange={() => toggleTerminal(meta.index)}
                    />
                    Terminal
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-summary">
          <div className="summary-stat">
            <span className="stat-label">Puntos de control:</span>
            <span className={`stat-value ${points.length < 2 ? 'text-danger' : 'text-success'}`}>
              {points.length}
            </span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Terminales:</span>
            <span className={`stat-value ${terminalCount < 2 ? 'text-danger' : 'text-success'}`}>
              {terminalCount} / 2 min
            </span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Nodos generados (OSRM):</span>
            <span className="stat-value text-muted">
              {densePoints.length}
            </span>
          </div>
          {points.length < 2 && (
            <div className="warning-box">
              <AlertCircle size={14} /> Traza un circuito completo (mínimo 2 clics).
            </div>
          )}
          {points.length >= 2 && terminalCount < 2 && (
            <div className="warning-box">
              <AlertCircle size={14} /> Debes marcar al menos 2 puntos como "Terminal".
            </div>
          )}
        </div>

        <div className="panel-footer">
          <Button 
            variant="primary" 
            fullWidth 
            onClick={handleSaveRoute}
            disabled={isSaving || !isFormValid}
          >
            <Save size={18} /> {isSaving ? 'Guardando Circuito...' : 'Guardar Circuito'}
          </Button>
        </div>
      </div>

      {/* Panel Derecho: Mapa Interactivo */}
      <div className="route-map-panel">
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
