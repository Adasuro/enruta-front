import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral',
  size = 'md'
}) => {
  const baseClass = 'ui-badge';
  const variantClass = `ui-badge--${variant}`;
  const sizeClass = `ui-badge--${size}`;

  return (
    <span className={`${baseClass} ${variantClass} ${sizeClass}`}>
      {children}
    </span>
  );
};
