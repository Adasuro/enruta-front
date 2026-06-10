import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, Building, Settings, LogOut, BusFront, Store } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  
  const activeBusiness = user?.businesses?.[0] || null;
  const isSuperAdmin = user?.role === 'super_admin';

  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 767);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await logout();
    } catch (error) {
      console.error("Error during logout", error);
    } finally {
      navigate('/login');
    }
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
      animate={{ width: isMobile ? '100%' : (isExpanded ? '16rem' : '4.5rem') }}
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => !isMobile && setIsExpanded(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        backgroundColor: 'var(--color-primary-500)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <img src="/logo.webp" alt="EnRuta" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
      </div>

      <div style={{ padding: '1rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
          {isSuperAdmin ? <Building size={20} /> : <BusFront size={20} />}
          <AnimatePresence>
            {(isExpanded || isMobile) && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}
                className="hide-on-mobile"
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

      <nav style={{ flex: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavItem to="/console" icon={<Route size={20} />} label="Buscar" isExpanded={isExpanded || isMobile} />

        <NavItem to="/console/routes/editor" icon={<Route size={20} />} label="Trazar" isExpanded={isExpanded || isMobile} />
        <NavItem to="/console/routes/fleet" icon={<BusFront size={20} />} label="Flota" isExpanded={isExpanded || isMobile} />
        
        {isSuperAdmin && (
          <NavItem to="/console/companies" icon={<Store size={20} />} label="Empresas" isExpanded={isExpanded || isMobile} />
        )}
        
        {/* En móvil, mostramos el logout en el nav principal para que sea accesible */}
        {isMobile && (
          <button onClick={handleLogout} className="sidebar-nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogOut size={20} />
            <span style={{ fontSize: '10px', whiteSpace: 'nowrap', display: 'block' }}>Salir</span>
          </button>
        )}
      </nav>

      <div className="hide-on-mobile" style={{ padding: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavItem to="/console/settings" icon={<Settings size={20} />} label="Ajustes" isExpanded={isExpanded} />
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
        .sidebar-nav-link:hover { color: white; background-color: rgba(255,255,255,0.1); }
        .sidebar-nav-link.active { color: white; background-color: rgba(255,255,255,0.15); font-weight: 700; }
        
        @media (max-width: 767px) {
            .sidebar { 
              width: 100% !important; 
              height: 4.5rem !important; 
              top: auto !important; 
              bottom: 0 !important; 
              flex-direction: row !important; 
              padding-bottom: env(safe-area-inset-bottom);
            }
            .sidebar > div:not(:nth-child(3)), .hide-on-mobile { display: none !important; }
            nav { 
              flex-direction: row !important; 
              justify-content: space-around !important; 
              padding: 0 0.5rem !important; 
              width: 100%;
              align-items: center;
            }
            .sidebar-nav-link { 
              flex-direction: column !important; 
              gap: 4px !important; 
              padding: 0.5rem 0.25rem !important; 
              flex: 1; 
              justify-content: center;
              border-radius: var(--radius-md);
            }
            .sidebar-nav-link span { 
              display: block !important; 
              font-size: 10px !important; 
              line-height: 1;
              opacity: 1 !important;
              transform: none !important;
            }
            .sidebar-nav-link svg {
              width: 20px;
              height: 20px;
            }
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
