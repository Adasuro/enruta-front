import React, { useState, useEffect } from 'react';
import { type User } from '../../../../features/auth/services/authService';
import { useEnrutamiento } from '../../hooks/useEnrutamiento';
import { EnrutamientoMap } from '../components/maps/EnrutamientoMap';
import { EnrutandoOverlay } from '../components/EnrutandoOverlay';
import { RoutingSearchCard } from '../components/RoutingSearchCard';
import { Bus, ArrowRight, Frown, Info, X, ChevronUp } from 'lucide-react';
import { type RouteResult } from '../../services/routeService';

type SheetState = 'closed' | 'peek' | 'full';

export const ConsoleDashboardPage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('enruta_user') || '{}') as User;
  const { 
    origin, setOrigin, originName, setOriginName,
    destination, setDestination, destinationName, setDestinationName,
    isSearching, searchResults, setSearchResults, radiusMsg, handleSearch, fetchAddress,
    useCurrentLocation, clearLocation
  } = useEnrutamiento();

  const [selectedRoute, setSelectedRoute] = useState<RouteResult | null>(null);
  const [sheetState, setSheetState] = useState<SheetState>('closed');

  useEffect(() => {
    if (searchResults) {
      setSheetState('peek');
    } else {
      setSheetState('closed');
    }
  }, [searchResults]);

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
    setSheetState('closed');
  };

  const toggleSheet = () => {
    setSheetState(prev => (prev === 'peek' ? 'full' : 'peek'));
  };

  if (user.role === 'standard_user') {
    return (
      <div className="enrutamiento-container">
        <EnrutandoOverlay isVisible={isSearching} message={radiusMsg} />
        
        <div className="floating-search-panel">
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

        <div className="main-content">
          <div className="map-wrapper">
            <EnrutamientoMap 
              origin={origin} 
              destination={destination} 
              onMapClick={handleMapClick}
              onMarkerDrag={handleMarkerDrag}
              selectedRoute={selectedRoute}
            />
          </div>

          <div className={`results-panel ${sheetState}`}>
              <div className="results-header" onClick={toggleSheet}>
                <div className="sheet-handle"></div>
                <div>
                  <h3 className="results-title">
                    Rutas Sugeridas 
                    {searchResults && searchResults.results.length > 0 && 
                      <span className="results-count">{searchResults.results.length}</span>
                    }
                  </h3>
                  {searchResults && <p className="results-subtitle">Radio máximo: {searchResults.radius_reached}m</p>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleCloseResults(); }} className="close-results-btn">
                  <X size={20} />
                </button>
              </div>
              
              <div className="results-body">
                {searchResults && searchResults.results.length > 0 ? (
                  searchResults.results.map((route) => (
                    <div 
                      key={route.id}
                      onClick={() => setSelectedRoute(route)}
                      className={`route-card ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                      style={{ '--route-color': route.color_primary } as React.CSSProperties}
                    >
                      <div className="route-card-header">
                        <div className="route-visual-code" style={{ background: route.color_primary, boxShadow: `0 4px 12px ${route.color_primary}55` }}>
                          {route.visual_code}
                        </div>
                        <div className="route-card-info">
                          <div className="route-card-name">{route.display_name || 'Ruta sin nombre'}</div>
                          <div className="route-card-fare">
                            Pasaje: <span>{route.fare.currency} {route.fare.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="route-card-footer">
                         <span><Bus size={18} /> Ver recorrido</span>
                         <ArrowRight size={18} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results-container">
                    <div className="no-results-icon-wrapper">
                      <Frown size={40} />
                    </div>
                    <div>
                      <h4>Sin rutas cercanas</h4>
                      <p>No encontramos buses que pasen por ambos puntos en un radio de 300m.</p>
                    </div>
                    <div className="recommendation-box">
                      <Info size={24} style={{ flexShrink: 0 }} />
                      <p><strong>Recomendación:</strong> Mueve el marcador de origen o destino hacia una avenida principal.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          <style>{`
            :root {
              --sheet-peek-height: 150px;
              --sheet-full-height: 85vh;
            }
            .enrutamiento-container { display: flex; flex-direction: column; height: 100%; position: relative; background-color: var(--color-bg-app); }
            .floating-search-panel { position: absolute; top: 1.25rem; left: 1.25rem; z-index: 1000; pointer-events: auto; }
            .main-content { display: flex; flex: 1; overflow: hidden; position: relative; }
            .map-wrapper { flex: 1; position: relative; }
            
            .results-panel {
              width: 340px;
              background: var(--color-bg-surface);
              border-left: 1px solid var(--color-border-subtle);
              display: flex;
              flex-direction: column;
              animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              z-index: 999;
              box-shadow: var(--shadow-lg);
            }
            
            .results-header {
              padding: 0.75rem 1.25rem;
              background: var(--color-bg-surface);
              border-bottom: 1px solid var(--color-border-subtle);
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .sheet-handle { display: none; }
            .results-title { font-size: 1.125rem; font-weight: 700; color: var(--color-text-heading); display: flex; align-items: center; gap: 8px; margin:0; }
            .results-count { font-size: 0.75rem; background: var(--color-primary-100); color: var(--color-primary-700); padding: 2px 8px; border-radius: 12px; }
            .results-subtitle { font-size: 0.75rem; color: var(--color-text-muted); margin: 2px 0 0; }
            
            .close-results-btn { background: var(--color-neutral-100); border: none; padding: 6px; border-radius: 50%; cursor: pointer; color: var(--color-text-muted); display: flex; align-items: center; justify-content: center; }
            .close-results-btn:hover { background: var(--color-neutral-200); }
            
            .results-body { flex: 1; overflow-y: auto; padding: 1rem; }

            .route-card { background: var(--color-bg-surface); padding: 1.25rem; border-radius: var(--radius-lg); margin-bottom: 0.875rem; cursor: pointer; border: 2px solid transparent; box-shadow: var(--shadow-sm); transition: all 0.25s ease; }
            .route-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); background-color: var(--color-neutral-25); }
            .route-card.selected { background-color: var(--color-primary-50); border-color: var(--route-color); box-shadow: var(--shadow-md); }
            
            .route-card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
            .route-visual-code { width: 48px; height: 48px; color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.5rem; flex-shrink: 0; }
            .route-card-info { flex: 1; }
            .route-card-name { font-size: 1rem; font-weight: 700; color: var(--color-text-heading); }
            .route-card-fare { font-size: 0.8125rem; color: var(--color-text-muted); }
            .route-card-fare span { font-weight: 700; color: var(--color-success-600); }
            .route-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 0.875rem; border-top: 1px solid var(--color-border-subtle); color: var(--color-primary-600); font-weight: 600; font-size: 0.875rem; }
            .route-card-footer span { display: flex; align-items: center; gap: 6px; }
            .route-card-footer svg { color: var(--color-text-muted); }
            
            .no-results-container { text-align: center; padding: 4rem 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
            .no-results-icon-wrapper { width: 80px; height: 80px; background: var(--color-neutral-50); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-neutral-300); }
            .no-results-container h4 { font-size: 1.125rem; font-weight: 700; color: var(--color-text-heading); margin: 0; }
            .no-results-container p { font-size: 0.875rem; color: var(--color-text-muted); margin-top: 0.5rem; line-height: 1.5; }
            .recommendation-box { background: var(--color-primary-50); padding: 1.25rem; margin-top: 1rem; border-radius: var(--radius-lg); text-align: left; display: flex; gap: 12px; border: 1px solid var(--color-primary-100); }
            .recommendation-box p { font-size: 0.8125rem; color: var(--color-primary-800); line-height: 1.4; margin:0; }
            .recommendation-box strong { color: var(--color-primary-900); }

            @media (max-width: 767px) {
              .floating-search-panel { top: 0 !important; left: 0 !important; right: 0 !important; width: auto !important; }
              .results-panel {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100% !important;
                height: 100%;
                border-left: none !important;
                border-top: 1px solid var(--color-border-subtle);
                border-radius: 20px 20px 0 0;
                transform: translateY(calc(100% - var(--sheet-peek-height)));
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              }
              .results-panel.closed { transform: translateY(100%); }
              .results-panel.full { transform: translateY(calc(100% - var(--sheet-full-height))); }

              .results-header { cursor: grab; }
              .results-header:active { cursor: grabbing; }

              .sheet-handle {
                display: block;
                position: absolute;
                top: 8px;
                left: 50%;
                transform: translateX(-50%);
                width: 40px;
                height: 4px;
                background-color: var(--color-border-default);
                border-radius: 2px;
              }
            }
            @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Panel de Control</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>Gestiona tus rutas y flota desde aquí.</p>
    </div>
  );
};
