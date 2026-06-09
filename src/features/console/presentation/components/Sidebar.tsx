import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Route, Building, Settings, LogOut, ChevronDown, BusFront, Store } from 'lucide-react';
import { authService, type User } from '../../../../features/auth/services/authService';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [user] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('enruta_user');
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  });
  const [activeBusiness] = useState<{id: string, name: string, type: string} | null>(() => {
    const storedUser = localStorage.getItem('enruta_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as User;
      return parsedUser.businesses && parsedUser.businesses.length > 0 
        ? parsedUser.businesses[0] 
        : null;
    }
    return null;
  });

  const isSuperAdmin = user?.role === 'super_admin';
  const isStandardUser = user?.role === 'standard_user';

  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error during logout", error);
    } finally {
      navigate('/login');
    }
  };

  const getBusinessIcon = (type: string) => {
    if (type === 'local_commerce') return <Store size={20} className="icon-business" />;
    return <BusFront size={20} className="icon-business" />;
  };

  const getBusinessTypeName = (type: string) => {
    if (type === 'transport') return 'Transporte';
    if (type === 'tourism_agency') return 'Agencia Turística';
    if (type === 'local_commerce') return 'Comercio Local';
    return 'Negocio';
  };

  return (
    <aside 
      className={`sidebar ${isExpanded ? 'sidebar--expanded' : 'sidebar--collapsed'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/logo.webp" alt="EnRuta" className="sidebar-logo-img" />
        </div>
      </div>

      <div className="sidebar-business-selector">
        {isSuperAdmin ? (
          <div className="business-active">
            <Building size={20} className="icon-business" />
            <div className="business-info nav-text">
              <span className="business-name" style={{ color: 'var(--color-primary-500)', fontWeight: 'bold' }}>Admin Global</span>
              <span className="business-type">Plataforma EnRuta</span>
            </div>
          </div>
        ) : activeBusiness ? (
          <div className="business-active">
            {getBusinessIcon(activeBusiness.type)}
            <div className="business-info nav-text">
              <span className="business-name">{activeBusiness.name}</span>
              <span className="business-type">{getBusinessTypeName(activeBusiness.type)}</span>
            </div>
            <ChevronDown size={16} className="icon-chevron nav-text" />
          </div>
        ) : (
          <div className="business-active" style={{ opacity: 0.5 }}>
            <Building size={20} className="icon-business" />
            <span className="business-name nav-text">Sin negocio</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {/* Rutas para Usuarios Standard (B2C) */}
        {isStandardUser && (
          <NavLink 
            to="/console" 
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Route size={20} />
            <span className="nav-text">Buscar Rutas</span>
          </NavLink>
        )}

        {/* Rutas exclusivas para SuperAdmin */}
        {isSuperAdmin && (
          <>
            <NavLink 
              to="/console/routes/editor" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Route size={20} />
              <span className="nav-text">Maestro Rutas</span>
            </NavLink>
            <NavLink 
              to="/console/companies" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Store size={20} />
              <span className="nav-text">Empresas</span>
            </NavLink>
          </>
        )}

        {/* Rutas para B2B Transportistas */}
        {!isSuperAdmin && !isStandardUser && activeBusiness?.type === 'transport' && (
          <>
            <NavLink 
              to="/console/routes/editor" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Route size={20} />
              <span className="nav-text">Trazar Ruta</span>
            </NavLink>
            <NavLink 
              to="/console/routes/fleet" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <BusFront size={20} />
              <span className="nav-text">Mi Flota</span>
            </NavLink>
          </>
        )}
        
        {!isSuperAdmin && !isStandardUser && (
          <NavLink 
            to="/console/business" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Building size={20} />
            <span className="nav-text">Mi Empresa</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-profile nav-text">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>

        <NavLink 
          to="/console/settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={20} />
          <span className="nav-text">Configuración</span>
        </NavLink>
        
        <button onClick={handleLogout} className="nav-item text-danger logout-btn">
          <LogOut size={20} />
          <span className="nav-text">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

