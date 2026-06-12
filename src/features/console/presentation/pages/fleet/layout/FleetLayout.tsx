import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { BusFront, LayoutDashboard, Map, Wrench, Plus, Activity, Bus } from 'lucide-react';
import { Button } from '../../../../../../components/ui';

export const FleetLayout: React.FC = () => {
  const location = useLocation();

  const tabs = [
    { name: 'Directorio', path: '/console/fleet/list', icon: <LayoutDashboard size={18} /> },
    { name: 'Rastreo en Vivo', path: '/console/fleet/map', icon: <Map size={18} /> },
    { name: 'Mantenimiento', path: '/console/fleet/maintenance', icon: <Wrench size={18} /> },
  ];

  const handleOpenModal = () => {
    window.dispatchEvent(new CustomEvent('open-add-vehicle-modal'));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 1. Header Contextual */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-8 md:py-5 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2 text-primary-500 font-extrabold text-[0.75rem] md:text-[0.8125rem] mb-1 md:mb-1.5 uppercase tracking-widest">
            <BusFront size={16} className="md:w-[18px] md:h-[18px]" />
            <span>Operativa / Flota</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 m-0 tracking-tight">Gestión de Flota</h1>
        </div>
        
        <Button 
          variant="primary" 
          leftIcon={<Plus size={18} />} 
          onClick={handleOpenModal}
          className="w-full sm:w-auto"
        >
          Registrar Vehículo
        </Button>
      </header>

      {/* 2. Ribbon de KPIs */}
      <div className="bg-white px-4 md:px-8 py-4 border-b border-gray-100 flex gap-6 md:gap-8 overflow-x-auto shrink-0 [scrollbar-width:none] snap-x snap-mandatory">
        
        <div className="flex items-center gap-3 shrink-0 snap-start">
          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
            <Bus size={20} />
          </div>
          <div>
            <div className="text-xl font-black text-gray-900 leading-none">0 <span className="text-sm font-bold text-gray-400">/ 0</span></div>
            <div className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mt-1">Flota Operativa</div>
          </div>
        </div>
        
        <div className="w-px h-10 bg-gray-200 shrink-0 hidden md:block"></div>
        
        <div className="flex items-center gap-3 shrink-0 snap-start">
          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
            <Wrench size={20} />
          </div>
          <div>
            <div className="text-xl font-black text-gray-900 leading-none">0</div>
            <div className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mt-1">En Taller</div>
          </div>
        </div>

        <div className="w-px h-10 bg-gray-200 shrink-0 hidden md:block"></div>
        
        <div className="flex items-center gap-3 shrink-0 snap-start">
          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-xl font-black text-gray-900 leading-none">0</div>
            <div className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mt-1">Alertas Activas</div>
          </div>
        </div>
      </div>

      {/* 3. Navegación Secundaria (Tabs) */}
      <div className="bg-white px-4 md:px-8 border-b border-gray-200 shrink-0 flex gap-6 overflow-x-auto [scrollbar-width:none]">
        {tabs.map((tab) => {
          const isActive = location.pathname.includes(tab.path);
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 py-4 border-b-2 font-bold transition-colors whitespace-nowrap outline-none ${
                isActive 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span className="text-sm">{tab.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* 4. Workspace Content (Outlet) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <Outlet />
      </div>
    </div>
  );
};