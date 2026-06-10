import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardBody } from '../../../../components/ui';
import { authService } from '../../services/authService';
import { useAuth } from '../../../../contexts/AuthContext';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await authService.login(email, password);
      login(data.token, data.user);
      navigate('/console');
    } catch (err) {
      const errorObj = err as { response?: { data?: { errors?: { email?: string[] }, message?: string } } };
      if (errorObj.response?.data?.errors?.email) {
        setError(errorObj.response.data.errors.email[0]);
      } else if (errorObj.response?.data?.message) {
        setError(errorObj.response.data.message);
      } else {
        setError('Error al intentar iniciar sesión. Revisa tu conexión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" elevation="lg" padding="none">
        <CardHeader className="login-header">
          <div className="login-logo">
            <img src="/logo.webp" alt="EnRuta Logo" className="login-logo-img" />
          </div>
          <h1 className="login-title">Bienvenido</h1>
          <p className="login-subtitle">Plataforma de Gestión para Operadores</p>
        </CardHeader>
        
        <CardBody className="login-body">
          <form onSubmit={handleSubmit} className="login-form">
            <Input 
              label="Correo Electrónico" 
              type="email" 
              placeholder="admin@enruta.pe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={18} />}
              error={error && error.toLowerCase().includes('correo') ? error : undefined}
              required
            />
            <Input 
              label="Contraseña" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
              required
            />

            {error && !error.toLowerCase().includes('correo') && (
              <div className="login-error-alert animate-fade-in">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              fullWidth 
              size="lg"
              isLoading={isLoading} 
              rightIcon={<LogIn size={20} />}
              className="login-submit-btn"
            >
              Iniciar Sesión
            </Button>
          </form>
        </CardBody>

        <div className="login-footer">
          ¿No tienes una cuenta? <a href="#" className="login-link">Solicitar acceso empresarial</a>
        </div>
      </Card>
    </div>
  );
};
