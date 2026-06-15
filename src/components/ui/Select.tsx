import React, { forwardRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, success, helperText, options, placeholder, className = '', id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    // Estados visuales exactos al Input.tsx
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
          <label htmlFor={selectId} className="text-[0.875rem] font-bold text-gray-700 tracking-[0.01em]">
            {label}
          </label>
        )}
        
        <div className={`relative flex items-center w-full border-[1.5px] border-solid rounded-lg min-h-[48px] overflow-hidden transition-all duration-200 ${stateClasses}`}>
          <select 
            ref={ref}
            id={selectId}
            disabled={disabled}
            className="w-full p-3 pr-10 border-none bg-transparent text-base outline-none text-gray-900 disabled:cursor-not-allowed appearance-none cursor-pointer"
            {...props} 
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Custom Dropdown Arrow */}
          <div className="absolute right-3 pointer-events-none text-gray-400">
            <ChevronDown size={18} strokeWidth={2.5} />
          </div>
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

Select.displayName = 'Select';
