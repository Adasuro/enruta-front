import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevation?: 'xs' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  elevation = 'sm',
  bordered = true
}) => {
  const baseClass = 'ui-card';
  const paddingClass = `ui-card--padding-${padding}`;
  const elevationClass = `ui-card--elevation-${elevation}`;
  const borderClass = bordered ? 'ui-card--bordered' : '';

  return (
    <div className={`${baseClass} ${paddingClass} ${elevationClass} ${borderClass} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`ui-card__header ${className}`}>{children}</div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`ui-card__body ${className}`}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`ui-card__footer ${className}`}>{children}</div>
);
