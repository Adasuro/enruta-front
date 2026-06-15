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
  isLocating: boolean;
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
  isLocating,
  canSearch,
}) => {
  return (
    <Card className="w-[380px] max-md:w-full max-md:rounded-none max-md:border-x-0 max-md:border-t-0 max-md:shadow-sm" elevation="lg" padding="none">
      <CardBody className="p-6 max-md:py-3 max-md:px-4">
        <div className="flex flex-col gap-5 max-md:gap-3">
          <div className="flex gap-4 max-md:gap-2">
            {/* Indicador visual de ruta (Desktop) */}
            <div className="flex flex-col items-center py-3 gap-1 max-md:hidden">
              <div className="w-3 h-3 rounded-full bg-success-500 border-[2.5px] border-white shadow-[0_0_0_2px_theme(colors.gray.100)]" />
              <div className="flex-1 w-[2px] bg-[repeating-linear-gradient(to_bottom,theme(colors.gray.200),theme(colors.gray.200)_5px,transparent_5px,transparent_10px)]" />
              <MapPin size={18} className="text-danger-500" />
            </div>

            <div className="flex-1 flex flex-col gap-4 max-md:flex-row max-md:gap-2">
              <div className="flex flex-col gap-1 max-md:flex-1">
                <span className="text-[0.6875rem] font-extrabold text-gray-400 uppercase tracking-wider max-md:hidden">Origen</span>
                <Input
                    placeholder="¿Dónde te encuentras?"
                    value={originName}
                    onChange={(e) => onOriginChange(e.target.value)}
                    className="max-md:min-h-[40px] max-md:bg-gray-100 max-md:border-transparent"
                    rightIcon={
                        <button 
                          onClick={onUseCurrentLocation} 
                          disabled={isLocating}
                          className={`bg-transparent border-none p-1 cursor-pointer flex items-center transition-colors ${isLocating ? 'text-gray-300 animate-pulse' : 'text-primary-500 hover:text-primary-600'}`}
                        >
                            <LocateFixed size={18} />
                        </button>
                    }
                />
              </div>
              
              <div className="flex flex-col gap-1 max-md:flex-1">
                <span className="text-[0.6875rem] font-extrabold text-gray-400 uppercase tracking-wider max-md:hidden">Destino</span>
                <Input
                    placeholder="¿A dónde quieres ir?"
                    value={destinationName}
                    onChange={(e) => onDestinationChange(e.target.value)}
                    className="max-md:min-h-[40px] max-md:bg-gray-100 max-md:border-transparent"
                    rightIcon={
                        <div className="flex items-center">
                            {(originName || destinationName) && (
                                <button onClick={onClear} className="bg-transparent border-none p-1 cursor-pointer flex items-center text-gray-400">
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
            className="h-[52px] text-base font-extrabold max-md:h-[44px] max-md:text-sm"
          >
            Trazar Ruta
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
