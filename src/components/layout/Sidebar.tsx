import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, Settings, LogOut, BusFront, Store, 
  ChevronDown, Plus, Check, Activity, Map, 
  Users, BarChart3, Briefcase, LayoutDashboard,
  ShieldCheck, HelpCircle, MoreHorizontal, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// --- CONFIGURATION ---

type NavLinkItem = {
    to: string;
    label: string;
    icon: React.ReactNode;
    exact?: boolean;
};

type NavSectionConfig = {
    id: string;
    title: string;
    icon: React.ReactNode; // Icon for mobile bottom bar
    items: NavLinkItem[];
};

const NAV_CONFIG: Record<string, NavSectionConfig[]> = {
    transport: [
        {
            id: 'overview',
            title: "Visión General",
            icon: <Activity size={20} />,
            items: [
                { to: "/console", label: "Monitor en Vivo", icon: <Activity size={20} />, exact: true },
                { to: "/console/analytics", label: "Estadísticas", icon: <BarChart3 size={20} /> },
            ]
        },
        {
            id: 'routing',
            title: "Enrutamiento",
            icon: <Map size={20} />,
            items: [
                { to: "/console/search", label: "Buscar Rutas", icon: <Map size={20} /> },
            ]
        },
        {
            id: 'routes',
            title: "Circuitos",
            icon: <LayoutDashboard size={20} />,
            items: [
                { to: "/console/routes/list", label: "Mis Rutas", icon: <LayoutDashboard size={20} /> },
                { to: "/console/routes/editor", label: "Trazar Nuevo", icon: <Plus size={20} /> },
            ]
        },
        {
            id: 'ops',
            title: "Operativa",
            icon: <Briefcase size={20} />,
            items: [
                { to: "/console/routes/fleet", label: "Gestión de Flota", icon: <BusFront size={20} /> },
                { to: "/console/users/staff", label: "Personal", icon: <Users size={20} /> },
            ]
        }
    ],
    super_admin: [
        {
            id: 'global',
            title: "Administración",
            icon: <ShieldCheck size={20} />,
            items: [
                { to: "/console/companies", label: "Empresas", icon: <Store size={20} /> },
                { to: "/console/users", label: "Usuarios", icon: <Users size={20} /> },
            ]
        },
        {
            id: 'system',
            title: "Sistema",
            icon: <Settings size={20} />,
            items: [
                { to: "/console/logs", label: "Auditoría", icon: <ShieldCheck size={20} /> },
                { to: "/console/health", label: "Estado API", icon: <Activity size={20} /> },
            ]
        }
    ],
    default: [
        {
            id: 'main',
            title: "Plataforma",
            icon: <LayoutDashboard size={20} />,
            items: [
                { to: "/console", label: "Dashboard", icon: <LayoutDashboard size={20} />, exact: true },
                { to: "/console/help", label: "Ayuda", icon: <HelpCircle size={20} /> },
            ]
        }
    ]
};

// --- ATOMS ---

const NavSectionLabel: React.FC<{ title: string, show: boolean }> = ({ title, show }) => {
  if (!show) return <div style={{ height: 'var(--spacing-4)' }} />;
  return (
    <div style={{
      padding: 'var(--spacing-6) var(--spacing-4) var(--spacing-2)',
      fontSize: '0.65rem',
      fontWeight: 800,
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    }}>
      {title}
    </div>
  );
};

// --- MOLECULES ---

