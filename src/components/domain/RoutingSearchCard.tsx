import React from 'react';
import { MapPin, Navigation, X, LocateFixed } from 'lucide-react';
import { Button, Input, Card, CardBody } from '../ui';
import './RoutingSearchCard.css';

interface RoutingSearchCardProps {
  originName: string;
  destinationName: string;
  onOriginChange: (val: string) => void;
  onDestinationChange: (val: string) => void;
  onSearch: () => void;
  onClear: () => void;
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
  canSearch,
}) => {
  return (
    <Card className="routing-search-card" elevation="lg" padding="none">
      <CardBody className="routing-search-card__body">
        <div className="routing-search-card__content">
          <div className="routing-search-card__inputs-wrapper">
            {/* Indicador visual de ruta (Desktop) */}
            <div className="routing-search-card__visual-indicator">
              <div className="indicator-dot indicator-dot--origin" />
              <div className="indicator-line" />
              <MapPin size={18} className="indicator-icon" />
            </div>

            <div className="routing-search-card__inputs">
              <div className="search-input-group">
                <span className="search-input-label">Origen</span>
                <Input
                    placeholder="¿Dónde te encuentras?"
                    value={originName}
                    onChange={(e) => onOriginChange(e.target.value)}
                    className="search-input"
                    rightIcon={
                        <button onClick={onUseCurrentLocation} className="search-icon-btn text-primary">
                            <LocateFixed size={18} />
                        </button>
                    }
                />
              </div>
              
              <div className="search-input-group">
                <span className="search-input-label">Destino</span>
                <Input
                    placeholder="¿A dónde quieres ir?"
                    value={destinationName}
                    onChange={(e) => onDestinationChange(e.target.value)}
                    className="search-input"
                    rightIcon={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {(originName || destinationName) && (
                                <button onClick={onClear} className="search-icon-btn text-muted">
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    }
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={onSearch}
            disabled={!canSearch || isSearching}
            isLoading={isSearching}
            fullWidth
            size="lg"
            leftIcon={<Navigation size={20} />}
            className="routing-search-card__btn"
          >
            Trazar Ruta
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
