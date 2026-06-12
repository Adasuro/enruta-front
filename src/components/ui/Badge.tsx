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
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-full whitespace-nowrap';
  
  const variants = {
    success: 'bg-success-50 text-success-600 border border-success-100',
    danger: 'bg-danger-50 text-danger-600 border border-danger-100',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    info: 'bg-info/10 text-info border border-info/20',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[0.625rem]',
    md: 'px-2.5 py-1 text-xs'
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};
