import React from 'react';

interface RouteVisualIdentityProps {
  code: string;
  color: string;
  secondaryColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const RouteVisualIdentity: React.FC<RouteVisualIdentityProps> = ({
  code,
  color,
  secondaryColor = '#FFFFFF',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-3xl'
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-2xl font-black flex items-center justify-center shadow-lg shrink-0 select-none ${className}`}
      style={{ 
        backgroundColor: color, 
        color: secondaryColor,
        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
      }}
    >
      {code}
    </div>
  );
};
