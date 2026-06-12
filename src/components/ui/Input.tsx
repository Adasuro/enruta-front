import React, { useState, useId, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, helperText, leftIcon, rightIcon, className = '', type, id, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    const inputId = id || generatedId;
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    // Determinamos las clases de estado usando la sintaxis nativa de focus-within de Tailwind
    let stateClasses = 'border-gray-200 bg-gray-50 focus-within:border-primary-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-primary-500 focus-within:shadow-sm hover:border-gray-300';
    
    if (error) {
      stateClasses = 'border-danger-500 bg-white focus-within:ring-1 focus-within:ring-danger-500 focus-within:shadow-sm';
    } else if (success) {
      stateClasses = 'border-success-500 bg-white focus-within:ring-1 focus-within:ring-success-500 focus-within:shadow-sm';
    }

    if (disabled) {
      stateClasses = 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed';
    }

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label htmlFor={inputId} className="text-[0.875rem] font-bold text-gray-700 tracking-[0.01em]">
            {label}
          </label>
        )}
        
        <div 
          className={`group flex items-center w-full border-[1.5px] border-solid rounded-lg min-h-[48px] overflow-hidden transition-all duration-200 ${stateClasses}`}
        >
          {leftIcon && (
            <div className={`pl-3 flex items-center justify-center transition-colors duration-200 ${error ? 'text-danger-500' : 'text-gray-400 group-focus-within:text-primary-500'}`}>
              {leftIcon}
            </div>
          )}
          
          <input 
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            className="w-full p-3 border-none bg-transparent text-base outline-none text-gray-900 disabled:cursor-not-allowed placeholder:text-gray-400"
            {...props} 
          />

          {isPassword && (
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="px-3 bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}

          {!isPassword && rightIcon && (
            <div className="pr-3 text-gray-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-1 mt-1 text-danger-500 text-xs overflow-hidden font-medium"
            >
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {helperText && !error && (
          <p className="text-xs text-gray-500 m-0 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
