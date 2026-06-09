import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import './ConsoleLayout.css';

export const ConsoleLayout: React.FC = () => {
  return (
    <div className="console-layout">
      <Sidebar />
      <main className="console-main">
        {/* Aquí renderizan las sub-rutas (dashboard, rutas, perfil, etc.) */}
        <Outlet />
      </main>
    </div>
  );
};
