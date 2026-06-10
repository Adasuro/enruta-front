import React from 'react';
import { Bus, ArrowRight } from 'lucide-react';

interface RouteResultCardProps {
  route: {
    id: string;
    visual_code: string;
    display_name: string | null;
    color_primary: string;
    fare: {
      amount: number;
      currency: string;
    };
  };
  isSelected?: boolean;
  onClick?: () => void;
}

export const RouteResultCard: React.FC<RouteResultCardProps> = ({ 
  route, 
  isSelected = false, 
  onClick 
}) => {
  return (
    <div 
      className={`domain-route-card ${isSelected ? 'domain-route-card--selected' : ''}`}
      onClick={onClick}
      style={{ '--route-color': route.color_primary } as React.CSSProperties}
    >
      <div className="domain-route-card__header">
        <div 
          className="domain-route-card__visual-code" 
          style={{ 
            backgroundColor: route.color_primary, 
            boxShadow: `0 4px 12px ${route.color_primary}55` 
          }}
        >
          {route.visual_code}
        </div>
        <div className="domain-route-card__info">
          <h4 className="domain-route-card__name">{route.display_name || `Línea ${route.visual_code}`}</h4>
          <div className="domain-route-card__fare">
            Pasaje: <span>{route.fare.currency} {route.fare.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="domain-route-card__footer">
         <span className="domain-route-card__action">
           <Bus size={18} /> Ver recorrido
         </span>
         <ArrowRight size={18} className="domain-route-card__arrow" />
      </div>
    </div>
  );
};
