import React, { useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, children, footer, size = 'md' }, ref) => {
    
    useEffect(() => {
      if (!isOpen) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };

      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen, onClose]);

    const backdropVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };

    const modalVariants: any = {
      hidden: { opacity: 0, scale: 0.95, y: 20 },
      visible: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: { type: 'spring', damping: 25, stiffness: 300 }
      },
      exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="ui-modal-backdrop" 
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={handleBackdropClick}
          >
            <motion.div 
              ref={ref}
              className={`ui-modal-container ui-modal--${size}`}
              variants={modalVariants}
              role="dialog"
              aria-modal="true"
              aria-labelledby="ui-modal-title"
            >
              <div className="ui-modal-header">
                <h3 id="ui-modal-title" className="ui-modal-title">{title}</h3>
                <button 
                  className="ui-modal-close-btn" 
                  onClick={onClose}
                  aria-label="Cerrar modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="ui-modal-body">
                {children}
              </div>

              {footer && (
                <div className="ui-modal-footer">
                  {footer}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

Modal.displayName = 'Modal';
