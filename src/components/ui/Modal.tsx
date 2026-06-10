import React, { useEffect, forwardRef } from 'react';
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
    
    // Bloquear scroll y manejar tecla ESC
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

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div className="ui-modal-backdrop" onClick={handleBackdropClick}>
        <div 
          ref={ref}
          className={`ui-modal-container ui-modal--${size}`}
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
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
