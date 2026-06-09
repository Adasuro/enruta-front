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
            {isExpanded && (
              <div className="business-info">
                <span className="business-name" style={{ color: 'var(--color-primary-500)', fontWeight: 'bold' }}>Admin Global</span>
                <span className="business-type">Plataforma EnRuta</span>
              </div>
            )}
          </div>
        ) : activeBusiness ? (
          <div className="business-active">
            {getBusinessIcon(activeBusiness.type)}
            {isExpanded && (
              <>
                <div className="business-info">
                  <span className="business-name">{activeBusiness.name}</span>
                  <span className="business-type">{getBusinessTypeName(activeBusiness.type)}</span>
                </div>
                <ChevronDown size={16} className="icon-chevron" />
              </>
            )}
          </div>
        ) : (
          <div className="business-active" style={{ opacity: 0.5 }}>
            <Building size={20} className="icon-business" />
            {isExpanded && <span className="business-name">Sin negocio asignado</span>}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {/* Rutas exclusivas para SuperAdmin */}
        {isSuperAdmin && (
          <>
            <NavLink 
              to="/console/routes/editor" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Route size={20} />
              {isExpanded && <span>Editor Maestro de Rutas</span>}
            </NavLink>
            <NavLink 
              to="/console/companies" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Store size={20} />
              {isExpanded && <span>Gestión de Empresas</span>}
            </NavLink>
          </>
        )}

        {/* Rutas para B2B Transportistas */}
        {!isSuperAdmin && activeBusiness?.type === 'transport' && (
          <>
            <NavLink 
              to="/console/routes/editor" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Route size={20} />
              {isExpanded && <span>Trazar Nueva Ruta</span>}
            </NavLink>
            <NavLink 
              to="/console/routes/fleet" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <BusFront size={20} />
              {isExpanded && <span>Mis Flotas y Tarifas</span>}
            </NavLink>
          </>
        )}
        
        {!isSuperAdmin && (
          <NavLink 
            to="/console/business" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Building size={20} />
            {isExpanded && <span>Mi Empresa</span>}
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-profile" style={{ display: isExpanded ? 'flex' : 'none', padding: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div style={{ marginLeft: '10px', overflow: 'hidden' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-heading)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        </div>

        <NavLink 
          to="/console/settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={20} />
          {isExpanded && <span>Configuración</span>}
        </NavLink>
        
        <button onClick={handleLogout} className="nav-item text-danger" style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', fontFamily: 'inherit' }}>
          <LogOut size={20} />
          {isExpanded && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};
