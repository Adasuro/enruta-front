import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, Building, Settings, LogOut, ChevronDown, BusFront, Store } from 'lucide-react';
import { authService, type User } from '../../../../features/auth/services/authService';

export const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [user] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('enruta_user');
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  });
  
  const activeBusiness = user?.businesses?.[0] || null;
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
    if (type === 'local_commerce') return <Store size={20} />;
    return <BusFront size={20} />;
  };

  const getBusinessTypeName = (type: string) => {
    if (type === 'transport') return 'Transporte';
    if (type === 'tourism_agency') return 'Agencia Turística';
    if (type === 'local_commerce') return 'Comercio Local';
    return 'Negocio';
  };

  return (
    <motion.aside 
      className="sidebar"
      initial={false}
      animate={{ width: isExpanded ? '16rem' : '4.5rem' }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        backgroundColor: 'var(--brand-primary)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {/* Header / Logo */}
      <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <img src="/logo.webp" alt="EnRuta" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
      </div>

      {/* Business Selector / Context */}
      <div style={{ padding: '1rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
          {isSuperAdmin ? <Building size={20} /> : activeBusiness ? getBusinessIcon(activeBusiness.type) : <Building size={20} />}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isSuperAdmin ? 'Admin Global' : activeBusiness?.name || 'Sin negocio'}
                </span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                  {isSuperAdmin ? 'Plataforma EnRuta' : getBusinessTypeName(activeBusiness?.type || '')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavItem to="/console" icon={<Route size={20} />} label="Buscar Rutas" isExpanded={isExpanded} hidden={!isStandardUser} />
        
        {isSuperAdmin && (
          <>
            <NavItem to="/console/routes/editor" icon={<Route size={20} />} label="Maestro Rutas" isExpanded={isExpanded} />
            <NavItem to="/console/companies" icon={<Store size={20} />} label="Empresas" isExpanded={isExpanded} />
          </>
        )}

        {!isSuperAdmin && !isStandardUser && activeBusiness?.type === 'transport' && (
          <>
            <NavItem to="/console/routes/editor" icon={<Route size={20} />} label="Trazar Ruta" isExpanded={isExpanded} />
            <NavItem to="/console/routes/fleet" icon={<BusFront size={20} />} label="Mi Flota" isExpanded={isExpanded} />
          </>
        )}
        
        {!isSuperAdmin && !isStandardUser && (
            <NavItem to="/console/business" icon={<Building size={20} />} label="Mi Empresa" isExpanded={isExpanded} />
        )}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavItem to="/console/settings" icon={<Settings size={20} />} label="Configuración" isExpanded={isExpanded} />
        <button 
          onClick={handleLogout} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0.875rem', borderRadius: 'var(--radius-md)', 
            color: '#ff8a80', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 600 
          }}
        >
          <LogOut size={20} />
          {isExpanded && <span style={{ fontSize: '0.875rem' }}>Cerrar Sesión</span>}
        </button>
      </div>

      {/* Estilos específicos para NavLink activo */}
      <style>{`
        .sidebar-nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 0.875rem;
          border-radius: var(--radius-md);
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }
        .sidebar-nav-link:hover {
          color: white;
          background-color: rgba(255,255,255,0.1);
        }
        .sidebar-nav-link.active {
          color: white;
          background-color: rgba(255,255,255,0.15);
          font-weight: 700;
        }
        @media (max-width: 767px) {
            .sidebar {
                width: 100% !important;
                height: 4.5rem !important;
                top: auto !important;
                bottom: 0 !important;
                flex-direction: row !important;
                background-color: var(--brand-primary) !important;
            }
            .sidebar > div:not(:nth-child(3)), nav > div { display: none !important; }
            nav { flex-direction: row !important; justify-content: space-around !important; padding: 0 !important; }
            .sidebar-nav-link { flex-direction: column !important; gap: 4px !important; padding: 0.5rem !important; flex: 1; }
            .sidebar-nav-link span { display: block !important; font-size: 10px !important; }
        }
      `}</style>
    </motion.aside>
  );
};

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string, isExpanded: boolean, hidden?: boolean }> = ({ to, icon, label, isExpanded, hidden }) => {
  if (hidden) return null;
  return (
    <NavLink to={to} className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
      {icon}
      <AnimatePresence>
        {isExpanded && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
};
