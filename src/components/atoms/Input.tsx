import React, { useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', type, id, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`atom-input-wrapper ${className}`}>
      {label && <label htmlFor={inputId} className="atom-input-label">{label}</label>}
      <div className="atom-input-container">
        <input 
          id={inputId}
          type={inputType}
          className={`atom-input ${error ? 'atom-input--error' : ''} ${isPassword ? 'atom-input--with-icon' : ''}`}
          {...props} 
        />
        {isPassword && (
          <button 
            type="button"
            className="atom-input-icon-btn"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="atom-input-error">{error}</span>}
    </div>
  );
};
