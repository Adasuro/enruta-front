import React from 'react';
import { MapPin, Search, X, LocateFixed, Loader2 } from 'lucide-react';
import { Button } from '../../../../components/atoms/Button';
import './RoutingSearchCard.css';

interface RoutingSearchCardProps {
  originName: string;
  destinationName: string;
  onOriginChange: (val: string) => void;
  onDestinationChange: (val: string) => void;
  onSearch: () => void;
  onClear: (type: 'origin' | 'destination') => void;
  onUseCurrentLocation: () => void;
  isSearching: boolean;
  canSearch: boolean;
}

export const RoutingSearchCard: React.FC<RoutingSearchCardProps> = ({
  originName,
  destinationName,
  onOriginChange,
  onDestinationChange,
  onSearch,
  onClear,
  onUseCurrentLocation,
  isSearching,
  canSearch
}) => {
  return (
    <div className="routing-search-card">
      <div className="search-inputs-container">
        <div className="search-visual-line">
          <div className="dot dot-origin"></div>
          <div className="line"></div>
          <div className="dot dot-destination"></div>
        </div>
        
        <div className="search-fields">
          <div className="input-wrapper">
            <input 
              type="text"
              placeholder="Origen (o toca el mapa)"
              value={originName}
              onChange={(e) => onOriginChange(e.target.value)}
              className="search-input"
            />
            <div className="input-actions">
              {originName && <button onClick={() => onClear('origin')} className="action-btn"><X size={14} /></button>}
              <button onClick={onUseCurrentLocation} className="action-btn location-btn" title="Usar mi ubicación">
                <LocateFixed size={16} />
              </button>
            </div>
          </div>

          <div className="input-wrapper">
            <input 
              type="text"
              placeholder="¿A dónde vas?"
              value={destinationName}
              onChange={(e) => onDestinationChange(e.target.value)}
              className="search-input"
            />
            <div className="input-actions">
              {destinationName && <button onClick={() => onClear('destination')} className="action-btn"><X size={14} /></button>}
              <MapPin size={16} className="dest-icon" />
            </div>
          </div>
        </div>
      </div>

      <Button 
        variant="primary" 
        fullWidth 
        onClick={onSearch} 
        disabled={!canSearch || isSearching}
        className="search-submit-btn"
      >
        {isSearching ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Enrutando...</span>
          </>
        ) : (
          <>
            <span>Buscar Ruta</span>
            <Search size={18} />
          </>
        )}
      </Button>
    </div>
  );
};
