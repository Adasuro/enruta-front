import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, ArrowRight } from 'lucide-react';
import { RoutingSearchCard } from '../../../../components/domain';
import { type SavedSearch } from '../../hooks/useEnrutamiento';

interface RoutingSidebarPanelProps {
  isOpen: boolean;
  onClose: () => void;
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
  recentSearches: SavedSearch[];
  loadFromHistory: (s: SavedSearch) => void;
  hasResults: boolean;
}

export const RoutingSidebarPanel: React.FC<RoutingSidebarPanelProps> = ({
  isOpen,
  onClose,
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
  recentSearches,
  loadFromHistory,
  hasResults
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 left-0 bottom-0 z-[800] bg-white w-full md:w-[400px] shadow-2xl border-r border-gray-100 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 pb-2 flex items-center justify-between shrink-0 max-md:pt-10">
            <div>
              <h3 className="text-xl font-black text-gray-900 m-0">Trazar Ruta</h3>
              <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Encuentra el bus ideal
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors border-none cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
            {/* Search Card */}
            <RoutingSearchCard 
              originName={originName}
              destinationName={destinationName}
              onOriginChange={onOriginChange}
              onDestinationChange={onDestinationChange}
              onSearch={onSearch}
              onClear={onClear}
              onUseCurrentLocation={onUseCurrentLocation}
              isSearching={isSearching}
              isLocating={isLocating}
              canSearch={canSearch}
            />

            {/* Recent Searches */}
            {!hasResults && recentSearches.length > 0 && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-gray-400">
                        <History size={16} />
                        <span className="text-[0.65rem] font-black uppercase tracking-widest">Búsquedas Recientes</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {recentSearches.map((s) => (
                            <button 
                                key={s.id} 
                                onClick={() => loadFromHistory(s)}
                                className="text-left p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-primary-200 hover:bg-white transition-all group flex items-center justify-between"
                            >
                                <div className="flex flex-col gap-1 overflow-hidden">
                                    <p className="text-xs font-bold text-gray-700 truncate">{s.originName || 'Punto en el mapa'}</p>
                                    <p className="text-xs font-bold text-primary-500 truncate">{s.destinationName || 'Punto en el mapa'}</p>
                                </div>
                                <ArrowRight size={16} className="text-gray-300 group-hover:text-primary-500 shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
