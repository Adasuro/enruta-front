import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Button } from '../../../../components/atoms/Button';
import { Input } from '../../../../components/atoms/Input';
import { authService } from '../../services/authService';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await authService.login(email, password);
      // Guardar sesión de forma sencilla por ahora
      localStorage.setItem('enruta_token', data.token);
      localStorage.setItem('enruta_user', JSON.stringify(data.user));
      
      // Redirigir a consola
      window.location.href = '/console';
    } catch (error) {
      const err = error as { response?: { data?: { errors?: { email?: string[] }, message?: string } } };
      // Manejar error de validación de Laravel u otro error
      if (err.response?.data?.errors?.email) {
        setError(err.response.data.errors.email[0]);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al intentar iniciar sesión. Revisa tu conexión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src="/logo.webp" alt="EnRuta Logo" className="login-logo-img" />
          </div>
          <p>Plataforma B2B para Operadores</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <Input 
            label="Correo Electrónico" 
            type="email" 
            placeholder="admin@enruta.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={error ? undefined : undefined} // Evitar doble borde rojo, usamos el error global abajo
          />
          <Input 
            label="Contraseña" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="text-danger text-sm text-center">{error}</div>}

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Ingresar'} <LogIn size={18} />
          </Button>
        </form>

        <div className="login-footer">
          ¿No tienes una cuenta? <a href="#">Solicitar acceso</a>
        </div>
      </div>
    </div>
  );
};
