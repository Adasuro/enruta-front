import React from 'react';
import { Bus, Footprints } from 'lucide-react';
import { type Journey, type JourneyStep } from '../../features/console/services/routeService';

interface JourneyTimelineProps {
  journey: Journey;
}

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

export const MultimodalJourney: React.FC<JourneyTimelineProps> = ({ journey }) => {
  return (
    <div className="flex flex-col py-2 px-4 gap-0">
      {journey.steps.map((step, idx) => (
        <JourneyStepItem 
            key={idx} 
            step={step} 
            isLast={idx === journey.steps.length - 1} 
        />
      ))}
    </div>
  );
};

const JourneyStepItem: React.FC<{ step: JourneyStep; isLast: boolean }> = ({ step, isLast }) => {
  const isWalk = step.type === 'WALK';
  
  return (
    <div className="flex gap-4">
      {/* Connector Line */}
      <div className="flex flex-col items-center w-6">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
            isWalk ? 'bg-gray-100 text-gray-400' : 'bg-primary-500 text-white shadow-sm shadow-primary-200'
        }`}>
            {isWalk ? <Footprints size={12} strokeWidth={2.5} /> : <Bus size={12} strokeWidth={2.5} />}
        </div>
        {!isLast && (
            <div className={`w-0.5 flex-1 ${isWalk ? 'bg-dashed-gray' : 'bg-primary-500'}`} 
                 style={{ 
                     backgroundImage: isWalk ? 'linear-gradient(to bottom, var(--color-gray-200) 50%, transparent 50%)' : 'none',
                     backgroundSize: '1px 8px',
                     backgroundRepeat: 'repeat-y',
                     backgroundColor: isWalk ? 'transparent' : 'var(--brand-primary)'
                 }} 
            />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-6 ${isLast ? 'pb-2' : ''}`}>
        <div className="flex flex-col gap-1">
            <h5 className="text-[0.8125rem] font-black text-gray-900 leading-tight uppercase tracking-tight">
                {isWalk ? 'Caminata' : `Subir a ${step.route_info?.visual_code}`}
            </h5>
            
            <p className="text-[0.875rem] text-gray-500 font-medium leading-relaxed">
                {isWalk ? (
                    <>Camina <span className="font-bold text-gray-700">{step.distance_m}m</span> hasta <span className="text-gray-900 font-bold">{step.instruction?.split(' hasta ')[1] || 'el punto de abordaje'}</span></>
                ) : (
                    <>Viaja desde <span className="font-bold text-gray-900">{step.boarding_stop}</span> hasta <span className="font-bold text-gray-900">{step.exit_stop}</span></>
                )}
            </p>

            {!isWalk && step.vehicle_references && step.vehicle_references.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                    <span className="text-[0.625rem] font-bold text-gray-400 uppercase tracking-widest">Identifica tu unidad</span>
                    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                        {step.vehicle_references.map((veh, i) => (
                            <div key={i} className="flex gap-2 shrink-0">
                                {veh.photo_sign_url && (
                                    <div className="group relative w-32 h-20 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                        <img src={`${STORAGE_URL}/${veh.photo_sign_url}`} alt="Letrero" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1.5">
                                            <span className="text-[0.5rem] font-black text-white uppercase tracking-tighter">Letrero</span>
                                        </div>
                                    </div>
                                )}
                                {veh.photo_front_url && (
                                    <div className="group relative w-32 h-20 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                        <img src={`${STORAGE_URL}/${veh.photo_front_url}`} alt="Unidad" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1.5">
                                            <span className="text-[0.5rem] font-black text-white uppercase tracking-tighter">Unidad</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
