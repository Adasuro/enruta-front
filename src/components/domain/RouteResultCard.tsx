import React from 'react';
import { Bus, ArrowRight, Navigation2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { type Journey } from '../../features/console/services/routeService';

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
  const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';
  const transitStep = journey.steps.find(s => s.type === 'TRANSIT');
  const routeInfo = transitStep?.route_info;
  const vehicles = transitStep?.vehicle_references || [];

  return (
    <motion.div 
      whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-xl border-[1.5px] cursor-pointer overflow-hidden transition-colors duration-200 shadow-sm flex flex-col ${
        isSelected ? 'border-primary-500 ring-1 ring-primary-500 bg-primary-50/30' : 'border-gray-200 hover:border-primary-300'
      }`}
      onClick={onClick}
    >
      <div className="p-4 flex gap-4 items-center border-b border-gray-100">
        <div 
          className="w-14 h-14 rounded-lg text-white font-black flex items-center justify-center text-xl shrink-0" 
          style={{ 
            backgroundColor: routeInfo?.color_primary || '#CBD5E1', 
            color: routeInfo?.color_secondary || '#FFFFFF',
            boxShadow: `0 4px 12px ${routeInfo?.color_primary || '#CBD5E1'}44` 
          }}
        >
          {routeInfo?.visual_code || '?'}
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-[0.9375rem] font-bold text-gray-900 m-0 truncate leading-snug">
              {routeInfo?.name || `Línea ${routeInfo?.visual_code}`}
            </h4>
            <span className="font-extrabold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md text-xs whitespace-nowrap">
              {journey.summary.currency} {journey.summary.total_fare.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[0.6875rem] text-gray-500 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Navigation2 size={12} /> {journey.summary.total_duration_min} min
            </span>
            <span className="flex items-center gap-1">
              <Bus size={12} /> {vehicles.length > 0 ? vehicles[0].type : 'Vehículo'}
            </span>
          </div>
          
          {journey.tags && journey.tags.length > 0 && (
            <div className="flex gap-1.5 mt-0.5">
              {journey.tags.map(tag => (
                <span key={tag} className="text-[0.625rem] font-black uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {vehicles.length > 0 && (
        <div className="flex gap-2 p-3 bg-gray-50 overflow-x-auto snap-x hide-scrollbar">
          {vehicles.map((veh, idx) => (
            <div key={idx} className="flex gap-2 snap-center shrink-0">
              {veh.photo_sign_url && (
                <div className="w-24 h-16 rounded-md overflow-hidden border border-gray-200 shadow-sm relative">
                  <span className="absolute top-1 right-1 bg-black/60 text-white text-[0.5rem] font-bold px-1 rounded backdrop-blur-md">Letrero</span>
                  <img src={`${STORAGE_URL}/${veh.photo_sign_url}`} alt="Letrero" className="w-full h-full object-cover" />
                </div>
              )}
              {veh.photo_front_url && (
                <div className="w-24 h-16 rounded-md overflow-hidden border border-gray-200 shadow-sm relative">
                  <span className="absolute top-1 right-1 bg-black/60 text-white text-[0.5rem] font-bold px-1 rounded backdrop-blur-md">Unidad</span>
                  <img src={`${STORAGE_URL}/${veh.photo_front_url}`} alt="Vehículo" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-3 bg-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider border-t border-gray-200">
         <span className="flex items-center gap-2">
           <MapPin size={16} /> Ver itinerario completo
         </span>
         <ArrowRight size={16} className={`transition-colors ${isSelected ? 'text-primary-500' : 'text-gray-400'}`} />
      </div>
    </motion.div>
  );
};
