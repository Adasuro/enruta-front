import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnrutandoOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const EnrutandoOverlay: React.FC<EnrutandoOverlayProps> = ({ isVisible, message }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white/75 backdrop-blur-md flex items-center justify-center z-[9999]"
        >
          <div className="flex flex-col items-center gap-10 text-center">
            <div className="relative w-[120px] h-[120px] flex items-center justify-center">
                <motion.img 
                    src="/logo.webp" 
                    alt="EnRuta" 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-[80px] h-auto z-10 drop-shadow-sm" 
                />
                <div className="absolute inset-0">
                    {[1, 2, 3].map((i) => (
                        <motion.div 
                            key={i}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: [0, 0.4, 0] }}
                            transition={{ repeat: Infinity, duration: 3, delay: i - 1, ease: "easeOut" }}
                            className="absolute inset-0 border-2 border-primary-500 rounded-full"
                        />
                    ))}
                </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-extrabold text-primary-500 m-0 tracking-[0.1em] uppercase">
                Enrutando
              </h2>
              <p className="text-base text-gray-500 m-0 font-medium">
                {message || 'Buscando las mejores conexiones...'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
