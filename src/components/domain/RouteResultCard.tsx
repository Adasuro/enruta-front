import React from 'react';
import { Bus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface RouteResultCardProps {
  route: {
    id: string;
    visual_code: string;
    display_name: string | null;
    color_primary: string;
    fare: {
      amount: number;
      currency: string;
    };
  };
  isSelected?: boolean;
  onClick?: () => void;
}

export const RouteResultCard: React.FC<RouteResultCardProps> = ({ 
  route, 
  isSelected = false, 
  onClick 
}) => {
  return (
    <motion.div 
      whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-xl border-[1.5px] cursor-pointer overflow-hidden transition-colors duration-200 shadow-sm ${
        isSelected ? 'border-primary-500 ring-1 ring-primary-500 bg-primary-50/30' : 'border-gray-200 hover:border-primary-300'
      }`}
      onClick={onClick}
    >
      <div className="p-4 flex gap-4 items-center border-b border-gray-100">
        <div 
          className="w-12 h-12 rounded-lg text-white font-extrabold flex items-center justify-center text-lg shrink-0" 
          style={{ 
            backgroundColor: route.color_primary, 
            boxShadow: `0 4px 12px ${route.color_primary}44` 
          }}
        >
          {route.visual_code}
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h4 className="text-[0.9375rem] font-bold text-gray-900 m-0 truncate leading-snug">
            {route.display_name || `Línea ${route.visual_code}`}
          </h4>
          <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
            Tarifa: <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">{route.fare.currency} {route.fare.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between text-xs font-bold text-primary-500 uppercase tracking-wider">
         <span className="flex items-center gap-2">
           <Bus size={16} /> Ver itinerario
         </span>
         <ArrowRight size={16} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
      </div>
    </motion.div>
  );
};
