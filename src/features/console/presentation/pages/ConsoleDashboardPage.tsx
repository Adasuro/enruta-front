import React, { useState } from 'react';
import { useEnrutamiento } from '../../hooks/useEnrutamiento';
import { RoutingMap } from '../../../../components/ui/Map';
import { RouteResultCard, EnrutandoOverlay, RoutingSearchCard } from '../../../../components/domain';
import { Frown, Info, X, Bus, Route as RouteIcon, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { Card } from '../../../../components/ui';

type SheetState = 'closed' | 'peek' | 'full';

export const ConsoleDashboardPage: React.FC<{ forceSearchMode?: boolean }> = ({ forceSearchMode }) => {
  const { user, activeBusinessId } = useAuth();
  const activeBusiness = user?.businesses?.find(b => b.id === activeBusinessId);

  // If the user has a transport business, show the B2B Dashboard, unless search is forced
  if (!forceSearchMode && activeBusiness && activeBusiness.type === 'transport') {
    return <B2BTransportDashboard businessName={activeBusiness.name} />;
  }

  // Otherwise, show the Map (B2C / Super Admin / Agencies / Forced Search)
  return <RoutingDashboardMap />;
};

const B2BTransportDashboard: React.FC<{ businessName: string }> = ({ businessName }) => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--color-gray-900)' }}>
          Monitor de Operaciones
        </h1>
        <p style={{ color: 'var(--color-gray-600)', margin: 0, fontSize: '1.125rem' }}>
          Vista general para <strong>{businessName}</strong>
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card bordered padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bus size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--color-gray-500)', fontSize: '0.875rem', fontWeight: 600 }}>Flota Operativa</p>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>--</h3>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-success)', fontWeight: 600 }}>Vehículos en ruta hoy</p>
        </Card>

        <Card bordered padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RouteIcon size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--color-gray-500)', fontSize: '0.875rem', fontWeight: 600 }}>Rutas Activas</p>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>--</h3>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>Circuitos operando</p>
        </Card>

        <Card bordered padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--color-gray-500)', fontSize: '0.875rem', fontWeight: 600 }}>Incidentes Reportados</p>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>0</h3>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>En las últimas 24 hrs</p>
        </Card>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-200)', padding: '2rem', textAlign: 'center' }}>
        <Users size={48} color="var(--color-gray-300)" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Próximamente: Analítica Avanzada</h3>
        <p style={{ color: 'var(--color-gray-500)', maxWidth: '500px', margin: '0 auto' }}>
          Estamos construyendo métricas detalladas para que puedas ver el rendimiento de tu flota, los ingresos estimados y las horas pico de demanda.
        </p>
      </div>
    </div>
  );
};

