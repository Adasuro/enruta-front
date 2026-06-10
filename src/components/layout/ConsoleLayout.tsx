import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const ConsoleLayout: React.FC = () => {
  return (
    <div className="console-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main className="console-main" style={{ flex: 1, paddingLeft: '4.5rem', transition: 'padding-left 0.25s ease', height: '100%', position: 'relative' }}>
        {/* Aquí renderizan las sub-rutas (dashboard, rutas, perfil, etc.) */}
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Outlet />
        </div>
      </main>
      
      <style>{`
        @media (max-width: 767px) {
            .console-main { padding-left: 0 !important; padding-bottom: 4.5rem; }
        }
      `}</style>
    </div>
  );
};
