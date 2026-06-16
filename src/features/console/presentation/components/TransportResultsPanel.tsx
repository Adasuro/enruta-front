import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Frown, Info } from 'lucide-react';
import { RouteResultCard } from '../../../../components/domain';
import { type RoutingResult, type Journey } from '../../services/routeService';

interface TransportResultsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  results: RoutingResult | null;
  selectedJourney: Journey | null;
  onSelectJourney: (journey: Journey) => void;
}

export const TransportResultsPanel: React.FC<TransportResultsPanelProps> = ({
  isOpen,
  onClose,
  results,
  selectedJourney,
  onSelectJourney
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[850] bg-white rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t border-gray-100 flex flex-col max-h-[85vh] md:max-h-[60vh] md:w-[450px] md:right-auto md:left-6 md:bottom-6 md:rounded-[32px] md:border"
        >
          {/* Header */}
          <div className="p-6 pb-2 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-xl font-black text-gray-900 m-0">Opciones de Viaje</h3>
              {results && (
                <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                   {results.journeys.length} rutas encontradas • {results.search_meta.radius_reached}m
                </p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors border-none cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 pt-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
            {results && results.journeys.length > 0 ? (
              <div className="flex flex-col gap-1">
                {results.journeys.map((journey) => (
                  <RouteResultCard 
                    key={journey.id}
                    route={journey as any}
                    isSelected={selectedJourney?.id === journey.id}
                    onClick={() => onSelectJourney(journey as any)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <Frown size={40} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 m-0">Sin rutas cercanas</h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
                    No encontramos buses que conecten estos puntos en el radio actual.
                  </p>
                </div>
                <div className="mt-4 p-4 bg-primary-50 rounded-2xl text-left flex gap-3 border border-primary-100">
                   <Info size={20} className="text-primary-500 shrink-0 mt-0.5" />
                   <p className="text-xs text-primary-700 font-medium leading-relaxed m-0">
                     <strong>Tip:</strong> Intenta mover los marcadores hacia avenidas principales o paraderos conocidos.
                   </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer Decoration */}
          <div className="h-6 shrink-0 md:hidden" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
