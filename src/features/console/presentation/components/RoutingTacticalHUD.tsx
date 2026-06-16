import React from 'react';
import { Menu, X, Bus, Search, Crosshair, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../../../../contexts/UIContext';

interface RoutingTacticalHUDProps {
  onToggleSearch: () => void;
  onToggleTransport: () => void;
  onLocateMe: () => void;
  onToggleLock: () => void;
  isSearchOpen: boolean;
  isTransportOpen: boolean;
  isLocked: boolean;
  hasResults: boolean;
  resultCount: number;
}

export const RoutingTacticalHUD: React.FC<RoutingTacticalHUDProps> = ({
  onToggleSearch,
  onToggleTransport,
  onLocateMe,
  onToggleLock,
  isSearchOpen,
  isTransportOpen,
  isLocked,
  hasResults,
  resultCount
}) => {
  const { isSidebarOpen, toggleSidebar } = useUI();

  return (
    <div className="fixed bottom-6 right-6 z-[900] flex flex-col gap-3 items-end">
      {/* Secondary Actions (Stacked above) */}
      <AnimatePresence>
        {!isTransportOpen && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="flex flex-col gap-3"
            >
                {/* GPS Button */}
                <button 
                    onClick={onLocateMe}
                    className="w-12 h-12 rounded-2xl bg-white text-gray-700 shadow-2xl flex items-center justify-center border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all"
                    title="Mi ubicación"
                >
                    <Crosshair size={22} />
                </button>

                {/* Map Lock Button */}
                <button 
                    onClick={onToggleLock}
                    className={`w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center border transition-all active:scale-95 ${
                        isLocked ? 'bg-warning-500 border-warning-600 text-white' : 'bg-white border-gray-100 text-gray-400'
                    }`}
                    title={isLocked ? "Mapa bloqueado" : "Mapa libre"}
                >
                    {isLocked ? <Lock size={22} /> : <Unlock size={22} />}
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tactical Actions (Bottom row) */}
      <div className="flex items-center gap-3">
        {/* Search Panel Toggle */}
        <button 
          onClick={onToggleSearch}
          className={`h-14 px-5 rounded-2xl shadow-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${
            isSearchOpen ? 'bg-danger-500 text-white' : 'bg-white text-gray-700 border border-gray-100'
          }`}
        >
          {isSearchOpen ? <X size={20} /> : <Search size={20} />}
          <span className="max-md:hidden">{isSearchOpen ? 'Cerrar' : 'Buscar'}</span>
        </button>

        {/* Transport Options Toggle */}
        {hasResults && (
            <button 
                onClick={onToggleTransport}
                className={`h-14 px-5 rounded-2xl shadow-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${
                    isTransportOpen ? 'bg-primary-600 text-white' : 'bg-success-500 text-white'
                }`}
            >
                <Bus size={20} />
                <span>{isTransportOpen ? 'Ocultar' : `Rutas (${resultCount})`}</span>
            </button>
        )}

        {/* Global Menu Toggle (The BIG button) */}
        <button 
          onClick={toggleSidebar}
          className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all active:scale-90 z-[1002] md:hidden ${
            isSidebarOpen ? 'bg-primary-900 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
          title="Menú Principal"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </div>
  );
};
