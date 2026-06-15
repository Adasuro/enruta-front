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

    const sizes = {
      sm: 'max-w-[440px]',
      md: 'max-w-[640px]',
      lg: 'max-w-[800px]',
      xl: 'max-w-[1100px]',
      full: 'max-w-[95vw] h-[95vh]'
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-[1000] backdrop-blur-sm" 
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={handleBackdropClick}
          >
            <motion.div 
              ref={ref}
              className={`bg-white rounded-2xl w-[90%] flex flex-col shadow-2xl max-h-[90vh] outline-none ${sizes[size]}`}
              variants={modalVariants}
              role="dialog"
              aria-modal="true"
              aria-labelledby="ui-modal-title"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h3 id="ui-modal-title" className="text-lg font-extrabold text-gray-900 m-0 tracking-tight">{title}</h3>
                <button 
                  className="bg-gray-50 border-none p-2 rounded-full cursor-pointer text-gray-400 flex items-center justify-center transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-primary-500 outline-none" 
                  onClick={onClose}
                  aria-label="Cerrar modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
                {children}
              </div>

              {footer && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
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
