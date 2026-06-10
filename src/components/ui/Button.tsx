import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props 
  }, ref) => {
    const baseClass = 'ui-btn';
    const variantClass = `${baseClass}--${variant}`;
    const sizeClass = `${baseClass}--${size}`;
    const widthClass = fullWidth ? `${baseClass}--full` : '';
    const loadingClass = isLoading ? `${baseClass}--loading` : '';

    return (
      <button 
        ref={ref}
        className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <span className="ui-btn__spinner" />}
        {!isLoading && leftIcon && <span className="ui-btn__icon-left">{leftIcon}</span>}
        <span className="ui-btn__text">{children}</span>
        {!isLoading && rightIcon && <span className="ui-btn__icon-right">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
