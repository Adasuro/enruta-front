import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { OnboardingPage } from '../../features/console/presentation/pages/OnboardingPage';

export const ConsoleLayout: React.FC = () => {
  const { user } = useAuth();
  
  const isSuperAdmin = user?.role === 'super_admin';
  const hasBusiness = user?.businesses && user.businesses.length > 0;

  // Si no es super admin y no tiene negocios, mostrar el Onboarding en lugar del layout
  if (!isSuperAdmin && !hasBusiness) {
    return <OnboardingPage />;
  }

  return (
    <div className="console-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main className="console-main" style={{ flex: 1, paddingLeft: '4.5rem', transition: 'padding-left 0.25s ease', height: '100%', position: 'relative' }}>
        {/* Aquí renderizan las sub-rutas (dashboard, rutas, perfil, etc.) */}
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden' }}>
            <Outlet />
        </div>
      </main>
      
      <style>{`
        @media (max-width: 767px) {
            .console-main { 
              padding-left: 0 !important; 
              padding-bottom: 4.5rem; 
              padding-top: 4rem; 
            }
        }
      `}</style>
    </div>
  );
};
