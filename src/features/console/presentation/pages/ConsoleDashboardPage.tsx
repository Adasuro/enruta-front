import React, { useState, useEffect } from 'react';
import { useEnrutamiento, type SavedSearch } from '../../hooks/useEnrutamiento';
import { RoutingMap } from '../../../../components/ui/Map';
import { EnrutandoOverlay } from '../../../../components/domain';
import { useAuth } from '../../../../contexts/AuthContext';
import { B2BTransportDashboard } from '../components/B2BTransportDashboard';
import { RoutingTacticalHUD } from '../components/RoutingTacticalHUD';
import { RoutingSidebarPanel } from '../components/RoutingSidebarPanel';
import { TransportResultsPanel } from '../components/TransportResultsPanel';

export const ConsoleDashboardPage: React.FC<{ forceSearchMode?: boolean }> = ({ forceSearchMode }) => {
  const { user, activeBusinessId } = useAuth();
  const activeBusiness = user?.businesses?.find(b => b.id === activeBusinessId);

  if (!forceSearchMode && activeBusiness && activeBusiness.type === 'transport') {
    return <B2BTransportDashboard businessName={activeBusiness.name} />;
  }

  return <RoutingConsoleView />;
};

const RoutingConsoleView: React.FC = () => {
  const { 
    origin, setOrigin, originName, setOriginName,
    destination, setDestination, destinationName, setDestinationName,
    isSearching, searchResults, setSearchResults, radiusMsg, handleSearch: originalHandleSearch, fetchAddress,
    useCurrentLocation, clearLocation, isLocating,
    isLocked, setIsLocked, recentSearches, loadFromHistory
  } = useEnrutamiento();

  // Panel States
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const [isTransportOpen, setIsTransportOpen] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<any>(null);

  // Auto-open transport when search finishes with results
  useEffect(() => {
    if (searchResults && searchResults.journeys.length > 0) {
      setIsTransportOpen(true);
      setIsSearchOpen(false);
    }
  }, [searchResults]);

  const handleSearch = async () => {
    await originalHandleSearch();
  };

  const handleJourneySelect = (journey: any) => {
    setSelectedJourney(journey);
  };

  const handleMapClick = async (p: {lat: number, lng: number}) => {
    if (isLocked) return;

    if (!origin) {
      setOrigin(p);
      setOriginName('Cargando...');
      const name = await fetchAddress(p.lat, p.lng);
      setOriginName(name);
    } else {
      setDestination(p);
      setDestinationName('Cargando...');
      const name = await fetchAddress(p.lat, p.lng);
      setDestinationName(name);
    }
  };

  const handleMarkerDrag = async (type: 'origin' | 'destination', p: {lat: number, lng: number}) => {
    if (isLocked) return;

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
    setIsTransportOpen(false);
    setIsLocked(false);
    setIsSearchOpen(true);
  };

  return (
    <div className="relative w-full h-full bg-gray-50 overflow-hidden flex flex-col">
      {/* 1. MAP (The Foundation) */}
      <div className="absolute inset-0 z-0">
          <RoutingMap 
            origin={origin} 
            destination={destination} 
            onMapClick={handleMapClick}
            onMarkerDrag={handleMarkerDrag}
            onLocateMe={useCurrentLocation}
            isLocating={isLocating}
            selectedRoute={selectedJourney}
            isLocked={isLocked}
            onToggleLock={() => setIsLocked(!isLocked)}
          />
      </div>

      {/* 2. LOADING OVERLAY */}
      <EnrutandoOverlay isVisible={isSearching} message={radiusMsg} />
      
      {/* 3. TACTICAL HUD (Control Center) */}
      <RoutingTacticalHUD 
        isSearchOpen={isSearchOpen}
        isTransportOpen={isTransportOpen}
        isLocked={isLocked}
        hasResults={!!searchResults}
        resultCount={searchResults?.journeys.length || 0}
        onToggleSearch={() => {
            setIsSearchOpen(!isSearchOpen);
            if (!isSearchOpen) setIsTransportOpen(false);
        }}
        onToggleTransport={() => {
            setIsTransportOpen(!isTransportOpen);
            if (!isTransportOpen) setIsSearchOpen(false);
        }}
        onLocateMe={useCurrentLocation}
        onToggleLock={() => setIsLocked(!isLocked)}
      />

      {/* 4. SIDEBAR PANEL (Search & History) */}
      <RoutingSidebarPanel 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
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
        recentSearches={recentSearches}
        loadFromHistory={(s: SavedSearch) => {
            loadFromHistory(s);
            setIsSearchOpen(false);
        }}
        hasResults={!!searchResults}
      />

      {/* 5. TRANSPORT RESULTS (Floating/Bottom Panel) */}
      <TransportResultsPanel 
        isOpen={isTransportOpen}
        onClose={handleCloseResults}
        results={searchResults}
        selectedJourney={selectedJourney}
        onSelectJourney={handleJourneySelect}
      />
    </div>
  );
};
