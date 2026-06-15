import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon: React.ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    variant = 'ghost', 
    size = 'md', 
    isLoading = false,
    icon,
    className = '',
    disabled,
    ...props 
  }, ref) => {
    // Clases base garantizando un área táctil cuadrada perfecta
    const baseClasses = 'inline-flex items-center justify-center border border-transparent rounded-lg cursor-pointer outline-none transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 shrink-0';
    
    // El usuario "Ve": Colores semánticos limpios
    const variants = {
      primary: 'bg-primary-500 text-white shadow-sm hover:bg-primary-600',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      outline: 'bg-transparent border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-500',
      ghost: 'bg-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-100',
      danger: 'bg-transparent text-gray-400 hover:text-danger-600 hover:bg-danger-50'
    };
    
    // El usuario "Hace": Áreas táctiles cómodas (mínimo 44px recomendado en mobile, md es cercano)
    const sizes = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    };

    return (
      <button 
        ref={ref}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 24 : 18} /> : icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
