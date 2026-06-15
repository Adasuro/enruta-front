import React from 'react';
import { Bus, ArrowRight, Navigation2, MapPin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Journey } from '../../features/console/services/routeService';
import { MultimodalJourney } from './MultimodalJourney';

interface RouteResultCardProps {
  route: Journey;
  isSelected?: boolean;
  onClick?: () => void;
}

export const RouteResultCard: React.FC<RouteResultCardProps> = ({ 
  route: journey, 
  isSelected = false, 
  onClick 
}) => {
  const transitStep = journey.steps.find(s => s.type === 'TRANSIT');
  const routeInfo = transitStep?.route_info;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border-[1.5px] cursor-pointer overflow-hidden transition-all duration-300 shadow-sm flex flex-col mb-3 ${
        isSelected ? 'border-primary-500 ring-1 ring-primary-500/20' : 'border-gray-200 hover:border-primary-300'
      }`}
      onClick={onClick}
    >
      <div className="p-4 flex gap-4 items-center">
        {/* Identidad Visual */}
        <div 
          className="w-14 h-14 rounded-xl text-white font-black flex items-center justify-center text-xl shrink-0 shadow-lg" 
          style={{ 
            backgroundColor: routeInfo?.color_primary || '#CBD5E1', 
            color: routeInfo?.color_secondary || '#FFFFFF',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          {routeInfo?.visual_code || '?'}
        </div>

        {/* Info Principal */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-[1rem] font-black text-gray-900 m-0 truncate leading-tight tracking-tight">
              {routeInfo?.name || `Línea ${routeInfo?.visual_code}`}
            </h4>
            <div className="flex flex-col items-end">
                <span className="font-black text-primary-600 text-sm whitespace-nowrap">
                    S/ {journey.summary.total_fare.toFixed(2)}
                </span>
                <span className="text-[0.625rem] text-gray-400 font-bold uppercase tracking-widest">Tarifa</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[0.75rem] text-gray-500 font-bold tracking-tight">
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
              <Navigation2 size={12} className="text-primary-500" /> {journey.summary.total_duration_min} min
            </span>
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
              <Bus size={12} className="text-primary-500" /> {transitStep?.vehicle_references?.[0]?.type || 'Unidad'}
            </span>
          </div>
        </div>
      </div>

      {/* Tags de Recomendación */}
      {journey.tags && journey.tags.length > 0 && !isSelected && (
        <div className="px-4 pb-3 flex gap-1.5">
          {journey.tags.map(tag => (
            <span key={tag} className="text-[0.625rem] font-black uppercase px-2 py-0.5 rounded-full bg-success-50 text-success-600 border border-success-100">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Itinerario Detallado (Solo cuando está seleccionado) */}
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-gray-100 bg-gray-50/30"
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-4 bg-primary-500 rounded-full" />
                <span className="text-[0.6875rem] font-black text-gray-400 uppercase tracking-widest">Itinerario de viaje</span>
              </div>
              <MultimodalJourney journey={journey} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Acción */}
      <div className={`px-4 py-2.5 flex items-center justify-between text-[0.6875rem] font-black uppercase tracking-widest transition-colors duration-200 ${
        isSelected ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-400'
      }`}>
         <span className="flex items-center gap-2">
           {isSelected ? <MapPin size={14} /> : <ChevronDown size={14} />}
           {isSelected ? 'Mostrando en mapa' : 'Ver detalles y paraderos'}
         </span>
         <ArrowRight size={14} className={isSelected ? 'text-white' : 'text-gray-300'} />
      </div>
    </motion.div>
  );
};
