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
    const baseClasses = 'inline-flex items-center justify-center gap-2 border-[1.5px] border-transparent rounded-lg font-semibold cursor-pointer whitespace-nowrap outline-none transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500';
    
    const variants = {
      primary: 'bg-primary-500 text-white shadow-sm hover:bg-primary-600 hover:shadow-md',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      outline: 'bg-transparent border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-500',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
      danger: 'bg-danger-500 text-white shadow-sm hover:bg-danger-600 hover:shadow-md'
    };
    
    const sizes = {
      sm: 'py-1 px-3 text-xs',
      md: 'py-2 px-5 text-sm min-h-[48px]',
      lg: 'py-3 px-8 text-base min-h-[56px]'
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button 
        ref={ref}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="flex items-center justify-center">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex items-center justify-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
