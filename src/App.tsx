import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/presentation/pages/LoginPage';
import { RegisterPage } from './features/auth/presentation/pages/RegisterPage';
import { ConsoleLayout } from './components/layout/ConsoleLayout';
import { RouteCreatorPage } from './features/console/presentation/pages/routes/RouteCreatorPage';
import { B2BRoutesPage } from './features/console/presentation/pages/routes/B2BRoutesPage';
import { ConsoleDashboardPage } from './features/console/presentation/pages/ConsoleDashboardPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Redirigir el home al login o al mapa B2C en el futuro */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Rutas de autenticación */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protegido: Accesible por admin y operadores */}
      <Route element={<ProtectedRoute allowedRoles={['super_admin', 'console_user']} />}>
        <Route path="/console" element={<ConsoleLayout />}>
          {/* Dashboard Dinámico / Buscar Rutas */}
          <Route index element={<ConsoleDashboardPage />} />
          
          {/* Creador de Rutas */}
          <Route path="routes/editor" element={<RouteCreatorPage />} />

          {/* Gestión de Operaciones (Flota) */}
          <Route path="routes/fleet" element={<B2BRoutesPage />} />
        </Route>
      </Route>
      
      {/* TODO: Add Super Admin specific routes here wrapped in <ProtectedRoute allowedRoles={['super_admin']}> */}
    </Routes>
  );
}

export default App;
