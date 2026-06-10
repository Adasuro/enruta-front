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
    const [isFocused, setIsFocused] = useState(false);
    const generatedId = useId();
    const inputId = id || generatedId;
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`ui-input-wrapper ${className}`}>
        {label && (
          <label htmlFor={inputId} className="ui-input-label">
            {label}
          </label>
        )}
        
        <motion.div 
          className="ui-input-container"
          animate={{
            borderColor: error ? 'var(--color-danger)' : (success ? 'var(--color-success)' : (isFocused ? 'var(--brand-primary)' : 'var(--color-gray-200)')),
            backgroundColor: isFocused ? 'var(--color-white)' : 'var(--color-gray-50)',
            boxShadow: isFocused ? '0 0 0 1px var(--brand-primary), var(--shadow-md)' : 'none',
          }}
          transition={{ duration: 0.2 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            border: '1.5px solid',
            borderRadius: 'var(--radius-md)',
            minHeight: '48px',
            overflow: 'hidden'
          }}
        >
          {leftIcon && (
            <div className="ui-input-icon-wrapper" style={{ paddingLeft: 'var(--spacing-3)', color: isFocused ? 'var(--brand-primary)' : 'var(--color-gray-400)' }}>
              {leftIcon}
            </div>
          )}
          
          <input 
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
                width: '100%',
                padding: 'var(--spacing-3)',
                border: 'none',
                background: 'transparent',
                fontSize: 'var(--font-size-base)',
                outline: 'none',
                color: 'var(--color-gray-900)'
            }}
            {...props} 
          />

          {isPassword && (
            <button 
              type="button"
              className="ui-input-icon-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              style={{ padding: '0 var(--spacing-3)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-400)' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}

          {!isPassword && rightIcon && (
            <div className="ui-input-icon-wrapper" style={{ paddingRight: 'var(--spacing-3)', color: 'var(--color-gray-400)' }}>
              {rightIcon}
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: 'var(--color-danger)', fontSize: 'var(--font-size-xs)' }}
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';
