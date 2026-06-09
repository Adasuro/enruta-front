import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/presentation/pages/LoginPage';
import { ConsoleLayout } from './features/console/presentation/pages/ConsoleLayout';
import { RouteCreatorPage } from './features/console/presentation/pages/routes/RouteCreatorPage';
import { B2BRoutesPage } from './features/console/presentation/pages/routes/B2BRoutesPage';

function App() {
  return (
    <Routes>
      {/* Redirigir el home al login o al mapa B2C en el futuro */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Rutas de autenticación */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas del Console (B2B & Admin) */}
      <Route path="/console" element={<ConsoleLayout />}>
        {/* Dashboard por defecto */}
        <Route index element={
          <div style={{ padding: '2rem' }}>
            <h2>Bienvenido a la Consola de EnRuta</h2>
            <p>Selecciona una opción del menú lateral.</p>
          </div>
        } />
        
        {/* Creador de Rutas (Accesible para Admin y B2B Transportistas) */}
        <Route path="routes/editor" element={<RouteCreatorPage />} />
        
        {/* Gestión de Operaciones (Accesible para B2B Transportistas) */}
        <Route path="routes/fleet" element={<B2BRoutesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
