import React from 'react';
import { X, Bus, Info, ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VehicleReference {
    type: string;
    photo_front_url?: string;
    photo_sign_url?: string;
    photo_side_url?: string;
}

interface VehicleGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    routeName: string | null;
    visualCode: string;
    color: string;
    references: VehicleReference[];
}

export const VehicleGalleryModal: React.FC<VehicleGalleryModalProps> = ({
    isOpen,
    onClose,
    routeName,
    visualCode,
    color,
    references
}) => {
    // Resolve Storage URL with fallback
    const getFullUrl = (path?: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        
        const storageBase = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';
        // Ensure no double slashes
        const cleanBase = storageBase.endsWith('/') ? storageBase.slice(0, -1) : storageBase;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        
        return `${cleanBase}${cleanPath}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between" style={{ borderLeft: `12px solid ${color}` }}>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-4">
                                    <div className="px-4 py-1.5 rounded-xl text-white font-black text-2xl shadow-lg" style={{ backgroundColor: color }}>
                                        {visualCode}
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                        Identificación del Bus
                                    </h2>
                                </div>
                                <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-[0.7rem]">
                                    {routeName || 'Línea de Transporte Público'}
                                </p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-90"
                            >
                                <X size={24} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {references && references.length > 0 ? (
                                <div className="flex flex-col gap-12">
                                    {references.map((veh, idx) => (
                                        <div key={idx} className="flex flex-col gap-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: color }}>
                                                    <Bus size={20} strokeWidth={2.5} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-gray-800 text-lg leading-none">{veh.type || 'Unidad de Flota'}</span>
                                                    <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-tighter mt-1">Referencia Visual de 3 Ángulos</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Photo Front */}
                                                <div className="flex flex-col gap-2">
                                                    <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gray-100 border-4 border-white shadow-xl group">
                                                        {veh.photo_front_url ? (
                                                            <img 
                                                                src={getFullUrl(veh.photo_front_url)} 
                                                                alt="Vista Frontal" 
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/f3f4f6/9ca3af?text=Imagen+no+disponible';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                                <ImageOff size={32} />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-4 left-4 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20">
                                                            <span className="text-[0.625rem] font-black text-white uppercase tracking-widest">Vista Frontal</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Photo Sign */}
                                                <div className="flex flex-col gap-2">
                                                    <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gray-100 border-4 border-white shadow-xl group">
                                                        {veh.photo_sign_url ? (
                                                            <img 
                                                                src={getFullUrl(veh.photo_sign_url)} 
                                                                alt="Letrero Frontal" 
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/f3f4f6/9ca3af?text=Imagen+no+disponible';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                                <ImageOff size={32} />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-4 left-4 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20">
                                                            <span className="text-[0.625rem] font-black text-white uppercase tracking-widest">Letrero</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Photo Side */}
                                                <div className="flex flex-col gap-2">
                                                    <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gray-100 border-4 border-white shadow-xl group">
                                                        {veh.photo_side_url ? (
                                                            <img 
                                                                src={getFullUrl(veh.photo_side_url)} 
                                                                alt="Vista Lateral" 
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/f3f4f6/9ca3af?text=Imagen+no+disponible';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                                <ImageOff size={32} />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-4 left-4 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20">
                                                            <span className="text-[0.625rem] font-black text-white uppercase tracking-widest">Vista Lateral</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 mb-6 border-2 border-dashed border-gray-100">
                                        <Bus size={48} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900">Sin fotos disponibles</h3>
                                    <p className="text-gray-500 max-w-xs mt-3 font-medium leading-relaxed">
                                        Esta línea todavía no ha proporcionado fotos reales de sus unidades. 
                                        <span className="block mt-2 text-gray-400 text-sm">Guíate por el color y el código visual en el mapa.</span>
                                    </p>
                                </div>
                            )}

                            {/* Important Tip */}
                            <div className="mt-10 p-6 rounded-[2rem] bg-amber-50 border border-amber-100 flex gap-4 shadow-inner">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                                    <Info size={24} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-black text-amber-900 text-sm uppercase tracking-tight">Consejo de viaje</h4>
                                    <p className="text-amber-800 text-xs mt-1.5 leading-relaxed font-medium">
                                        Las fotos son referenciales. Verifica siempre que el <strong>código visual ({visualCode})</strong> coincida con el bus que llega al paradero.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                            <button 
                                onClick={onClose}
                                className="px-10 py-4 rounded-2xl bg-gray-900 text-white font-black hover:bg-black transition-all shadow-xl active:scale-95 hover:-translate-y-1"
                            >
                                ¡ENTENDIDO!
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
            `}</style>
        </AnimatePresence>
    );
};
