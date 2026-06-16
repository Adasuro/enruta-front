import React from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useUI } from '../../contexts/UIContext';

export const GlobalHUD: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useUI();
  const location = useLocation();

  const isSearchPage = location.pathname === '/console/search';

  if (isSearchPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1002] md:hidden">
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={toggleSidebar}
        className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all border-none cursor-pointer ${
          isSidebarOpen ? 'bg-primary-900 text-white' : 'bg-primary-600 text-white'
        }`}
      >
        <AnimatePresence mode="wait">
          {isSidebarOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="flex items-center justify-center"
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="flex items-center justify-center"
            >
              <Menu size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
