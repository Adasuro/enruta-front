import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevation?: 'xs' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  elevation = 'sm',
  bordered = true,
  style
}) => {
  const baseClass = 'ui-card';
  const paddingClass = `ui-card--padding-${padding}`;
  const elevationClass = `ui-card--elevation-${elevation}`;
  const borderClass = bordered ? 'ui-card--bordered' : '';

  return (
    <div className={`${baseClass} ${paddingClass} ${elevationClass} ${borderClass} ${className}`} style={style}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => (
  <div className={`ui-card__header ${className}`} style={style}>{children}</div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => (
  <div className={`ui-card__body ${className}`} style={style}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => (
  <div className={`ui-card__footer ${className}`} style={style}>{children}</div>
);
