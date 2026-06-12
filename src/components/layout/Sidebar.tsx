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
    icon: React.ReactNode;
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

const NavSectionLabel: React.FC<{ title: string, show: boolean, isCollapsed: boolean, onToggle: () => void }> = ({ title, show, isCollapsed, onToggle }) => {
  if (!show) return <div className="h-4" />;
  return (
    <div 
      onClick={onToggle}
      className="flex items-center justify-between px-4 pt-6 pb-2 cursor-pointer hover:opacity-80 transition-opacity"
    >
      <div className="text-[0.65rem] font-extrabold text-primary-200/50 uppercase tracking-widest whitespace-nowrap overflow-hidden">
        {title}
      </div>
      <ChevronDown size={12} className={`text-primary-200/50 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
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
  className?: string
}> = ({ to, icon, label, isExpanded, exact, onClick, className = '' }) => {
  return (
    <NavLink 
      to={to} 
      end={exact}
      onClick={onClick}
      className={({ isActive }) => `flex items-center gap-4 py-3 px-3.5 rounded-lg text-gray-300 no-underline font-medium transition-all duration-200 text-sm relative min-h-[2.75rem] hover:text-white hover:bg-white/5 ${isActive ? '!text-white !bg-primary-800 border-l-[3px] !border-primary-400 !font-extrabold' : 'border-l-[3px] border-transparent'} ${className}`}
    >
      <div className="shrink-0 w-5 flex items-center justify-center">{icon}</div>
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.span 
            key="label"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            className="whitespace-nowrap overflow-hidden text-ellipsis"
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
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  
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

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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
      initial={false}
      animate={{ width: isMobile ? '100%' : (isExpanded ? '16.5rem' : '4.5rem') }}
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => {
        if (!isMobile) {
          setIsExpanded(false);
          setShowBusinessMenu(false);
        }
      }}
      className="fixed top-0 left-0 h-screen bg-primary-900 text-white flex flex-col z-[100] shadow-lg max-md:bg-none max-md:bg-transparent max-md:shadow-none max-md:pointer-events-none"
    >
      {/* 1. HEADER (Fixed) */}
      <header className="shrink-0 border-b border-white/5 max-md:block max-md:fixed max-md:top-0 max-md:left-0 max-md:right-0 max-md:bg-primary-900 max-md:p-0 max-md:pointer-events-auto max-md:z-[100] max-md:shadow-sm max-md:border-none">
        <div className="p-5 flex justify-center max-md:hidden">
            <img src="/logo.webp" alt="EnRuta" className="h-8 brightness-0 invert" />
        </div>

        {/* Business Switcher */}
        <div className="p-4 max-md:px-4 max-md:py-3 relative pointer-events-auto" ref={menuRef}>
            <div 
            onClick={() => !isSuperAdmin && setShowBusinessMenu(!showBusinessMenu)}
            className={`flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5 transition-colors duration-200 ${!isSuperAdmin ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'}`}
            >
            <div className="shrink-0 w-5 flex items-center justify-center text-primary-300">
                {isSuperAdmin ? <Building size={20} /> : <BusFront size={20} />}
            </div>
            {(isExpanded || isMobile) && (
              <>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-bold truncate text-white">
                    {isSuperAdmin ? 'Admin Global' : activeBusiness?.name || 'Sin negocio'}
                  </span>
                  <span className="text-xs text-primary-300">
                    {isSuperAdmin ? 'Plataforma EnRuta' : getBusinessTypeName(activeBusiness?.type || '')}
                  </span>
                </div>
                {!isSuperAdmin && (
                  <motion.div animate={{ rotate: showBusinessMenu ? 180 : 0 }}>
                    <ChevronDown size={16} className="text-gray-400" />
                  </motion.div>
                )}
              </>
            )}
            </div>

            {/* Dropdown Switcher */}
            <AnimatePresence>
            {showBusinessMenu && !isSuperAdmin && (
                <motion.div
                key="business-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-[calc(100%+0.25rem)] left-2 right-2 max-md:left-4 max-md:right-4 bg-white rounded-lg shadow-xl overflow-hidden z-[110] text-gray-900 border border-gray-200"
                >
                <div className="p-2 flex flex-col gap-0.5">
                    <div className="p-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tus negocios
                    </div>
                    {user?.businesses?.map((business) => (
                    <button
                        key={business.id}
                        onClick={() => {
                        switchBusiness(business.id);
                        setShowBusinessMenu(false);
                        }}
                        className={`flex items-center justify-between w-full p-2 border-none bg-transparent cursor-pointer rounded text-left hover:bg-gray-50 ${business.id === activeBusinessId ? 'bg-gray-100' : ''}`}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-6 h-6 rounded bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                            <Building size={14} />
                        </div>
                        <span className="text-sm font-medium truncate text-gray-900">
                            {business.name}
                        </span>
                        </div>
                        {business.id === activeBusinessId && <Check size={16} className="text-primary-600" />}
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
        className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-y-auto overflow-x-hidden max-md:hidden pointer-events-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
      >
        <div>
            {sections.map((section) => {
                const isCollapsed = collapsedSections[section.id];
                return (
                  <React.Fragment key={section.id}>
                      <NavSectionLabel 
                        title={section.title} 
                        show={isExpanded} 
                        isCollapsed={isCollapsed} 
                        onToggle={() => toggleSection(section.id)} 
                      />
                      <AnimatePresence initial={false}>
                        {(!isCollapsed || !isExpanded) && (
                          <motion.div
                            key={`content-${section.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-1 overflow-hidden"
                          >
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                  </React.Fragment>
                );
            })}
        </div>
      </nav>

      {/* 3. FOOTER (Fixed) */}
      <footer className="shrink-0 p-2 border-t border-white/5 flex flex-col gap-1 max-md:hidden pointer-events-auto">
        <NavItem to="/console/settings" icon={<Settings size={20} />} label="Configuración" isExpanded={isExpanded} />
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-4 py-3 px-3.5 rounded-lg text-danger-400 bg-transparent border-none cursor-pointer w-full text-left font-medium hover:bg-white/5 transition-colors duration-200"
        >
          <div className="shrink-0 w-5 flex items-center justify-center">
            <LogOut size={20} />
          </div>
          {isExpanded && <span className="text-sm">Cerrar Sesión</span>}
        </button>
      </footer>

      {/* 4. MOBILE BOTTOM BAR (Horizontal Carousel) */}
      <div className="hidden max-md:block fixed bottom-0 left-0 right-0 bg-primary-900 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pointer-events-auto z-[1001] border-t border-white/5">
        <div 
          className="flex overflow-x-auto gap-2 px-4 py-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
        >
            {sections.map((section) => (
                <motion.button
                    key={section.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveMobileCategoryId(activeMobileCategoryId === section.id ? null : section.id)}
                    className={`shrink-0 flex flex-col items-center justify-center gap-1 w-[72px] px-1 py-2 border-none text-white rounded-md transition-colors duration-200 cursor-pointer ${activeMobileCategoryId === section.id ? 'bg-primary-800' : 'bg-transparent'}`}
                >
                    <div className={activeMobileCategoryId === section.id ? 'text-primary-300' : 'text-gray-400'}>{section.icon}</div>
                    <span className={`text-[10px] text-center w-full truncate ${activeMobileCategoryId === section.id ? 'font-bold text-white' : 'font-medium text-gray-400'}`}>
                        {section.title}
                    </span>
                </motion.button>
            ))}
            
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveMobileCategoryId(activeMobileCategoryId === 'more' ? null : 'more')}
                className={`shrink-0 flex flex-col items-center justify-center gap-1 w-[72px] border-none rounded-md cursor-pointer transition-colors duration-200 ${activeMobileCategoryId === 'more' ? 'bg-primary-800 text-white' : 'bg-transparent text-gray-400'}`}
            >
                <MoreHorizontal size={20} className={activeMobileCategoryId === 'more' ? 'text-primary-300' : 'text-gray-400'} />
                <span className={`text-[10px] ${activeMobileCategoryId === 'more' ? 'font-bold text-white' : 'font-medium'}`}>Más</span>
            </motion.button>
        </div>
      </div>

      {/* 5. MOBILE BRANDED BOTTOM SHEET (DREAMDEV REFINE) */}
      <AnimatePresence>
        {activeMobileCategoryId && (
            <motion.div 
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveMobileCategoryId(null)}
                className="fixed inset-0 bg-black/60 z-[999] pointer-events-auto max-md:block hidden"
            />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeMobileCategoryId && (
            <motion.div
                key="sheet"
                ref={mobileMenuRef}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-primary-900 rounded-t-3xl pt-4 px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-[1000] border-t border-white/10 pointer-events-auto max-md:block hidden"
            >
                <div className="flex justify-center mb-5">
                    <div className="w-9 h-1 rounded-full bg-white/20" />
                </div>

                <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-[0.7rem] font-black uppercase tracking-widest text-white">
                        {activeMobileCategoryId === 'more' ? 'Ajustes de Plataforma' : activeMobileSection?.title}
                    </span>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveMobileCategoryId(null)} className="bg-white/10 hover:bg-white/20 transition-colors border-none text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
                        <X size={16} />
                    </motion.button>
                </div>
                
                <div className="flex flex-col gap-1.5">
                    {activeMobileCategoryId === 'more' ? (
                        <>
                            <NavItem 
                                to="/console/settings" 
                                icon={<Settings size={20} />} 
                                label="Configuración" 
                                isExpanded={true} 
                                className="!bg-white/5 border !border-white/5"
                                onClick={() => setActiveMobileCategoryId(null)}
                            />
                            <button 
                                onClick={handleLogout} 
                                className="flex items-center gap-4 p-3.5 rounded-lg text-danger-400 bg-danger-500/10 border border-danger-500/20 cursor-pointer w-full text-left font-bold text-sm transition-colors hover:bg-danger-500/20"
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
                                className="!bg-white/5 border !border-white/5"
                                onClick={() => setActiveMobileCategoryId(null)}
                            />
                        ))
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};