const NavItem: React.FC<{ 
  to: string, 
  icon: React.ReactNode, 
  label: string, 
  isExpanded: boolean, 
  exact?: boolean,
  onClick?: () => void,
  style?: React.CSSProperties
}> = ({ to, icon, label, isExpanded, exact, onClick, style }) => {
  return (
    <NavLink 
      to={to} 
      end={exact}
      onClick={onClick}
      className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-4)',
        padding: '0.75rem 0.875rem',
        borderRadius: 'var(--radius-md)',
        color: 'rgba(255,255,255,0.8)',
        textDecoration: 'none',
        fontWeight: 500,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '0.875rem',
        position: 'relative',
        minHeight: '2.75rem',
        ...style
      }}
    >
      <div style={{ flexShrink: 0, width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.span 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
};

// --- ORGANISM ---

export const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);
  const [activeMobileCategoryId, setActiveMobileCategoryId] = useState<string | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  const { user, logout, activeBusinessId, switchBusiness } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const activeBusiness = user?.businesses?.find(b => b.id === activeBusinessId) || user?.businesses?.[0] || null;
  const isSuperAdmin = user?.role === 'super_admin';

  // Load config based on business type
  const sections = isSuperAdmin 
    ? NAV_CONFIG.super_admin 
    : (activeBusiness ? (NAV_CONFIG[activeBusiness.type] || NAV_CONFIG.default) : NAV_CONFIG.default);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 767);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile popover on location change
  useEffect(() => {
    setActiveMobileCategoryId(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowBusinessMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setActiveMobileCategoryId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const activeMobileSection = sections.find(s => s.id === activeMobileCategoryId);

  return (
    <motion.aside 
      className="sidebar"
      initial={false}
      animate={{ width: isMobile ? '100%' : (isExpanded ? '16.5rem' : '4.5rem') }}
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => {
        if (!isMobile) {
          setIsExpanded(false);
          setShowBusinessMenu(false);
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'visible',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {/* 1. HEADER (Fixed) */}
      <header style={{ flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="hide-on-mobile" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <img src="/logo.webp" alt="EnRuta" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
        </div>

        {/* Business Switcher */}
        <div style={{ padding: isMobile ? '0.75rem 1rem' : '1rem 0.5rem', position: 'relative' }} ref={menuRef}>
            <div 
            onClick={() => !isSuperAdmin && setShowBusinessMenu(!showBusinessMenu)}
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.625rem', 
                borderRadius: 'var(--radius-md)', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                cursor: !isSuperAdmin ? 'pointer' : 'default',
                transition: 'background-color 0.2s'
            }}
            className={!isSuperAdmin ? "hover:bg-white/20" : ""}
            >
            <div style={{ flexShrink: 0, width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSuperAdmin ? <Building size={20} /> : <BusFront size={20} />}
            </div>
            {(isExpanded || isMobile) && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isSuperAdmin ? 'Admin Global' : activeBusiness?.name || 'Sin negocio'}
                  </span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    {isSuperAdmin ? 'Plataforma EnRuta' : getBusinessTypeName(activeBusiness?.type || '')}
                  </span>
                </div>
                {!isSuperAdmin && (
                  <motion.div animate={{ rotate: showBusinessMenu ? 180 : 0 }}>
                    <ChevronDown size={16} style={{ opacity: 0.7 }} />
                  </motion.div>
                )}
              </>
            )}
            </div>

            {/* Dropdown Switcher */}
            <AnimatePresence>
            {showBusinessMenu && !isSuperAdmin && (
                <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.25rem)',
                    left: isMobile ? '1rem' : '0.5rem',
                    right: isMobile ? '1rem' : '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-xl)',
                    overflow: 'hidden',
                    zIndex: 110,
                    color: 'var(--color-gray-900)'
                }}
                >
                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                    <div style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-500)' }}>
                    Tus negocios
                    </div>
                    {user?.businesses?.map((business) => (
                    <button
                        key={business.id}
                        onClick={() => {
                        switchBusiness(business.id);
                        setShowBusinessMenu(false);
                        }}
                        style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0.5rem',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'left',
                        backgroundColor: business.id === activeBusinessId ? 'var(--color-gray-100)' : 'transparent'
                        }}
                        className="hover:bg-gray-50"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'var(--color-primary-100)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Building size={14} />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {business.name}
                        </span>
                        </div>
                        {business.id === activeBusinessId && <Check size={16} style={{ color: 'var(--color-gray-900)' }} />}
                    </button>
                    ))}
                </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </header>

      {/* 2. BODY (Desktop: Vertical List | Mobile: Spacer) */}
      <nav 
        className="sidebar-scroll-nav"
        style={{ 
            flex: 1, 
            padding: '1rem 0.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.25rem', 
            overflowY: 'auto',
            overflowX: 'hidden'
        }}
      >
        <div className="hide-on-mobile">
            {sections.map((section) => (
                <React.Fragment key={section.id}>
                    <NavSectionLabel title={section.title} show={isExpanded} />
                    {section.items.map((item, idx) => (
                        <NavItem 
                            key={idx} 
                            to={item.to} 
                            icon={item.icon} 
                            label={item.label} 
                            isExpanded={isExpanded} 
                            exact={item.exact}
                        />
                    ))}
                </React.Fragment>
            ))}
        </div>
      </nav>

      {/* 3. FOOTER (Fixed) */}
      <footer className="hide-on-mobile" style={{ flexShrink: 0, padding: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavItem to="/console/settings" icon={<Settings size={20} />} label="Configuración" isExpanded={isExpanded} />
        <button 
          onClick={handleLogout} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', padding: '0.75rem 0.875rem', borderRadius: 'var(--radius-md)', 
            color: '#ff8a80', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 600 
          }}
          className="sidebar-nav-link hover:bg-white/10"
        >
          <div style={{ flexShrink: 0, width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={20} />
          </div>
          {isExpanded && <span style={{ fontSize: '0.875rem' }}>Cerrar Sesión</span>}
        </button>
      </footer>

      {/* 4. MOBILE BOTTOM BAR (Horizontal Carousel) */}
      <div className="mobile-bottom-bar" style={{ display: 'none' }}>
        <div 
          className="mobile-nav-carousel"
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '8px',
            padding: '8px 16px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
            {sections.map((section) => (
                <motion.button
                    key={section.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveMobileCategoryId(activeMobileCategoryId === section.id ? null : section.id)}
                    style={{
                        flex: '0 0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        width: '72px',
                        padding: '8px 4px',
                        background: activeMobileCategoryId === section.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none',
                        color: 'white',
                        borderRadius: 'var(--radius-md)',
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{ opacity: activeMobileCategoryId === section.id ? 1 : 0.6 }}>{section.icon}</div>
                    <span style={{ fontSize: '10px', fontWeight: 700, textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {section.title}
                    </span>
                </motion.button>
            ))}
            
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveMobileCategoryId(activeMobileCategoryId === 'more' ? null : 'more')}
                style={{
                    flex: '0 0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    width: '72px',
                    background: activeMobileCategoryId === 'more' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none',
                    color: 'white',
                    borderRadius: 'var(--radius-md)'
                }}
            >
                <MoreHorizontal size={20} style={{ opacity: 0.6 }} />
                <span style={{ fontSize: '10px', fontWeight: 700 }}>Más</span>
            </motion.button>
        </div>
      </div>

      {/* 5. MOBILE BRANDED BOTTOM SHEET (DREAMDEV REFINE) */}
      <AnimatePresence>
        {activeMobileCategoryId && (
            <>
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveMobileCategoryId(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        zIndex: 999,
                        pointerEvents: 'auto'
                    }}
                />
                
                {/* Bottom Sheet */}
                <motion.div
                    ref={mobileMenuRef}
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)',
                        borderTopLeftRadius: '24px',
                        borderTopRightRadius: '24px',
                        padding: '1rem 1rem calc(5rem + env(safe-area-inset-bottom))',
                        boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                        border: '1px solid rgba(255,255,255,0.1)',
                        pointerEvents: 'auto'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ 
                            width: '36px', height: '4px', borderRadius: '2px', 
                            background: 'rgba(255,255,255,0.4)',
                        }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'white' }}>
                            {activeMobileCategoryId === 'more' ? 'Ajustes de Plataforma' : activeMobileSection?.title}
                        </span>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveMobileCategoryId(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={16} />
                        </motion.button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {activeMobileCategoryId === 'more' ? (
                            <>
                                <NavItem 
                                    to="/console/settings" 
                                    icon={<Settings size={20} />} 
                                    label="Configuración" 
                                    isExpanded={true} 
                                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }} 
                                    onClick={() => setActiveMobileCategoryId(null)}
                                />
                                <button 
                                    onClick={handleLogout} 
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', padding: '0.875rem', borderRadius: 'var(--radius-md)', 
                                        color: '#ff8a80', background: 'rgba(255,138,128,0.1)', border: '1px solid rgba(255,138,128,0.2)', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 700, fontSize: '0.875rem' 
                                    }}
                                >
                                    <LogOut size={20} />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </>
                        ) : (
                            activeMobileSection?.items.map((item, idx) => (
                                <NavItem 
                                    key={idx} 
                                    to={item.to} 
                                    icon={item.icon} 
                                    label={item.label} 
                                    isExpanded={true} 
                                    exact={item.exact}
                                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    onClick={() => setActiveMobileCategoryId(null)}
                                />
                            ))
                        )}
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      <style>{`
        .sidebar-scroll-nav::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll-nav::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .sidebar-scroll-nav:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
        
        .sidebar-nav-link:hover { color: white !important; background-color: rgba(255,255,255,0.1) !important; }
        .sidebar-nav-link.active { 
          color: white !important; 
          background: rgba(255,255,255,0.2) !important;
          border-left: 3px solid white !important;
          font-weight: 800 !important; 
        }
        
        .hover\\:bg-white\\/20:hover { background-color: rgba(255,255,255,0.2) !important; }
        
        @media (max-width: 767px) {
            .sidebar { 
              width: 100% !important; 
              height: 100vh !important; 
              pointer-events: none;
              background: transparent !important;
              box-shadow: none !important;
            }
            .sidebar * { pointer-events: auto; }
            .hide-on-mobile { display: none !important; }
            .sidebar-scroll-nav { display: none !important; }
            
            .sidebar > header:nth-child(1) {
              display: block !important;
              position: fixed;
              top: 0; left: 0; right: 0;
              background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
              padding: 0 !important;
              pointer-events: auto;
              z-index: 100;
              box-shadow: var(--shadow-sm);
              border-bottom: none !important;
            }

            .mobile-bottom-bar { 
              display: block !important;
              position: fixed;
              bottom: 0; left: 0; right: 0;
              background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
              padding-bottom: calc(env(safe-area-inset-bottom) + 0.25rem);
              pointer-events: auto;
              z-index: 1001;
              border-top: 1px solid rgba(255,255,255,0.1);
            }
            .mobile-nav-carousel::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </motion.aside>
  );
};
