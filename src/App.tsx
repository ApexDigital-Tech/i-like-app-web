import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Wallet, 
  LayoutDashboard, 
  Bot, 
  Globe, 
  Bell, 
  Settings, 
  Search, 
  Filter, 
  TrendingUp, 
  Activity, 
  LogOut,
  AppWindow,
  MessageCircle,
  Plus,
  User,
  X,
  Languages,
  ArrowRight,
  Phone,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Shield,
  ChevronDown,
  PlusCircle,
  Menu,
  Zap
} from 'lucide-react';
import { PROPERTIES, Property, ViewState, TRANSLATIONS, PropertyRequest, UserProfile, Appointment, AppNotification } from './types';
import PropertyCard from './components/PropertyCard';
import AINexus from './components/AINexus';
import ExecutiveCalendar from './components/ExecutiveCalendar';
import { useAuth } from './features/auth/hooks/useAuth';
import { useAppInit } from './features/ui/hooks/useAppInit';
import { usePropertyStore } from './features/properties/store/propertyStore';
import { useCRMStore } from './features/crm/store/crmStore';
import { useUIStore } from './features/ui/store/uiStore';
import { Trash2, Edit } from 'lucide-react';
import { getGoogleDriveUrl } from './lib/googleDrive';
import { PropertyModal } from './components/modals/PropertyModal';
import { RequestModal } from './components/modals/RequestModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AppointmentModal } from './components/modals/AppointmentModal';
import { NotificationModal } from './components/modals/NotificationModal';
import { LoginModal } from './components/modals/LoginModal';
import SuperAdminCRM from './components/SuperAdminCRM';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export default function App() {
  const [view, setView] = useState<ViewState>('MARKET');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [search, setSearch] = useState('');
  const [searchCategory, setSearchCategory] = useState<'Venta' | 'Renta'>('Venta');
  const [searchType, setSearchType] = useState<'House' | 'Apartment' | 'Land' | 'Office' | 'Other' | 'All'>('All');
  const [lang, setLang] = useState<'en' | 'es' | 'pt'>('es');
  // Global App Initialization
  useAppInit();

  const { 
    user: currentUser, 
    profile, 
    users: allUsers,
    isAdmin: isAdminUser, 
    isSuperAdmin,
    initialized, 
    login, 
    logout, 
    updateUserRole
  } = useAuth();

  const isSuperUser = isSuperAdmin; // Fix for undefined variable

  const { 
    properties: userProperties, 
    deleteProperty,
    updateProperty 
  } = usePropertyStore();

  const { 
    requests, 
    appointments, 
    notifications, 
    addAppointment,
    addRequest,
    markNotificationRead,
    markAllNotificationsRead,
    updateAppointment,
    addNotification
  } = useCRMStore();

  const { activeModal, setActiveModal, modalData } = useUIStore();

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    console.log('[App] Auth State Changed:', { 
      isLoggedIn: !!currentUser, 
      email: currentUser?.email,
      role: profile?.role,
      initialized,
      isSuperAdmin
    });
  }, [currentUser, profile, initialized, isSuperAdmin]);

  // ✅ ALL hooks BEFORE any early return (Rules of Hooks)
  const filteredProperties = useMemo(() => {
    return userProperties.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                           p.location.toLowerCase().includes(search.toLowerCase());
      const matchesType = searchType === 'All' || p.subType === searchType;
      return matchesSearch && matchesType;
    });
  }, [search, searchType, userProperties]);

  const isLoggedIn = !!currentUser;

  // Early return AFTER all hooks
  if (!initialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-display font-black text-primary uppercase tracking-[0.3em] text-xs animate-pulse">
            Iniciando Protocolo Vid-A...
          </p>
        </div>
      </div>
    );
  }


  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const message = error instanceof Error ? error.message : String(error);
    const errInfo: FirestoreErrorInfo = {
      error: message,
      authInfo: {
        userId: currentUser?.uid,
        email: currentUser?.email,
        emailVerified: currentUser?.emailVerified,
        isAnonymous: currentUser?.isAnonymous,
      },
      operationType,
      path
    };
    
    console.error('Firestore Error: ', errInfo);

    if (message.includes('permission-denied')) {
      alert('⚠️ Error de Permisos: No tienes autorización para realizar esta acción o acceder a estos datos (Aislamiento SaaS).');
    } else if (message.includes('unauthenticated')) {
      alert('🔒 Sesión expirada: Por favor, inicia sesión de nuevo.');
      setActiveModal('login');
    } else {
      alert(`❌ Error en la base de datos (${operationType}): ${message}`);
    }
  };


  const stats = [
    { label: t.active_users, value: '142.8K', trend: '+12.4%', icon: <Activity className="w-4 h-4" /> },
    { label: t.market_cap, value: '$84.2M', trend: '+8.1%', icon: <TrendingUp className="w-4 h-4" /> },
    { label: t.asset_flow, value: '3.4x', trend: '+24.5%', icon: <AppWindow className="w-4 h-4" /> }
  ];

  const handlePropertyClick = (p: Property) => {
    setSelectedProperty(p);
    setView('DETAILS');
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    if (!isSuperAdmin) return;
    const roles = ['Buyer', 'Seller', 'Admin'];
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];
    try {
      const organizationId = profile?.organizationId || 'default-org';
      await updateUserRole(userId, nextRole, organizationId);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta propiedad?')) return;
    try {
      const organizationId = profile?.organizationId || 'default-org';
      await deleteProperty(id, organizationId);
      if (selectedProperty?.id === id) {
        setSelectedProperty(null);
        setView('MARKET');
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `properties/${id}`);
    }
  };

  const handleEditProperty = (p: Property) => {
    setActiveModal('edit_property', { propertyToEdit: p });
  };

  const handleAddAppointment = () => {
    setActiveModal('add_appointment');
  };

  const NavItem = ({ id, label, icon: Icon }: { id: ViewState; label: string; icon: any }) => (
    <button
      onClick={() => setView(id)}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-display uppercase text-xs tracking-widest ${
        view === id 
          ? 'bg-primary/10 text-primary border-r-4 border-primary shadow-[0_0_20px_rgba(255,200,1,0.2)]' 
          : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden md:block font-bold">{label}</span>
    </button>
  );

  // Subcomponent for Admin Dashboard Action Buttons
  const ActionButton = ({ icon: Icon, label, onClick, color = 'primary' }: { icon: any; label: string; onClick: () => void; color?: string }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-${color}/30 group transition-all`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}/10 text-${color} group-hover:bg-${color} group-hover:text-black transition-all`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-display font-black text-zinc-400 group-hover:text-white uppercase tracking-widest">{label}</span>
      </div>
      <ArrowRight className="w-3 h-3 text-zinc-700 group-hover:text-primary transition-all" />
    </button>
  );

  return (
    <div className="min-h-screen flex text-zinc-100 selection:bg-primary/30">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 border-r border-white/5 bg-black/20 backdrop-blur-3xl flex-col z-50">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-display font-black italic text-[#172B36] shadow-[0_0_20px_rgba(255,200,1,0.3)]">I</div>
            <div>
              <h1 className="font-display font-black text-xl italic text-primary leading-none glow-text-primary">I like</h1>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Real Estate Platform</p>
            </div>
          </div>
          <button 
            onClick={() => isLoggedIn ? setActiveModal('add_property') : setActiveModal('login')}
            className="w-full bg-primary/10 text-primary border border-primary/30 py-2.5 rounded-lg font-display font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-[#172B36] transition-all mb-3 flex items-center justify-center gap-2 group"
          >
            <Plus className="w-3 h-3 transition-transform group-hover:rotate-90" /> {t.add_property}
          </button>
          <button 
            onClick={() => isLoggedIn ? setActiveModal('add_request') : setActiveModal('login')}
            className="w-full bg-secondary/10 text-secondary border border-secondary/30 py-2.5 rounded-lg font-display font-bold text-[10px] uppercase tracking-widest hover:bg-secondary hover:text-[#172B36] transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-3 h-3" /> {t.add_request}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 py-8">
          {isSuperAdmin && <NavItem id="SUPER_ADMIN" label="DATA COMMAND" icon={Shield} />}
          {isAdminUser && <NavItem id="ADMIN" label={t.admin} icon={LayoutDashboard} />}
          <NavItem id="MARKET" label={t.market} icon={Building2} />
          <NavItem id="CALENDAR" label={t.calendar} icon={Calendar} />
          <NavItem id="PORTFOLIO" label={t.portfolio} icon={Wallet} />
          <NavItem id="DETAILS" label={t.network} icon={Globe} />
        </nav>

        <div className="p-8 border-t border-white/5 space-y-6">
          <button 
            onClick={() => setActiveModal('settings')}
            className="flex items-center gap-4 text-zinc-500 hover:text-white transition-colors uppercase font-display text-[10px] tracking-widest font-bold group"
          >
            <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" /> {t.settings}
          </button>
          <button 
            onClick={() => isLoggedIn ? logout() : login().then(() => setActiveModal('none'))}
            className={`flex items-center gap-4 transition-all uppercase font-display text-[11px] tracking-[0.2em] font-black group ${isLoggedIn ? 'text-red-400/70 hover:text-red-400' : 'text-zinc-500 hover:text-white'}`}
          >
            {isLoggedIn ? <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> : <User className="w-4 h-4" />}
            {isLoggedIn ? t.logout : t.login}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] glass-panel rounded-[2rem] z-50 px-6 py-4 flex items-center justify-between shadow-2xl border-white/10">
        <button onClick={() => setView('MARKET')} className={`p-2 transition-all ${view === 'MARKET' ? 'text-primary scale-110' : 'text-zinc-500'}`}>
           <Building2 className="w-6 h-6" />
        </button>
        <button onClick={() => setView('CALENDAR')} className={`p-2 transition-all ${view === 'CALENDAR' ? 'text-primary scale-110' : 'text-zinc-500'}`}>
           <Calendar className="w-6 h-6" />
        </button>
        <button 
          onClick={() => isLoggedIn ? setActiveModal('add_property') : setActiveModal('login')}
          className="relative -mt-16 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-[#172B36] shadow-[0_10px_30px_rgba(255,200,1,0.5)] border-4 border-surface active:scale-95 transition-transform"
        >
           <Plus className="w-7 h-7" />
        </button>
        <button onClick={() => setView('PORTFOLIO')} className={`p-2 transition-all ${view === 'PORTFOLIO' ? 'text-primary scale-110' : 'text-zinc-500'}`}>
           <Wallet className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => setActiveModal('settings')} className="p-2 text-zinc-500 hover:text-white transition-colors">
             <User className="w-6 h-6" />
          </button>
          {isLoggedIn ? (
            <button 
              onClick={() => logout()} 
              className="p-2 ml-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"
              title={t.logout}
            >
               <LogOut className="w-6 h-6" />
            </button>
          ) : (
            <button 
              onClick={() => login()} 
              className="p-2 ml-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all border border-primary/20"
              title={t.login}
            >
               <User className="w-6 h-6" />
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 relative min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-20 md:h-24 flex items-center justify-between gap-6">
            <div className="flex lg:hidden items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-display font-black italic text-[#172B36]">I</div>
              <h1 className="font-display font-black text-lg italic text-primary tracking-tighter">I like</h1>
            </div>
            
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => setView('MARKET')} className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-all ${view === 'MARKET' ? 'text-primary' : 'text-zinc-500'}`}>{t.market}</button>
              {isSuperAdmin && (
                <button onClick={() => setView('SUPER_ADMIN')} className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-all ${view === 'SUPER_ADMIN' ? 'text-primary' : 'text-zinc-500'}`}>DATA COMMAND</button>
              )}
              {isAdminUser && (
                <button onClick={() => setView('ADMIN')} className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-all ${view === 'ADMIN' ? 'text-primary' : 'text-zinc-500'}`}>{t.admin}</button>
              )}
              <button onClick={() => setView('PORTFOLIO')} className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-all ${view === 'PORTFOLIO' ? 'text-primary' : 'text-zinc-500'}`}>{t.portfolio}</button>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
              {isLoggedIn && (
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{profile?.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                      {profile?.role === 'superadmin' ? t.superadmin_role : 
                       profile?.role === 'Admin' ? t.admin_role : 
                       profile?.role === 'Seller' ? t.seller : t.buyer}
                    </span>
                    <button 
                      onClick={() => logout()}
                      className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 border border-red-500/20"
                    >
                      <LogOut className="w-3 h-3" /> {t.logout}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                {['en', 'es', 'pt'].map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l as any)}
                    className={`px-2 md:px-3 py-1 text-[9px] font-black uppercase rounded-full transition-all ${lang === l ? 'bg-primary text-[#172B36]' : 'text-zinc-500 hover:text-white'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                <button 
                  onClick={() => setActiveModal('notifications')}
                  className="p-2 text-zinc-500 hover:text-primary transition-all relative"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(255,200,1,0.8)] border-2 border-surface" />
                  )}
                </button>
                <div 
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-white/20 p-0.5 overflow-hidden cursor-pointer hover:border-primary transition-all ring-primary/20 hover:ring-4 active:scale-95"
                  onClick={() => !isLoggedIn ? login().then(() => setActiveModal('none')) : setActiveModal('settings')}
                >
                  <img src={isLoggedIn ? profile?.image : "https://img.icons8.com/ios-filled/50/666666/user-male-circle.png"} className="w-full h-full object-cover rounded-full" alt="User" />
                </div>
                {isLoggedIn && (
                  <button 
                    onClick={() => logout()}
                    className="hidden sm:flex p-2 text-red-400/70 hover:text-red-400 transition-all"
                    title={t.logout}
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 pb-32">
          {view === 'MARKET' && (
            <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 md:space-y-20">
              {/* Hero Section */}
              <div className="relative min-h-[500px] md:min-h-[600px] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden group flex flex-col items-center justify-center text-center px-6 md:px-12">
                <img 
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                  alt="Modern Luxury" 
                />
                <div className="absolute inset-0 bg-surface/75" />
                
                <div className="relative z-10 space-y-6 md:space-y-10 max-w-5xl pt-12 md:pt-0">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black text-white glow-text-primary leading-[0.85] uppercase tracking-tighter italic">
                    Tu sueño, tu hogar.
                  </h2>
                  <p className="text-white/70 font-display font-medium tracking-widest text-[10px] sm:text-xs md:text-sm max-w-xl mx-auto uppercase">
                    {t.market_desc}
                  </p>

                  <div className="relative z-50 w-full max-w-5xl mx-auto">
                    <div className="glass-panel p-1.5 md:p-2 rounded-full flex flex-col md:flex-row items-center gap-1 shadow-[0_30px_100px_rgba(0,0,0,0.4)] border-white/5 group/search transition-all hover:border-white/10">
                      
                      {/* Operación Select */}
                      <div className="relative w-full md:w-auto">
                        <button 
                          onClick={() => { setIsCategoryDropdownOpen(!isCategoryDropdownOpen); setIsTypeDropdownOpen(false); }}
                          className={`w-full md:w-44 flex items-center justify-between px-6 py-4 rounded-full transition-all text-[11px] font-black uppercase tracking-tighter ${isCategoryDropdownOpen ? 'bg-primary text-[#172B36]' : 'text-zinc-400 hover:text-white'}`}
                        >
                          <span className="opacity-60 mr-2 font-medium">Ops:</span>
                          <span className="flex-1 text-left">{searchCategory === 'Venta' ? t.buy : t.rent}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {isCategoryDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setIsCategoryDropdownOpen(false)} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute top-full left-0 w-full mt-3 bg-[#114C5A]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden py-3 shadow-2xl z-50"
                              >
                                {['Venta', 'Renta'].map((cat) => (
                                  <button
                                    key={cat}
                                    onClick={() => { setSearchCategory(cat as any); setIsCategoryDropdownOpen(false); }}
                                    className={`w-full text-left px-7 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${searchCategory === cat ? 'text-primary bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                                  >
                                    {cat === 'Venta' ? t.buy : t.rent}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="hidden md:block h-8 w-px bg-white/5" />

                      {/* Tipo Select */}
                      <div className="relative w-full md:w-auto">
                        <button 
                          onClick={() => { setIsTypeDropdownOpen(!isTypeDropdownOpen); setIsCategoryDropdownOpen(false); }}
                          className={`w-full md:w-48 flex items-center justify-between px-6 py-4 rounded-full transition-all text-[11px] font-black uppercase tracking-tighter ${isTypeDropdownOpen ? 'bg-primary text-[#172B36]' : 'text-zinc-400 hover:text-white'}`}
                        >
                          <span className="opacity-60 mr-2 font-medium">Tipo:</span>
                          <span className="flex-1 text-left truncate">{searchType === 'All' ? t.all_types : t[searchType.toLowerCase() + 's' as keyof typeof t] || searchType}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {isTypeDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setIsTypeDropdownOpen(false)} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute top-full left-0 w-full mt-3 bg-[#114C5A]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden py-3 shadow-2xl z-50 max-h-[350px] overflow-y-auto custom-scrollbar"
                              >
                                {['All', 'House', 'Apartment', 'Land', 'Office', 'Other'].map((type) => (
                                  <button
                                    key={type}
                                    onClick={() => { setSearchType(type as any); setIsTypeDropdownOpen(false); }}
                                    className={`w-full text-left px-7 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${searchType === type ? 'text-primary bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                                  >
                                    {type === 'All' ? t.all_types : t[type.toLowerCase() + 's' as keyof typeof t] || type}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="hidden md:block h-8 w-px bg-white/5" />

                      {/* Search Input */}
                      <div className="flex-1 w-full relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                        <input 
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Ubicación o Red..."
                          className="w-full bg-transparent border-none py-4 md:py-5 pl-14 pr-6 text-sm text-white focus:outline-none placeholder:text-zinc-600 font-display font-medium"
                        />
                      </div>

                      {/* Action Button */}
                      <button className="w-full md:w-auto bg-primary text-[#172B36] px-10 py-4 rounded-full font-display font-black text-[11px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(255,200,1,0.3)]">
                        {t.search}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                   <button className="flex items-center gap-3 px-6 py-3 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-display font-black text-[10px] tracking-widest uppercase hover:bg-primary hover:text-[#172B36] transition-all group">
                     <Filter className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> {t.filters}
                   </button>
                   <div className="hidden md:flex items-center gap-2 px-5 py-3 glass-panel rounded-2xl border-white/5 text-[10px] uppercase font-black tracking-widest">
                     <span className="text-primary glow-text-primary">ACTIVE:</span> 
                     <span className="text-zinc-400">AGENTE IA OPTIMIZADO V2</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProperties.map(property => (
                  <PropertyCard key={property.id} property={property} onClick={handlePropertyClick} />
                ))}
              </div>

              {/* Property Requests Section */}
              <div className="mt-16 bg-white/5 rounded-3xl p-8 border border-white/5">
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-widest mb-6">{t.property_requests}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requests.length === 0 ? (
                    <p className="text-zinc-500 italic">{t.no_requests}</p>
                  ) : (
                    requests.map(req => (
                      <div key={req.id} className="glass-panel p-6 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.type === 'Buy' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                            {req.type === 'Buy' ? t.buy : t.rent}
                          </span>
                          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">${req.budget.toLocaleString()}</span>
                        </div>
                        <h4 className="font-display font-bold text-lg mb-2">{req.location}</h4>
                        <div className="flex gap-4 mb-3 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          {req.minBeds && <span>Min: {req.minBeds} {t.beds}</span>}
                          {req.minSqft && <span>Min: {req.minSqft} {t.sqft}</span>}
                        </div>
                        <p className="text-zinc-400 text-sm line-clamp-2 italic">"{req.requirements}"</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                            <User className="w-3 h-3" /> {req.user}
                          </div>
                          <button className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                             {t.whatsapp} <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'ADMIN' && (
            <motion.div key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-display font-black text-white glow-text-primary mb-2">{t.admin}</h2>
                  <p className="text-zinc-500">{t.status}: <span className="text-secondary font-bold">{t.nominal}</span>. {t.telemetry} active.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 glass-panel rounded-lg border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-[10px] font-display font-bold uppercase tracking-widest text-zinc-400">{t.telemetry}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: t.active_users, value: allUsers.length.toString(), trend: 'LIVE', icon: <User className="w-4 h-4" /> },
                  { label: 'Total Assets', value: userProperties.length.toString(), trend: 'SYNC', icon: <Building2 className="w-4 h-4" /> },
                  { label: 'Active Requests', value: requests.length.toString(), trend: 'FLOW', icon: <MessageCircle className="w-4 h-4" /> },
                  { label: 'Uptime', value: '99.98%', trend: 'NOMINAL', icon: <Activity className="w-4 h-4" />, color: 'text-secondary' }
                ].map((stat, i) => (
                  <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-white/5 rounded-lg text-primary">{stat.icon}</div>
                      <span className={`text-[8px] font-bold tracking-[0.2em] px-2 py-0.5 rounded-full bg-white/5 ${stat.color || 'text-zinc-500'}`}>{stat.trend}</span>
                    </div>
                    <p className="text-[10px] font-display font-bold text-zinc-500 tracking-widest uppercase mb-1">{stat.label}</p>
                    <p className="text-2xl font-display font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 glass-panel rounded-3xl p-8 border border-white/5">
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">User Registry Management</h3>
                  <div className="space-y-4">
                    {allUsers.length === 0 ? (
                      <p className="text-zinc-500 italic text-center py-10">No unauthorized access. Awaiting telemetry synchronization...</p>
                    ) : (
                      allUsers.map(u => (
                        <div key={(u as any).id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                          <div className="flex items-center gap-4">
                            <img src={u.image} className="w-10 h-10 rounded-full object-cover border border-white/10" alt={u.name} />
                            <div>
                              <p className="text-sm font-bold text-white uppercase tracking-wide">{u.name}</p>
                              <p className="text-[10px] text-zinc-500 font-bold tracking-widest">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className="text-right">
                               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Node Role</p>
                               <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${u.role === 'Seller' ? 'text-primary bg-primary/10' : u.role === 'Admin' ? 'text-blue-400 bg-blue-400/10' : 'text-secondary bg-secondary/10'}`}>
                                  {u.role === 'Seller' ? t.seller : u.role === 'Admin' ? 'Admin' : t.buyer}
                               </span>
                             </div>
                             {isSuperAdmin && (
                               <button onClick={() => handleRoleChange((u as any).id, u.role)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 transition-all hover:text-primary" title="Change Role">
                                  <Settings className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <div className="glass-panel rounded-3xl p-8 border border-white/5">
                    <h3 className="font-display font-bold text-sm mb-6 uppercase tracking-widest text-zinc-400">System Telemetry</h3>
                    <div className="space-y-6">
                      {[
                        { label: 'CPU Load', value: 24 },
                        { label: 'Memory', value: 68 },
                        { label: 'Throughput', value: 45 }
                      ].map((bar, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                             <span className="text-zinc-500">{bar.label}</span>
                             <span className="text-primary">{bar.value}%</span>
                           </div>
                           <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${bar.value}%` }}
                               className="h-full bg-primary shadow-[0_0_8px_rgba(255,200,1,0.5)]"
                             />
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel p-8 rounded-3xl border border-secondary/20">
                     <div className="flex items-center gap-3 mb-4">
                        <Zap className="w-5 h-5 text-secondary" />
                        <h3 className="font-display font-bold text-sm text-white uppercase tracking-widest">Global Broadcast</h3>
                     </div>
                     <p className="text-zinc-400 text-xs mb-6 leading-relaxed italic">Broadcast system-wide notifications or critical market updates to all active nodes.</p>
                     <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs h-24 mb-4 focus:outline-none focus:border-secondary transition-all" placeholder="Enter transmission data..." />
                     <button className="w-full bg-secondary text-black py-3 rounded-xl font-display font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        Initialize Transmission
                     </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'PORTFOLIO' && (
            <motion.div key="portfolio" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-10">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-display font-black text-white glow-text-primary mb-2">{t.portfolio}</h2>
                  <p className="text-zinc-500">Managing {userProperties.filter(p => p.ownerId === currentUser?.uid).length} active assets in your personal vault.</p>
                </div>
                <button 
                  onClick={() => isLoggedIn ? setActiveModal('add_property') : login().then(() => setActiveModal('none'))}
                  className="px-6 py-3 bg-primary text-[#172B36] rounded-xl font-display font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(255,200,1,0.3)] hover:scale-105 transition-all"
                >
                  + {t.add_property}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {userProperties.filter(p => p.ownerId === currentUser?.uid).length === 0 ? (
                  <div className="col-span-full py-20 text-center glass-panel rounded-3xl border border-white/5">
                    <Wallet className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 font-display uppercase tracking-widest text-xs font-bold">No active assets in this node.</p>
                  </div>
                ) : (
                  userProperties
                    .filter(p => p.ownerId === currentUser?.uid)
                    .map(property => (
                      <PropertyCard key={property.id} property={property} onClick={handlePropertyClick} />
                    ))
                )}
              </div>
            </motion.div>
          )}

          {view === 'CALENDAR' && (
            <div className="space-y-8">
              <div className="flex justify-end mb-4">
                 <button 
                  onClick={() => isLoggedIn ? setActiveModal('add_appointment') : setActiveModal('login')}
                  className="btn-joy shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center gap-2"
                 >
                    <Plus className="w-4 h-4" /> {t.schedule_appointment}
                 </button>
              </div>
              <ExecutiveCalendar 
                appointments={appointments}
                lang={lang}
                onUpdateAppointment={async (id, data) => {
                  try {
                    const orgId = profile?.organizationId || 'default-org';
                    await updateAppointment(id, data, orgId);
                  } catch (e) {
                    handleFirestoreError(e, OperationType.UPDATE, `appointments/${id}`);
                  }
                }}
                onEditOutcome={(app) => {
                  setActiveModal('edit_outcome', { selectedAppointment: app });
                }}
                onReschedule={(app) => {
                  setActiveModal('reschedule', { selectedAppointment: app });
                }}
              />
            </div>
          )}

          {view === 'DETAILS' && selectedProperty && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-10 max-w-6xl mx-auto">
              <button 
                onClick={() => setView('MARKET')}
                className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors font-display text-[10px] font-bold tracking-widest uppercase"
              >
                ← {t.return}
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12 space-y-4">
                  <div className="relative rounded-3xl overflow-hidden glass-panel h-[500px]">
                    <img 
                      src={getGoogleDriveUrl(selectedProperty.images && selectedProperty.images.length !== 0 ? selectedProperty.images[0] : selectedProperty.image || '')} 
                      className="w-full h-full object-cover opacity-80" 
                      alt={selectedProperty.name}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                    
                    <div className="absolute top-6 left-6 flex gap-3">
                      <span className="px-4 py-1 bg-surface/80 backdrop-blur rounded-full border border-white/10 text-[10px] font-display font-black text-primary tracking-widest uppercase">{t.verified}</span>
                      <span className="px-4 py-1 bg-surface/80 backdrop-blur rounded-full border border-white/10 text-[10px] font-display font-black text-white tracking-widest uppercase flex items-center gap-2">
                         <Globe className="w-3 h-3" /> {t.virtual_node}
                      </span>
                    </div>

                    <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                      <div className="space-y-4">
                        <h1 className="text-6xl font-display font-black text-white glow-text-primary leading-none">{selectedProperty.name}</h1>
                        <div className="flex gap-4 text-zinc-400 font-display text-sm">
                          <span>{selectedProperty.location}</span>
                          <span className="text-zinc-700">•</span>
                          <span>{selectedProperty.beds} {t.beds}</span>
                          <span className="text-zinc-700">•</span>
                          <span>{selectedProperty.baths} {t.baths}</span>
                          <span className="text-zinc-700">•</span>
                          <span className="text-primary font-bold uppercase tracking-widest text-[10px]">{selectedProperty.type === 'Residential' ? t.residential : t.commercial} PROTOCOL</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 translate-y-[-10px]">
                         <div className="flex gap-2">
                           {(isSuperUser || selectedProperty.ownerId === currentUser?.uid) && (
                             <>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleEditProperty(selectedProperty); }}
                                 className="p-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white transition-all"
                                 title="Editar"
                               >
                                  <Edit className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleDeleteProperty(selectedProperty.id); }}
                                 className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full border border-red-500/30 text-red-400 transition-all"
                                 title="Eliminar"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                             </>
                           )}
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-display font-bold text-zinc-500 tracking-widest uppercase mb-1">{t.valuation}</p>
                            <p className="text-5xl font-display font-black text-primary glow-text-primary">${selectedProperty.price.toLocaleString()}</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Gallery */}
                  {selectedProperty.images && selectedProperty.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-4">
                      {selectedProperty.images.map((img, idx) => (
                        <div key={idx} className="h-24 rounded-2xl overflow-hidden glass-panel border border-white/5 group cursor-pointer">
                          <img 
                            src={getGoogleDriveUrl(img)} 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                            alt={`${selectedProperty.name} ${idx}`}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Verification Status Panel */}
                  <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex justify-between items-center">
                       <h3 className="text-xl font-display font-black text-white uppercase tracking-widest flex items-center gap-3">
                          <ShieldCheck className="w-5 h-5 text-primary" /> {t.verification_status}
                       </h3>
                       <div className="flex items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-full font-display font-bold text-[10px] uppercase tracking-widest border ${
                            selectedProperty.verifiedStatus === 'verified' ? 'bg-secondary/10 border-secondary/30 text-secondary' :
                            selectedProperty.verifiedStatus === 'rejected' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                            'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                          }`}>
                            {(t as any)[selectedProperty.verifiedStatus || 'pending']}
                          </span>
                       </div>
                    </div>
                    
                    {isSuperUser && (
                       <div className="flex gap-4 pt-2">
                          {selectedProperty.verifiedStatus !== 'verified' && (
                             <button 
                               onClick={async () => {
                                 const orgId = profile?.organizationId || 'default-org';
                                 await updateProperty(selectedProperty.id, { verifiedStatus: 'verified' }, orgId);
                                 await addNotification({
                                   userId: selectedProperty.ownerId || 'unknown',
                                   title: 'Activo Verificado',
                                   message: `Felicidades. ${selectedProperty.name} ha sido verificado por el equipo de expertos.`,
                                   type: 'success',
                                 }, orgId);
                               }}
                               className="flex-1 px-4 py-3 bg-secondary text-black rounded-xl font-display font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                             >
                               {t.verify_asset}
                             </button>
                          )}
                          {selectedProperty.verifiedStatus !== 'rejected' && (
                             <button 
                               onClick={async () => {
                                 const orgId = profile?.organizationId || 'default-org';
                                 await updateProperty(selectedProperty.id, { verifiedStatus: 'rejected' }, orgId);
                                 await addNotification({
                                   userId: selectedProperty.ownerId || 'unknown',
                                   title: 'Verificación Rechazada',
                                   message: `La verificación de ${selectedProperty.name} fue rechazada. Por favor revise el dossier adjunto.`,
                                   type: 'error',
                                 }, orgId);
                               }}
                               className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-display font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                             >
                               {t.reject_asset}
                             </button>
                          )}
                       </div>
                    )}
                    
                    {!isSuperUser && selectedProperty.ownerId === currentUser?.uid && selectedProperty.verifiedStatus !== 'verified' && selectedProperty.verifiedStatus !== 'pending' && (
                       <button 
                         onClick={() => {
                           const orgId = profile?.organizationId || 'default-org';
                           updateProperty(selectedProperty.id, { verifiedStatus: 'pending' }, orgId);
                         }}
                         className="w-full px-4 py-3 bg-primary text-black rounded-xl font-display font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                       >
                         {t.request_verification}
                       </button>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { l: selectedProperty.char1Label || t.type, v: selectedProperty.char1Value || (selectedProperty.type === 'Residential' ? t.residential : t.commercial), i: <Settings className="w-4 h-4"/> },
                      { l: selectedProperty.char2Label || t.year_built, v: selectedProperty.char2Value || selectedProperty.yearBuilt || '2024', i: <Activity className="w-4 h-4"/>, c: 'text-primary' },
                      { l: selectedProperty.char3Label || 'Energy Rating', v: selectedProperty.char3Value || 'LEED Plat', i: <Zap className="w-4 h-4"/>, c: 'text-secondary' },
                      { l: selectedProperty.char4Label || 'ROI Target', v: selectedProperty.char4Value || `${selectedProperty.roi}%`, i: <TrendingUp className="w-4 h-4"/> }
                    ].map((item, i) => (
                      <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group">
                         <div className="text-zinc-600 group-hover:text-primary transition-colors mb-4">{item.i}</div>
                         <p className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase mb-1">{item.l}</p>
                         <p className={`font-display font-bold ${item.c || 'text-white'}`}>{item.v}</p>
                      </div>
                    ))}
                  </div>

                  <div className="glass-panel p-10 rounded-3xl">
                    <h3 className="text-xl font-display font-bold mb-6 text-white uppercase tracking-widest border-b border-white/5 pb-4">{t.summary}</h3>
                    <p className="text-zinc-400 text-lg leading-relaxed font-sans mb-8">
                      {selectedProperty.description}
                    </p>
                    
                    {selectedProperty.amenities && (
                      <div className="flex flex-wrap gap-2">
                        {selectedProperty.amenities.map(amenity => (
                          <span key={amenity} className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-primary uppercase tracking-widest">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inquiry Side */}
                <div className="lg:col-span-4">
                  <div className="glass-panel p-8 rounded-3xl border border-primary/20 sticky top-10">
                    <div className="flex items-center gap-3 mb-8">
                       <MessageCircle className="w-6 h-6 text-primary" />
                       <h3 className="font-display font-bold text-white uppercase tracking-widest">{t.inquiry}</h3>
                    </div>
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                      <div className="space-y-2">
                        <label className="text-[10px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.entity}</label>
                        <input className="w-full bg-white/5 border-b border-zinc-800 py-2 focus:outline-none focus:border-primary transition-colors text-sm" placeholder="e.g. Venture Alpha" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.contact_node}</label>
                        <input className="w-full bg-white/5 border-b border-zinc-800 py-2 focus:outline-none focus:border-primary transition-colors text-sm" placeholder="Email or Signal" />
                      </div>
                      <button className="w-full bg-primary text-[#172B36] py-4 rounded-xl font-display font-black uppercase tracking-widest text-[12px] hover:shadow-[0_0_20px_rgba(255,200,1,0.4)] transition-all">
                        {t.transmit}
                      </button>
                      <a 
                        href={`https://wa.me/1234567890?text=I am interested in ${selectedProperty.name}`}
                        target="_blank"
                        className="w-full flex items-center justify-center gap-2 border border-secondary/30 text-secondary py-3 rounded-xl font-display text-[10px] uppercase tracking-widest font-bold hover:bg-secondary/10 transition-all"
                      >
                         {t.wa_bridge}
                      </a>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <AINexus />

      {/* Suggestion Box */}
      <div className="fixed bottom-32 right-8 md:bottom-28 z-50">
        <button 
          onClick={() => setActiveModal('settings')}
          className="p-3 bg-white/5 border border-white/10 rounded-xl text-zinc-500 hover:text-white transition-all hover:border-white/30 group relative shadow-2xl backdrop-blur-md"
        >
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
          <span className="absolute right-full mr-4 whitespace-nowrap bg-black p-2 rounded text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">Submit Suggestion</span>
        </button>
      </div>

      {/* Floating Action Buttons Container - Ensures No Overlap */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
        <AINexus />
        <a 
          href="https://wa.me/59178756107" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-[#25D366] text-white rounded-full shadow-[0_10px_40px_rgba(37,211,102,0.5)] hover:scale-110 active:scale-95 transition-all group border border-white/20"
          title="Soporte WhatsApp"
        >
          <Phone className="w-4 h-4 animate-pulse group-hover:animate-none" />
        </a>
      </div>

      {/* Modals Section */}
      <AnimatePresence>
        {activeModal === 'login' && <LoginModal lang={lang} />}
        {activeModal === 'settings' && <SettingsModal lang={lang} setLang={setLang} />}
        {activeModal === 'add_property' && <PropertyModal lang={lang} mode="add" />}
        {activeModal === 'edit_property' && (
          <PropertyModal 
            lang={lang} 
            mode="edit" 
            propertyToEdit={modalData.propertyToEdit} 
          />
        )}
        {activeModal === 'add_appointment' && <AppointmentModal lang={lang} mode="add" />}
        {activeModal === 'edit_outcome' && (
          <AppointmentModal 
            lang={lang} 
            mode="edit_outcome" 
            selectedAppointment={modalData.selectedAppointment} 
          />
        )}
        {activeModal === 'reschedule' && (
          <AppointmentModal 
            lang={lang} 
            mode="reschedule" 
            selectedAppointment={modalData.selectedAppointment} 
          />
        )}
        {activeModal === 'notifications' && <NotificationModal lang={lang} />}
        {activeModal === 'add_request' && <RequestModal lang={lang} />}
      </AnimatePresence>

      {/* SuperAdmin Professional CRM Overlay */}
      <AnimatePresence>
        {view === 'SUPER_ADMIN' && isSuperAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200]"
          >
            <SuperAdminCRM onClose={() => setView('MARKET')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