const RoutingDashboardMap: React.FC = () => {
  const { 
    origin, setOrigin, originName, setOriginName,
    destination, setDestination, destinationName, setDestinationName,
    isSearching, searchResults, setSearchResults, radiusMsg, handleSearch: originalHandleSearch, fetchAddress,
    useCurrentLocation, clearLocation, isLocating
  } = useEnrutamiento();

  const [selectedJourney, setSelectedJourney] = useState<any>(null);
  const [sheetState, setSheetState] = useState<SheetState>('closed');

  const handleSearch = async () => {
    await originalHandleSearch();
    setSheetState('peek');
  };

  const handleJourneySelect = (journey: any) => {
    setSelectedJourney(journey);
    if (window.innerWidth < 768) {
      setSheetState('full');
    }
  };

  const handleGeolocate = async (p: {lat: number, lng: number}) => {
    setOrigin(p);
    const name = await fetchAddress(p.lat, p.lng);
    setOriginName(name);
  };

  const handleMapClick = async (p: {lat: number, lng: number}) => {
    // Si no hay origen, el primer clic establece el origen
    if (!origin) {
      setOrigin(p);
      setOriginName('Cargando...');
      const name = await fetchAddress(p.lat, p.lng);
      setOriginName(name);
    } 
    // Si ya hay origen, cualquier clic adicional establece/actualiza el destino
    else {
      setDestination(p);
      setDestinationName('Cargando...');
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
    setSelectedJourney(null);
    setSheetState('closed');
  };

  const toggleSheet = () => {
    setSheetState(prev => (prev === 'peek' ? 'full' : 'peek'));
  };

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
          onClear={() => clearLocation('origin')}
          onUseCurrentLocation={useCurrentLocation}
          isSearching={isSearching}
          isLocating={isLocating}
          canSearch={!!origin && !!destination}
        />
      </div>

      <div className="main-content">
        <div className="map-wrapper">
          <RoutingMap 
            origin={origin} 
            destination={destination} 
            onMapClick={handleMapClick}
            onMarkerDrag={handleMarkerDrag}
            onGeolocate={handleGeolocate}
            selectedRoute={selectedJourney}
          />
        </div>

        {searchResults && (
            <div className={`results-panel ${sheetState}`}>
                <div className="results-header" onClick={toggleSheet}>
                    <div className="sheet-handle"></div>
                    <div className="flex flex-col gap-0.5">
                    <h3 className="results-title">
                        Opciones de Viaje
                        {searchResults.journeys.length > 0 && 
                        <span className="results-count">{searchResults.journeys.length}</span>
                        }
                    </h3>
                    <p className="results-subtitle flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-success-500"></span>
                        Radio: {searchResults.search_meta.radius_reached}m
                    </p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleCloseResults(); }} className="close-results-btn">
                    <X size={20} />
                    </button>
                </div>
                
                <div className="results-body">
                    {searchResults.journeys.length > 0 ? (
                    searchResults.journeys.map((journey) => (
                        <RouteResultCard 
                        key={journey.id}
                        route={journey as any}
                        isSelected={selectedJourney?.id === journey.id}
                        onClick={() => handleJourneySelect(journey)}
                        />
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
        )}

        <style>{`
          :root {
            --sheet-peek-height: 180px;
            --sheet-full-height: 85vh;
          }
          .enrutamiento-container { 
            display: flex; 
            flex-direction: column; 
            height: 100%; 
            position: relative; 
            background-color: var(--color-gray-50); 
            overflow: hidden; 
          }
          .floating-search-panel { 
            position: absolute; 
            top: 1.25rem; 
            left: 1.25rem; 
            z-index: 10; 
            pointer-events: auto; 
          }
          .main-content { 
            display: flex; 
            flex: 1; 
            overflow: hidden; 
            position: relative; 
            height: 100%; 
          }
          .map-wrapper { 
            flex: 1; 
            position: relative; 
            height: 100%; 
            width: 100%;
          }
          
          .results-panel {
            width: 400px;
            background: var(--color-white);
            border-left: 1px solid var(--color-gray-200);
            display: flex;
            flex-direction: column;
            z-index: 90;
            box-shadow: var(--shadow-lg);
          }
          
          .results-header {
            padding: 1.25rem;
            background: var(--color-white);
            border-bottom: 1px solid var(--color-gray-100);
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            position: relative;
          }
          .sheet-handle { display: none; }
          .results-title { font-size: 1.125rem; font-weight: 900; color: var(--color-gray-900); display: flex; align-items: center; gap: 8px; margin:0; }
          .results-count { font-size: 0.75rem; background: var(--brand-primary); color: white; padding: 2px 8px; border-radius: 12px; font-weight: 900; }
          .results-subtitle { font-size: 0.75rem; color: var(--color-gray-500); margin: 2px 0 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.025em; }
          
          .close-results-btn { background: var(--color-gray-50); border: none; padding: 6px; border-radius: 50%; cursor: pointer; color: var(--color-gray-400); display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
          .close-results-btn:hover { background: var(--color-gray-100); color: var(--color-gray-900); }
          
          .results-body { flex: 1; overflow-y: auto; padding: 1rem; background-color: var(--color-gray-50); }

          .no-results-container { text-align: center; padding: 4rem 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
          .no-results-icon-wrapper { width: 80px; height: 80px; background: var(--color-gray-100); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-gray-300); }
          .no-results-container h4 { font-size: 1.125rem; font-weight: 700; color: var(--color-gray-900); margin: 0; }
          .no-results-container p { font-size: 0.875rem; color: var(--color-gray-500); margin-top: 0.5rem; line-height: 1.5; }
          .recommendation-box { background: var(--color-white); padding: 1.25rem; margin-top: 1rem; border-radius: var(--radius-lg); text-align: left; display: flex; gap: 12px; border: 1px solid var(--color-gray-200); }
          .recommendation-box p { font-size: 0.8125rem; color: var(--brand-primary); line-height: 1.4; margin:0; font-weight: 500; }
          .recommendation-box strong { color: var(--brand-primary); font-weight: 800; }

          @media (max-width: 767px) {
            .floating-search-panel { top: 0 !important; left: 0 !important; right: 0 !important; width: auto !important; padding: 0.75rem; }
            .results-panel {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100% !important;
              height: 100%;
              border-left: none !important;
              border-top: 1px solid var(--color-gray-200);
              border-radius: 24px 24px 0 0;
              transform: translateY(calc(100% - var(--sheet-peek-height)));
              transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .results-panel.closed { transform: translateY(100%); }
            .results-panel.full { transform: translateY(calc(100% - var(--sheet-full-height))); }

            .sheet-handle {
              display: block;
              position: absolute;
              top: 12px;
              left: 50%;
              transform: translateX(-50%);
              width: 40px;
              height: 5px;
              background-color: var(--color-gray-300);
              border-radius: 10px;
            }
            .results-header { padding-top: 1.75rem; }
          }
        `}</style>
      </div>
    </div>
  );
};
