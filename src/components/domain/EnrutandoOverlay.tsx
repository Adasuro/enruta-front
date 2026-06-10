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
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.img 
                    src="/logo.webp" 
                    alt="EnRuta" 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    style={{ width: '80px', height: 'auto', zIndex: 2 }} 
                />
                <div className="enrutando-rings">
                    {[1, 2, 3].map((i) => (
                        <motion.div 
                            key={i}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: [0, 0.4, 0] }}
                            transition={{ repeat: Infinity, duration: 3, delay: i - 1, ease: "easeOut" }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                border: '2px solid var(--brand-primary)',
                                borderRadius: '50%'
                            }}
                        />
                    ))}
                </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-primary)', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Enrutando
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--color-gray-500)', margin: 0, fontWeight: 500 }}>
                {message || 'Buscando las mejores conexiones...'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
