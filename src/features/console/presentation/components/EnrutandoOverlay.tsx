import React from 'react';
import './EnrutandoOverlay.css';

interface EnrutandoOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const EnrutandoOverlay: React.FC<EnrutandoOverlayProps> = ({ 
  isVisible, 
  message = 'Buscando las mejores rutas...' 
}) => {
  if (!isVisible) return null;

  return (
    <div className="enrutando-overlay">
      <div className="enrutando-content">
        <div className="enrutando-logo-wrapper">
          <img src="/logo.webp" alt="EnRuta" className="enrutando-logo-pulse" />
          <div className="enrutando-rings">
            <div className="ring"></div>
            <div className="ring"></div>
            <div className="ring"></div>
          </div>
        </div>
        <div className="enrutando-text-wrapper">
          <h2 className="enrutando-title">Enrutando</h2>
          <p className="enrutando-message">{message}</p>
        </div>
      </div>
    </div>
  );
};
