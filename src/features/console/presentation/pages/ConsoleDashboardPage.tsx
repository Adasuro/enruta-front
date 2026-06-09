import React, { useState } from 'react';
import { type User } from '../../../../features/auth/services/authService';
import { useEnrutamiento } from '../../hooks/useEnrutamiento';
import { EnrutamientoMap } from '../components/maps/EnrutamientoMap';
import { EnrutandoOverlay } from '../components/EnrutandoOverlay';
import { RoutingSearchCard } from '../components/RoutingSearchCard';
import { Bus, ArrowRight, Frown, Info, X } from 'lucide-react';
import { type RouteResult } from '../../services/routeService';

export const ConsoleDashboardPage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('enruta_user') || '{}') as User;
  const { 
    origin, setOrigin, originName, setOriginName,
    destination, setDestination, destinationName, setDestinationName,
    isSearching, searchResults, setSearchResults, radiusMsg, handleSearch, fetchAddress,
    useCurrentLocation, clearLocation
  } = useEnrutamiento();

  const [selectedRoute, setSelectedRoute] = useState<RouteResult | null>(null);

  const handleMapClick = async (p: {lat: number, lng: number}) => {
    if (!origin) {
      setOrigin(p);
      const name = await fetchAddress(p.lat, p.lng);
      setOriginName(name);
    } else if (!destination) {
      setDestination(p);
      const name = await fetchAddress(p.lat, p.lng);
      setDestinationName(name);
    } else {
      // Si ya hay ambos, reiniciamos el destino al nuevo clic
      setDestination(p);
      const name = await fetchAddress(p.lat, p.lng);
      setDestinationName(name);
    }
  };

  const handleMarkerDrag = async (type: 'origin' | 'destination', p: {lat: number, lng: number}) => {
    if (type === 'origin') {
      setOrigin(p);
      const name = await fetchAddress(p.lat, p.lng);
      setOriginName(name);
    } else {
      setDestination(p);
      const name = await fetchAddress(p.lat, p.lng);
      setDestinationName(name);
    }
  };

  const handleCloseResults = () => {
    setSearchResults(null);
    setSelectedRoute(null);
  };

  if (user.role === 'standard_user') {
    return (
      <div className="enrutamiento-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', backgroundColor: 'var(--color-bg-app)' }}>
        <EnrutandoOverlay isVisible={isSearching} message={radiusMsg} />
        
        {/* Panel de Búsqueda Flotante */}
        <div style={{ 
          position: 'absolute', 
          top: '1.25rem', 
          left: '1.25rem', 
          zIndex: 100,
          pointerEvents: 'auto'
        }}>
          <RoutingSearchCard 
            originName={originName}
            destinationName={destinationName}
            onOriginChange={setOriginName}
            onDestinationChange={setDestinationName}
            onSearch={handleSearch}
            onClear={clearLocation}
            onUseCurrentLocation={useCurrentLocation}
            isSearching={isSearching}
            canSearch={!!origin && !!destination}
          />
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* Mapa Principal */}
          <div style={{ flex: 1, position: 'relative' }}>
            <EnrutamientoMap 
              origin={origin} 
              destination={destination} 
              onMapClick={handleMapClick}
              onMarkerDrag={handleMarkerDrag}
              selectedRoute={selectedRoute}
            />
          </div>

          {/* Panel de Resultados Lateral */}
          {searchResults && (
            <div className="results-panel" style={{ 
              width: '380px', 
              background: 'var(--color-bg-surface)', 
              borderLeft: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 150,
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ 
                padding: '1.25rem', 
                background: 'var(--color-bg-surface)', 
                borderBottom: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Rutas Sugeridas {searchResults.results.length > 0 && <span style={{ fontSize: '0.75rem', background: 'var(--color-primary-100)', color: 'var(--color-primary-700)', padding: '2px 8px', borderRadius: '12px' }}>{searchResults.results.length}</span>}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Radio máximo: {searchResults.radius_reached}m
                  </p>
                </div>
                <button 
                  onClick={handleCloseResults}
                  style={{ 
                    background: 'var(--color-neutral-100)', 
                    border: 'none', 
                    padding: '6px', 
                    borderRadius: '50%', 
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {searchResults.results.length > 0 ? (
                  searchResults.results.map((route) => (
                    <div 
                      key={route.id}
                      onClick={() => setSelectedRoute(route)}
                      className={`route-card ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                      style={{ 
                        background: 'var(--color-bg-surface)',
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: '0.875rem',
                        cursor: 'pointer',
                        border: '2px solid transparent',
                        borderColor: selectedRoute?.id === route.id ? route.color_primary : 'transparent',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ 
                          width: '48px', height: '48px', 
                          background: route.color_primary, 
                          color: 'white',
                          borderRadius: '12px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: '1.5rem',
                          boxShadow: `0 4px 12px ${route.color_primary}44`
                        }}>
                          {route.visual_code}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>{route.display_name || 'Ruta sin nombre'}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Pasaje: <span style={{ fontWeight: 700, color: 'var(--color-success-600)' }}>{route.fare.currency} {route.fare.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.875rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                         <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--color-primary-600)', fontWeight: 600 }}>
                           <Bus size={18} /> Ver recorrido completo
                         </span>
                         <ArrowRight size={18} color="var(--color-text-muted)" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '80px', height: '80px', background: 'var(--color-neutral-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-neutral-300)' }}>
                      <Frown size={40} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>Sin rutas cercanas</h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                        No encontramos buses que pasen por ambos puntos en un radio de 300m. 
                      </p>
                    </div>
                    <div style={{ background: 'var(--color-primary-50)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', textAlign: 'left', display: 'flex', gap: '12px', border: '1px solid var(--color-primary-100)' }}>
                      <Info size={24} color="var(--color-primary-600)" style={{ flexShrink: 0 }} />
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-primary-800)', lineHeight: 1.4 }}>
                        <strong>Recomendación:</strong> Mueve el marcador de origen o destino hacia una avenida principal para obtener mejores resultados.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <style>{`
            .route-card:hover {
              transform: translateY(-3px);
              box-shadow: var(--shadow-md);
              background-color: var(--color-neutral-25) !important;
            }
            .route-card.selected {
              background-color: var(--color-primary-50) !important;
            }
            @media (max-width: 767px) {
              .results-panel {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100% !important;
                height: 60% !important;
                border-left: none !important;
                border-top: 1px solid var(--color-border-subtle);
                border-radius: 20px 20px 0 0;
              }
              .enrutamiento-container > div:first-of-type {
                top: 0.75rem !important;
                left: 0.75rem !important;
                right: 0.75rem !important;
                width: auto !important;
              }
            }
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Dashboard para B2B / Admin (Provisional)
  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Panel de Control</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>Gestiona tus rutas y flota desde aquí.</p>
      
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mis Rutas</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>0</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reportes Recibidos</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>0</div>
        </div>
      </div>
    </div>
  );
};
