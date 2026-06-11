import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Building2, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardBody } from '../../../../components/ui';
import { authService } from '../../services/authService';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../hooks/useNotification';
import './LoginPage.css';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [accountType, setAccountType] = useState<'b2c' | 'b2b'>('b2b');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const { error, success } = useNotification();
  const navigate = useNavigate();

  // Validación en tiempo real (feedback)
  const isLengthValid = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const isPasswordValid = isLengthValid && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
  const doPasswordsMatch = password === passwordConfirmation && password !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      error("La contraseña no cumple con los requisitos de seguridad.");
      return;
    }
    if (!doPasswordsMatch) {
      error("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    setInputError(null);

    try {
      const data = await authService.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role_type: accountType
      });
      
      login(data.token, data.user);
      success("Cuenta creada exitosamente");
      
      // Redirección basada en el tipo de cuenta
      if (accountType === 'b2c') {
        navigate('/'); // Mapa B2C
      } else {
        navigate('/console'); // Onboarding/Console B2B
      }
    } catch (err) {
      const errorObj = err as { response?: { data?: { errors?: Record<string, string[]>, message?: string } } };
      
      if (errorObj.response?.data?.errors) {
        // Tomar el primer error del objeto errors
        const firstErrorKey = Object.keys(errorObj.response.data.errors)[0];
        const msg = errorObj.response.data.errors[firstErrorKey][0];
        if (firstErrorKey === 'email') {
          setInputError(msg);
        } else {
          error(msg, "Error de validación");
        }
      } else if (errorObj.response?.data?.message) {
        error(errorObj.response.data.message, "Error al registrarse");
      } else {
        error('Error al registrar cuenta. Revisa tu conexión.', "Error de red");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" style={{ maxWidth: '500px' }} elevation="lg" padding="none">
        <CardHeader className="login-header">
          <div className="login-logo">
            <img src="/logo.webp" alt="EnRuta Logo" className="login-logo-img" />
          </div>
          <h1 className="login-title">Crear Cuenta</h1>
          <p className="login-subtitle">Únete a EnRuta</p>
        </CardHeader>
        
        <CardBody className="login-body">
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-gray-700)' }}>
              Tipo de Cuenta
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div 
                onClick={() => setAccountType('b2c')}
                style={{
                  padding: '1rem',
                  border: `2px solid ${accountType === 'b2c' ? 'var(--brand-primary)' : 'var(--color-gray-200)'}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  backgroundColor: accountType === 'b2c' ? 'var(--color-primary-50)' : 'white',
                  transition: 'all 0.2s'
                }}
              >
                <UserIcon size={24} style={{ margin: '0 auto 0.5rem', color: accountType === 'b2c' ? 'var(--brand-primary)' : 'var(--color-gray-500)' }} />
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: accountType === 'b2c' ? 'var(--brand-primary)' : 'var(--color-gray-700)' }}>Usuario Regular</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '0.25rem' }}>Explorar rutas</div>
              </div>
              <div 
                onClick={() => setAccountType('b2b')}
                style={{
                  padding: '1rem',
                  border: `2px solid ${accountType === 'b2b' ? 'var(--brand-primary)' : 'var(--color-gray-200)'}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  backgroundColor: accountType === 'b2b' ? 'var(--color-primary-50)' : 'white',
                  transition: 'all 0.2s'
                }}
              >
                <Building2 size={24} style={{ margin: '0 auto 0.5rem', color: accountType === 'b2b' ? 'var(--brand-primary)' : 'var(--color-gray-500)' }} />
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: accountType === 'b2b' ? 'var(--brand-primary)' : 'var(--color-gray-700)' }}>Empresa / Negocio</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '0.25rem' }}>Gestionar operaciones</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <Input 
              label="Nombre Completo" 
              type="text" 
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserIcon size={18} />}
              required
            />
            <Input 
              label="Correo Electrónico" 
              type="email" 
              placeholder="juan@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={18} />}
              error={inputError || undefined}
              required
            />
            
            <div style={{ position: 'relative' }}>
              <Input 
                label="Contraseña" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={18} />}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '2.1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-400)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {password.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ color: isLengthValid ? 'var(--color-green-600)' : 'var(--color-gray-500)' }}>
                  {isLengthValid ? '✓' : '○'} Mínimo 8 caracteres
                </div>
                <div style={{ color: (hasUpperCase && hasLowerCase) ? 'var(--color-green-600)' : 'var(--color-gray-500)' }}>
                  {(hasUpperCase && hasLowerCase) ? '✓' : '○'} Mayúsculas y minúsculas
                </div>
                <div style={{ color: hasNumber ? 'var(--color-green-600)' : 'var(--color-gray-500)' }}>
                  {hasNumber ? '✓' : '○'} Al menos 1 número
                </div>
                <div style={{ color: hasSpecial ? 'var(--color-green-600)' : 'var(--color-gray-500)' }}>
                  {hasSpecial ? '✓' : '○'} Carácter especial (!@#$...)
                </div>
              </div>
            )}

            <Input 
              label="Confirmar Contraseña" 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              leftIcon={<Lock size={18} />}
              error={(passwordConfirmation.length > 0 && !doPasswordsMatch) ? "Las contraseñas no coinciden" : undefined}
              required
            />

            <Button 
              type="submit" 
              fullWidth 
              size="lg"
              isLoading={isLoading} 
              disabled={!isPasswordValid || !doPasswordsMatch}
              className="login-submit-btn"
              style={{ marginTop: '1rem' }}
            >
              Registrarse
            </Button>
          </form>
        </CardBody>

        <div className="login-footer">
          ¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="login-link">Iniciar sesión aquí</a>
        </div>
      </Card>
    </div>
  );
};
