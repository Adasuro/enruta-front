import React from 'react';
import { MapPin, Navigation, X, LocateFixed } from 'lucide-react';
import { Button, Input, Card, CardBody } from '../ui';

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
    <Card className="routing-search-card" elevation="lg" padding="none" style={{ width: '380px' }}>
      <CardBody style={{ padding: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--spacing-3) 0', gap: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-success)', border: '2.5px solid var(--color-white)', boxShadow: '0 0 0 2px var(--color-gray-100)' }} />
              <div style={{ flex: 1, width: '2px', background: 'repeating-linear-gradient(to bottom, var(--color-gray-200), var(--color-gray-200) 5px, transparent 5px, transparent 10px)' }} />
              <MapPin size={18} color="var(--color-danger)" />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Origen</span>
                <Input
                    placeholder="¿Dónde te encuentras?"
                    value={originName}
                    onChange={(e) => onOriginChange(e.target.value)}
                    rightIcon={
                        <button onClick={onUseCurrentLocation} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center' }}>
                            <LocateFixed size={18} />
                        </button>
                    }
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destino</span>
                <Input
                    placeholder="¿A dónde quieres ir?"
                    value={destinationName}
                    onChange={(e) => onDestinationChange(e.target.value)}
                    rightIcon={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {(originName || destinationName) && (
                                <button onClick={onClear} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--color-gray-400)', display: 'flex', alignItems: 'center' }}>
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
            style={{ height: '52px', fontSize: '1rem', fontWeight: 800 }}
          >
            Trazar Ruta
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
