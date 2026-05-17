import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Building2, 
  ClipboardList, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Search, 
  Filter, 
  Shield, 
  Bell, 
  Settings,
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Zap,
  BarChart3,
  Mail,
  Phone,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Lock,
  ShieldAlert,
  Send
} from 'lucide-react';
import { UserProfile, Property, PropertyRequest, Appointment, AppNotification } from '../types';
import { authService } from '../features/auth/services/authService';
import { propertyService } from '../features/properties/services/propertyService';
import { crmService } from '../features/crm/services/crmService';
import { useAuth } from '../features/auth/hooks/useAuth';

interface SuperAdminCRMProps {
  onClose: () => void;
}

type TabType = 'METRICS' | 'USERS' | 'PROPERTIES' | 'REQUESTS' | 'APPOINTMENTS';

export default function SuperAdminCRM({ onClose }: SuperAdminCRMProps) {
  const [activeTab, setActiveTab] = useState<TabType>('METRICS');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const { user: currentUser, profile } = useAuth();

  // Reference for accessibility and keyboard focus management
  const mainContentRef = useRef<HTMLElement>(null);

  // Focus the main panel whenever the tab changes to keep focus logical
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, [activeTab]);

  // Interactive chart state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Broadcast States
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [confirmWord, setConfirmWord] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmitProgress, setTransmitProgress] = useState(0);
  const [transmitTotal, setTransmitTotal] = useState(0);
  const [broadcastLogs, setBroadcastLogs] = useState<string[]>([]);

  // 12 Months scale builder
  const monthlyScale = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
        fullName: d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase(),
      });
    }
    return result;
  }, []);

  // Safe Date parser
  const parseSafeDate = (createdAt: any): Date | null => {
    if (!createdAt) return null;
    if (typeof createdAt === 'object') {
      if (typeof createdAt.toDate === 'function') return createdAt.toDate();
      if (typeof createdAt.seconds === 'number') return new Date(createdAt.seconds * 1000);
    }
    if (createdAt instanceof Date) return createdAt;
    const parsed = new Date(createdAt);
    return !isNaN(parsed.getTime()) ? parsed : null;
  };

  // Cumulative monthly data calculation
  const chartData = useMemo(() => {
    if (monthlyScale.length === 0) return [];

    const firstMonthDate = new Date(monthlyScale[0].year, monthlyScale[0].month, 1);

    // 1. Calculate Baselines (all records before firstMonthDate)
    let userCumulative = 0;
    let propertyCumulative = 0;

    users.forEach(u => {
      const d = parseSafeDate(u.createdAt);
      if (d && d < firstMonthDate) {
        userCumulative++;
      }
    });

    properties.forEach(p => {
      const d = parseSafeDate(p.createdAt);
      if (d && d < firstMonthDate) {
        propertyCumulative++;
      }
    });

    // 2. Iterate monthly scale and accumulate
    const data = monthlyScale.map(m => {
      let usersAdded = 0;
      let propertiesAdded = 0;

      users.forEach(u => {
        const d = parseSafeDate(u.createdAt);
        if (d && d.getFullYear() === m.year && d.getMonth() === m.month) {
          usersAdded++;
        }
      });

      properties.forEach(p => {
        const d = parseSafeDate(p.createdAt);
        if (d && d.getFullYear() === m.year && d.getMonth() === m.month) {
          propertiesAdded++;
        }
      });

      userCumulative += usersAdded;
      propertyCumulative += propertiesAdded;

      return {
        label: m.label,
        fullName: m.fullName,
        users: userCumulative,
        properties: propertyCumulative,
        addedUsers: usersAdded,
        addedProperties: propertiesAdded
      };
    });

    return data;
  }, [users, properties, monthlyScale]);

  // SVG Geometry Dimensions
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;
  const chartWidth = 700 - paddingLeft - paddingRight;
  const chartHeight = 240 - paddingTop - paddingBottom;

  const maxVal = useMemo(() => {
    let max = 0;
    chartData.forEach(d => {
      if (d.users > max) max = d.users;
      if (d.properties > max) max = d.properties;
    });
    return Math.max(max * 1.15, 10); // 15% headroom, minimum 10
  }, [chartData]);

  const userPoints = useMemo(() => {
    if (chartData.length === 0) return [];
    return chartData.map((d, i) => {
      const x = paddingLeft + (i / (chartData.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (d.users / maxVal) * chartHeight;
      return { x, y, value: d.users, raw: d };
    });
  }, [chartData, maxVal, chartWidth, chartHeight]);

  const propertyPoints = useMemo(() => {
    if (chartData.length === 0) return [];
    return chartData.map((d, i) => {
      const x = paddingLeft + (i / (chartData.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (d.properties / maxVal) * chartHeight;
      return { x, y, value: d.properties, raw: d };
    });
  }, [chartData, maxVal, chartWidth, chartHeight]);

  const getBezierPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      if (p0.y === p1.y) {
        d += ` L ${p1.x} ${p1.y}`;
      } else {
        const cp1x = p0.x + (p1.x - p0.x) / 3;
        const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
        d += ` C ${cp1x} ${p0.y}, ${cp2x} ${p1.y}, ${p1.x} ${p1.y}`;
      }
    }
    return d;
  };

  const getUserAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    const path = getBezierPath(points);
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const baselineY = paddingTop + chartHeight;
    return `${path} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`;
  };

  const getPropertyAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    const path = getBezierPath(points);
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const baselineY = paddingTop + chartHeight;
    return `${path} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`;
  };

  // Broadcast Recipients Determination (Multi-tenant)
  const targetUsers = useMemo(() => {
    if (profile?.role === 'superadmin') {
      return users; // global broadcast
    }
    const orgId = profile?.organizationId || '';
    if (!orgId) return [];
    return users.filter(u => u.organizationId === orgId);
  }, [users, profile]);

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      setBroadcastLogs(prev => [...prev, '[ERROR] El título y el mensaje no pueden estar vacíos.']);
      return;
    }
    if (confirmWord !== 'TRANSMITIR') {
      setBroadcastLogs(prev => [...prev, '[ERROR] Debe escribir exactamente "TRANSMITIR" para desbloquear.']);
      return;
    }
    
    setIsTransmitting(true);
    setTransmitProgress(0);
    setTransmitTotal(targetUsers.length);
    setBroadcastLogs(['[INICIO] Inicializando lote de transmisión...']);

    try {
      const senderId = currentUser?.uid || '';
      const senderOrgId = profile?.organizationId || 'default-org';
      
      setBroadcastLogs(prev => [
        ...prev, 
        `[INFO] Destinatarios identificados: ${targetUsers.length} nodos.`,
        `[INFO] Iniciando transmisión en lotes (tamaño de bloque: 500).`
      ]);

      await crmService.broadcastNotification(
        {
          title: broadcastTitle,
          message: broadcastMessage,
          type: broadcastType,
        },
        targetUsers,
        senderId,
        senderOrgId,
        (sentCount, total) => {
          setTransmitProgress(sentCount);
          setBroadcastLogs(prev => [
            ...prev, 
            `[PROGRESO] Transmitidos con éxito ${sentCount} de ${total} paquetes.`
          ]);
        }
      );

      setBroadcastLogs(prev => [...prev, '[ÉXITO] Transmisión de broadcast finalizada correctamente.']);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setConfirmWord('');
    } catch (err: any) {
      console.error('Error in broadcast:', err);
      setBroadcastLogs(prev => [...prev, `[ERROR DE CRASH] Fallo en la red de transmisión: ${err?.message || err}`]);
    } finally {
      setIsTransmitting(false);
    }
  };

  // Subscriptions
  useEffect(() => {
    setLoading(true);
    const unsubs: (() => void)[] = [];

    unsubs.push(authService.subscribeToAllUsersList(setUsers));
    unsubs.push(propertyService.subscribeToAllProperties(setProperties, (err) => console.error(err)));
    unsubs.push(crmService.subscribeToAllRequests(setRequests));
    unsubs.push(crmService.subscribeToAllAppointments(setAppointments));

    const timer = setTimeout(() => setLoading(false), 800);
    return () => {
      unsubs.forEach(unsub => unsub());
      clearTimeout(timer);
    };
  }, []);

  const stats = useMemo(() => [
    { 
      label: 'Total Usuarios', 
      value: users.length, 
      trend: '+12%', 
      icon: <Users className="w-5 h-5 text-yellow-500" />,
      color: 'yellow'
    },
    { 
      label: 'Activos Digitales', 
      value: properties.length, 
      trend: '+5%', 
      icon: <Building2 className="w-5 h-5 text-green-500" />,
      color: 'green'
    },
    { 
      label: 'Solicitudes', 
      value: requests.length, 
      trend: '+18%', 
      icon: <ClipboardList className="w-5 h-5 text-blue-500" />,
      color: 'blue'
    },
    { 
      label: 'Citas Globales', 
      value: appointments.length, 
      trend: '+24%', 
      icon: <Calendar className="w-5 h-5 text-teal-500" />,
      color: 'teal'
    }
  ], [users, properties, requests, appointments]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
      case 'USERS':
        return users.filter(u => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term));
      case 'PROPERTIES':
        return properties.filter(p => p.name?.toLowerCase().includes(term) || p.location?.toLowerCase().includes(term));
      case 'REQUESTS':
        return requests.filter(r => r.location?.toLowerCase().includes(term) || r.requirements?.toLowerCase().includes(term));
      case 'APPOINTMENTS':
        return appointments.filter(a => a.userName?.toLowerCase().includes(term) || a.propertyName?.toLowerCase().includes(term));
      default:
        return [];
    }
  }, [activeTab, users, properties, requests, appointments, searchTerm]);

  return (
    <div 
      className="relative w-full h-full min-h-full overflow-y-auto overflow-x-hidden bg-black flex flex-col @4xl:flex-row font-sans z-[100] @container scroll-smooth scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
      role="dialog"
      aria-modal="true"
      aria-label="Panel de Control SuperAdmin CRM"
    >
      {/* Sidebar */}
      <aside 
        className="w-full @4xl:w-64 border-b @4xl:border-b-0 @4xl:border-r border-white/5 bg-[#0A0A0B] flex flex-row @4xl:flex-col shrink-0 h-auto"
        aria-label="Navegación del Administrador"
      >
        <div className="p-4 @4xl:p-6 border-r @4xl:border-r-0 @4xl:border-b border-white/5 flex items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 @4xl:w-10 @4xl:h-10 rounded-sm bg-yellow-500 flex items-center justify-center">
              <Shield className="w-5 h-5 @4xl:w-6 @4xl:h-6 text-black" aria-hidden="true" />
            </div>
            <div className="hidden @xl:block @4xl:block">
              <h2 className="font-display font-black text-white text-xs @4xl:text-sm tracking-tighter">VID-A CRM</h2>
              <p className="text-[9px] @4xl:text-[10px] text-yellow-500 font-mono font-bold tracking-[0.2em] uppercase">SuperAdmin</p>
            </div>
          </div>
        </div>

        <nav 
          role="tablist"
          aria-label="Pestañas de Administración"
          className="flex-1 p-2 @4xl:p-4 flex flex-row @4xl:flex-col gap-1 overflow-x-auto @4xl:overflow-x-visible custom-scrollbar min-w-0"
        >
          <NavItem 
            active={activeTab === 'METRICS'} 
            onClick={() => setActiveTab('METRICS')} 
            icon={<BarChart3 size={16} />} 
            label="Métricas Globales" 
          />
          <NavItem 
            active={activeTab === 'USERS'} 
            onClick={() => setActiveTab('USERS')} 
            icon={<Users size={16} />} 
            label="Gestión de Nodos" 
            count={users.length}
          />
          <NavItem 
            active={activeTab === 'PROPERTIES'} 
            onClick={() => setActiveTab('PROPERTIES')} 
            icon={<Building2 size={16} />} 
            label="Activos Inmobiliarios" 
            count={properties.length}
          />
          <NavItem 
            active={activeTab === 'REQUESTS'} 
            onClick={() => setActiveTab('REQUESTS')} 
            icon={<ClipboardList size={16} />} 
            label="Pipeline de Solicitudes" 
            count={requests.length}
          />
          <NavItem 
            active={activeTab === 'APPOINTMENTS'} 
            onClick={() => setActiveTab('APPOINTMENTS')} 
            icon={<Calendar size={16} />} 
            label="Agenda Ejecutiva" 
            count={appointments.length}
          />
        </nav>

        <div className="p-2 @4xl:p-6 border-l @4xl:border-l-0 @4xl:border-t border-white/5 flex items-center justify-center shrink-0">
          <button 
            onClick={onClose}
            aria-label="Cerrar panel de control CRM"
            className="px-4 py-2 @4xl:w-full @4xl:py-3 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-all text-[10px] font-bold uppercase tracking-widest rounded-sm whitespace-nowrap cursor-pointer"
          >
            Regresar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#050505] relative h-auto w-full">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Header */}
        <header className="py-4 @4xl:py-6 border-b border-white/5 bg-[#0A0A0B]/90 backdrop-blur-md flex flex-col @xl:flex-row @xl:items-center justify-between px-6 @4xl:px-8 gap-4 z-10 sticky top-0 shrink-0">
          <div>
            <h1 className="text-lg @4xl:text-xl font-display font-black text-white uppercase tracking-tight">
              {activeTab === 'METRICS' ? 'Dashboard de Telemetría' : 
               activeTab === 'USERS' ? 'Control de Nodos (Usuarios)' :
               activeTab === 'PROPERTIES' ? 'Inventario Global de Activos' :
               activeTab === 'REQUESTS' ? 'Gestión de Solicitudes' : 'Agenda del Sistema'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[9px] @4xl:text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Enlace Satelital Activo // Nodo SuperAdmin</p>
            </div>
          </div>

          <div className="flex flex-col @sm:flex-row items-stretch @sm:items-center gap-4 @4xl:gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" aria-hidden="true" />
              <input 
                type="text"
                placeholder="BUSCAR EN EL SISTEMA..."
                aria-label="Buscar en el sistema"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-sm py-2 pl-10 pr-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 w-full @sm:w-64 font-mono"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button 
                aria-label="Ver notificaciones"
                className="w-9 h-9 @4xl:w-10 @4xl:h-10 rounded-sm border border-white/10 flex items-center justify-center hover:bg-white/5 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-colors"
              >
                <Bell size={16} className="text-zinc-400 hover:text-white" />
              </button>
              <button 
                aria-label="Abrir configuración"
                className="w-9 h-9 @4xl:w-10 @4xl:h-10 rounded-sm border border-white/10 flex items-center justify-center hover:bg-white/5 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-colors"
              >
                <Settings size={16} className="text-zinc-400 hover:text-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main 
          ref={mainContentRef}
          tabIndex={-1}
          className="flex-1 p-6 @4xl:p-8 z-10 h-auto focus:outline-none"
          role="tabpanel"
          aria-label={`Contenido de ${
            activeTab === 'METRICS' ? 'Métricas Globales' : 
            activeTab === 'USERS' ? 'Gestión de Nodos' :
            activeTab === 'PROPERTIES' ? 'Activos Inmobiliarios' :
            activeTab === 'REQUESTS' ? 'Pipeline de Solicitudes' : 'Agenda Ejecutiva'
          }`}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-12 h-12 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
                <p className="text-[10px] font-mono text-yellow-500/50 uppercase tracking-[0.3em]">Sincronizando Datastream...</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
                {activeTab === 'METRICS' && (
                  <div className="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-4 gap-4 @4xl:gap-6">
                    {stats.map((stat, i) => (
                      <div key={i} className="bg-[#0A0A0B] border border-white/5 p-6 rounded-sm relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          {stat.icon}
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{stat.label}</p>
                          <span className="text-[10px] text-green-500 font-mono font-bold bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <TrendingUp size={10} /> {stat.trend}
                          </span>
                        </div>
                        <div className="flex items-end gap-3">
                          <h3 className="text-3xl @4xl:text-4xl font-display font-black text-white tracking-tighter">{stat.value}</h3>
                          <p className="text-[10px] text-zinc-600 font-mono mb-2">REGISTROS</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {[1,2,3].map(j => (
                              <div key={j} className="w-6 h-6 rounded-full border border-black bg-white/10" />
                            ))}
                          </div>
                          <button 
                            aria-label={`Analizar métricas de ${stat.label}`}
                            className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all cursor-pointer focus:outline-none focus:underline"
                          >
                            Analizar <ArrowUpRight size={12} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* SVG Growth Analytics Chart Real */}
                    <div className="col-span-1 @xl:col-span-2 @4xl:col-span-3 bg-[#0A0A0B] border border-white/5 rounded-sm p-6 @4xl:p-8 h-[350px] @4xl:h-[400px] flex flex-col relative group min-w-0">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-white font-bold uppercase tracking-widest text-xs">Crecimiento de la Red</h3>
                          <p className="text-[10px] text-zinc-500 font-mono mt-1">VOLUMEN DE ACTIVOS VS REGISTRO DE NODOS</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-none bg-[#EAB308]" />
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">Nodos (Usuarios)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-none bg-[#3B82F6]" />
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">Activos (Propiedades)</span>
                          </div>
                        </div>
                      </div>

                      {/* HUD Superior de Telemetría Dinámica */}
                      <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-4 mb-4 font-mono">
                        <div>
                          <p className="text-[8px] text-zinc-600 uppercase tracking-widest">Periodo Escaneado</p>
                          <p className="text-xs text-white font-bold">{hoveredIndex !== null ? chartData[hoveredIndex]?.fullName : 'ÚLTIMOS 12 MESES'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-[#EAB308]/40 uppercase tracking-widest">Nodos Registrados</p>
                          <p className="text-xs text-white font-bold flex items-center gap-1.5">
                            {hoveredIndex !== null ? chartData[hoveredIndex]?.users : users.length}
                            {hoveredIndex !== null && (
                              <span className="text-[9px] text-[#EAB308]">
                                (+{chartData[hoveredIndex]?.addedUsers})
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] text-[#3B82F6]/40 uppercase tracking-widest">Activos Inmobiliarios</p>
                          <p className="text-xs text-white font-bold flex items-center gap-1.5">
                            {hoveredIndex !== null ? chartData[hoveredIndex]?.properties : properties.length}
                            {hoveredIndex !== null && (
                              <span className="text-[9px] text-[#3B82F6]">
                                (+{chartData[hoveredIndex]?.addedProperties})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* SVG Canvas */}
                      <div className="flex-1 relative min-h-0 w-full overflow-hidden">
                        <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible select-none" preserveAspectRatio="xMidYMid meet">
                          <title>Gráfico de Crecimiento de la Red</title>
                          <desc>Muestra el volumen acumulado de activos inmobiliarios y de usuarios registrados durante los últimos 12 meses.</desc>
                          <defs>
                            <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#EAB308" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#EAB308" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="propertyGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Gridlines horizontales */}
                          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                            const y = paddingTop + chartHeight * ratio;
                            const value = Math.round(maxVal * (1 - ratio));
                            return (
                              <g key={index}>
                                <line 
                                  x1={paddingLeft} 
                                  y1={y} 
                                  x2={paddingLeft + chartWidth} 
                                  y2={y} 
                                  stroke="rgba(255,255,255,0.03)" 
                                  strokeDasharray="4 4" 
                                />
                                <text 
                                  x={paddingLeft - 8} 
                                  y={y + 3} 
                                  fill="rgba(255,255,255,0.15)" 
                                  className="text-[8px] font-mono text-right"
                                  textAnchor="end"
                                >
                                  {value}
                                </text>
                              </g>
                            );
                          })}

                          {/* Eje X y líneas de mes */}
                          {chartData.map((d, i) => {
                            const x = paddingLeft + (i / (chartData.length - 1)) * chartWidth;
                            return (
                              <g key={i}>
                                <line 
                                  x1={x} 
                                  y1={paddingTop} 
                                  x2={x} 
                                  y2={paddingTop + chartHeight} 
                                  stroke="rgba(255,255,255,0.02)" 
                                />
                                <text 
                                  x={x} 
                                  y={paddingTop + chartHeight + 15} 
                                  fill="rgba(255,255,255,0.15)" 
                                  className="text-[7px] font-mono text-center"
                                  textAnchor="middle"
                                >
                                  {d.label}
                                </text>
                              </g>
                            );
                          })}

                          {/* Áreas bajo la curva Bezier */}
                          {userPoints.length > 0 && (
                            <path d={getUserAreaPath(userPoints)} fill="url(#userGrad)" />
                          )}
                          {propertyPoints.length > 0 && (
                            <path d={getPropertyAreaPath(propertyPoints)} fill="url(#propertyGrad)" />
                          )}

                          {/* Líneas Bezier */}
                          {userPoints.length > 0 && (
                            <path 
                              d={getBezierPath(userPoints)} 
                              fill="none" 
                              stroke="#EAB308" 
                              strokeWidth="1.5" 
                            />
                          )}
                          {propertyPoints.length > 0 && (
                            <path 
                              d={getBezierPath(propertyPoints)} 
                              fill="none" 
                              stroke="#3B82F6" 
                              strokeWidth="1.5" 
                            />
                          )}

                          {/* Línea de escaneo vertical en hover */}
                          {hoveredIndex !== null && (
                            <line 
                              x1={paddingLeft + (hoveredIndex / (chartData.length - 1)) * chartWidth}
                              y1={paddingTop}
                              x2={paddingLeft + (hoveredIndex / (chartData.length - 1)) * chartWidth}
                              y2={paddingTop + chartHeight}
                              stroke="rgba(255, 255, 255, 0.1)"
                              strokeWidth="1"
                              strokeDasharray="2 2"
                            />
                          )}

                          {/* Puntos interactivos de nodos */}
                          {userPoints.map((p, i) => (
                            <circle
                              key={`u-${i}`}
                              cx={p.x}
                              cy={p.y}
                              r={hoveredIndex === i ? 4 : 2.5}
                              fill="#EAB308"
                              stroke="#0A0A0B"
                              strokeWidth={hoveredIndex === i ? 1.5 : 1}
                              className="transition-all duration-150 cursor-pointer"
                              onMouseEnter={() => setHoveredIndex(i)}
                              onMouseLeave={() => setHoveredIndex(null)}
                            />
                          ))}

                          {/* Puntos interactivos de activos */}
                          {propertyPoints.map((p, i) => (
                            <circle
                              key={`p-${i}`}
                              cx={p.x}
                              cy={p.y}
                              r={hoveredIndex === i ? 4 : 2.5}
                              fill="#3B82F6"
                              stroke="#0A0A0B"
                              strokeWidth={hoveredIndex === i ? 1.5 : 1}
                              className="transition-all duration-150 cursor-pointer"
                              onMouseEnter={() => setHoveredIndex(i)}
                              onMouseLeave={() => setHoveredIndex(null)}
                            />
                          ))}

                          {/* Rectángulos de hover invisible */}
                          {chartData.map((d, i) => {
                            const x = paddingLeft + (i / (chartData.length - 1)) * chartWidth;
                            const colWidth = chartWidth / (chartData.length - 1);
                            return (
                              <rect
                                key={`hover-${i}`}
                                x={x - colWidth / 2}
                                y={paddingTop}
                                width={colWidth}
                                height={chartHeight}
                                fill="transparent"
                                className="cursor-pointer focus:outline-none focus:fill-white/5 transition-colors"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                tabIndex={0}
                                onFocus={() => setHoveredIndex(i)}
                                onBlur={() => setHoveredIndex(null)}
                                role="button"
                                aria-label={`Datos de ${d.fullName}: ${d.users} usuarios, ${d.properties} propiedades.`}
                              />
                            );
                          })}
                        </svg>

                        {/* Tooltip HUD flotante en hover */}
                        {hoveredIndex !== null && chartData[hoveredIndex] && (
                          <div 
                            className="absolute bg-black border border-white/10 p-3 text-[9px] font-mono pointer-events-none rounded-sm shadow-xl z-20 space-y-1"
                            style={{
                              left: `${Math.min(
                                Math.max(
                                  ((hoveredIndex / (chartData.length - 1)) * 100) - 10,
                                  5
                                ),
                                75
                              )}%`,
                              bottom: '30%',
                            }}
                          >
                            <p className="text-zinc-500 font-bold uppercase border-b border-white/5 pb-1 mb-1">
                              {chartData[hoveredIndex].fullName}
                            </p>
                            <p className="text-white flex justify-between gap-4">
                              <span>Nodos:</span>
                              <span className="text-[#EAB308] font-bold">
                                {chartData[hoveredIndex].users} (+{chartData[hoveredIndex].addedUsers})
                              </span>
                            </p>
                            <p className="text-white flex justify-between gap-4">
                              <span>Activos:</span>
                              <span className="text-[#3B82F6] font-bold">
                                {chartData[hoveredIndex].properties} (+{chartData[hoveredIndex].addedProperties})
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="col-span-1 @xl:col-span-2 @4xl:col-span-1 bg-[#0A0A0B] border border-white/5 rounded-sm p-6 flex flex-col h-[350px] @4xl:h-[400px]">
                      <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Actividad Reciente</h3>
                      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {[
                          { node: 'Nodo 842', action: 'Nuevo Activo Verificado', time: '2m', color: 'green' },
                          { node: 'Nodo 109', action: 'Solicitud de Retiro', time: '14m', color: 'red' },
                          { node: 'Nodo 562', action: 'Actualización de Perfil', time: '45m', color: 'yellow' },
                          { node: 'Nodo 221', action: 'Cita Confirmada', time: '1h', color: 'blue' },
                          { node: 'Nodo 903', action: 'Fallo de Autenticación', time: '2h', color: 'red' },
                          { node: 'Nodo 441', action: 'Nuevo Nodo Registrado', time: '3h', color: 'yellow' },
                        ].map((log, i) => (
                          <div key={i} className="flex items-start gap-3 border-l border-white/5 pl-4 relative">
                            <div className={`absolute left-[-4.5px] top-1 w-2 h-2 rounded-full border border-black ${
                              log.color === 'green' ? 'bg-green-500' : 
                              log.color === 'red' ? 'bg-red-500' : 
                              log.color === 'yellow' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <p className="text-[10px] text-white font-bold">{log.action}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[9px] text-zinc-500 uppercase font-mono">{log.node}</span>
                                <span className="text-[9px] text-zinc-600 font-mono">{log.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Broadcast Multi-tenant con Desbloqueo Técnico */}
                    <div className="col-span-1 @xl:col-span-2 @4xl:col-span-4 bg-[#0A0A0B] border border-white/5 rounded-sm p-6 @4xl:p-8 space-y-6 relative overflow-hidden">
                      <div className="flex flex-col @md:flex-row @md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                          </div>
                          <div>
                            <h3 className="font-display font-black text-white text-xs @4xl:text-sm tracking-tighter uppercase">Centro de Transmisión Masiva // Aislamiento SaaS</h3>
                            <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">Control de notificaciones multi-tenant y globales</p>
                          </div>
                        </div>
                        <div className="text-[9px] font-mono text-zinc-400 bg-white/5 px-3 py-1.5 rounded-sm border border-white/5 flex items-center gap-2 self-start @md:self-center">
                          <Users size={12} className="text-yellow-500" />
                          Destinatarios en red: <span className="text-yellow-500 font-black">{targetUsers.length} Nodos</span>
                        </div>
                      </div>

                      <p className="text-zinc-500 text-[10px] leading-relaxed uppercase font-mono tracking-wider max-w-4xl">
                        Aislamiento de seguridad: Si su rol es superadmin, la difusión afectará a todos los usuarios del sistema. En cualquier otro rol administrativo, el alcance se restringe estrictamente a los usuarios asociados con su ID de organización ({profile?.organizationId || 'N/A'}).
                      </p>

                      <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {/* Título */}
                          <div>
                            <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1.5">Título del Broadcast</label>
                            <input 
                              type="text"
                              value={broadcastTitle}
                              onChange={(e) => setBroadcastTitle(e.target.value)}
                              disabled={isTransmitting}
                              className="w-full bg-white/5 border border-white/15 rounded-sm px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-500/50 transition-all font-mono"
                              placeholder="MANTENIMIENTO DE SERVIDORES / ALERTA CRÍTICA..."
                            />
                          </div>

                          {/* Tipo Selector */}
                          <div>
                            <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1.5">Canal de Transmisión</label>
                            <div className="grid grid-cols-2 @sm:grid-cols-4 gap-2">
                              {(['info', 'success', 'warning', 'error'] as const).map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  disabled={isTransmitting}
                                  onClick={() => setBroadcastType(type)}
                                  className={`py-2 px-1.5 rounded-sm text-[8px] font-black uppercase tracking-widest transition-all border ${
                                    broadcastType === type
                                      ? type === 'info' ? 'bg-blue-500/10 text-blue-400 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                                      : type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/40 shadow-[0_0_12px_rgba(34,197,94,0.15)]'
                                      : type === 'warning' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/40 shadow-[0_0_12px_rgba(234,179,8,0.15)]'
                                      : 'bg-red-500/10 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                                      : 'bg-white/2 hover:bg-white/5 text-zinc-500 border-white/5 hover:text-zinc-300'
                                  }`}
                                >
                                  {type === 'info' ? 'Info' : type === 'success' ? 'Éxito' : type === 'warning' ? 'Alerta' : 'Peligro'}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Mensaje */}
                          <div>
                            <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1.5">Mensaje de Alerta</label>
                            <textarea 
                              value={broadcastMessage}
                              onChange={(e) => setBroadcastMessage(e.target.value)}
                              disabled={isTransmitting}
                              className="w-full bg-white/5 border border-white/15 rounded-sm p-4 text-xs h-24 focus:outline-none focus:border-yellow-500/50 transition-all font-mono custom-scrollbar resize-none" 
                              placeholder="INGRESE EL MENSAJE CRÍTICO QUE SERÁ NOTIFICADO..." 
                            />
                          </div>
                        </div>

                        <div className="space-y-4 flex flex-col justify-between">
                          {/* Desbloqueo militar de seguridad */}
                          <div className="bg-yellow-500/5 border border-yellow-500/15 p-4 rounded-sm space-y-3 flex-1 flex flex-col justify-center">
                            <div className="flex items-center gap-2 text-yellow-500">
                              <ShieldAlert size={14} className="animate-pulse" />
                              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Cámara de Seguridad Activa</span>
                            </div>
                            <p className="text-zinc-400 text-[9px] font-mono leading-relaxed uppercase tracking-wider">
                              Para mitigar difusiones erróneas, debe escribir exactamente <span className="text-yellow-500 font-bold font-mono">"TRANSMITIR"</span> en la casilla inferior.
                            </p>
                            <input 
                              type="text"
                              value={confirmWord}
                              onChange={(e) => setConfirmWord(e.target.value)}
                              disabled={isTransmitting}
                              className="w-full bg-black/40 border border-white/10 rounded-sm px-3 py-2 text-[10px] text-white font-mono placeholder:text-zinc-700 tracking-widest text-center focus:outline-none focus:border-yellow-500/50"
                              placeholder="ESCRIBA 'TRANSMITIR'..."
                            />
                          </div>

                          {/* Botón de Transmisión */}
                          <button 
                            onClick={handleSendBroadcast}
                            disabled={confirmWord !== 'TRANSMITIR' || isTransmitting || !broadcastTitle.trim() || !broadcastMessage.trim()}
                            className={`w-full py-3.5 rounded-sm font-display font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 border select-none active:scale-[0.98] ${
                              confirmWord !== 'TRANSMITIR' || isTransmitting || !broadcastTitle.trim() || !broadcastMessage.trim()
                                ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed' 
                                : 'bg-yellow-500 border-yellow-500 text-black hover:bg-yellow-400 cursor-pointer shadow-[0_0_20px_rgba(234,179,8,0.25)]'
                            }`}
                          >
                            {isTransmitting ? (
                              <>
                                <div className="w-3 h-3 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
                                Difundiendo en Lotes...
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                Iniciar Difusión Crítica
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Consola de Logs Tácticos / Barra de Progreso */}
                      <div className="space-y-3 font-mono">
                        {isTransmitting && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-500">
                              <span>Subiendo paquetes de red...</span>
                              <span className="text-yellow-500">{transmitProgress} / {transmitTotal} Nodos</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-none overflow-hidden">
                              <div 
                                className="h-full bg-yellow-500 transition-all duration-300 shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                                style={{ width: `${transmitTotal > 0 ? (transmitProgress / transmitTotal) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="border border-white/5 rounded-sm bg-black/50 p-4 h-28 overflow-y-auto custom-scrollbar flex flex-col space-y-1 select-text">
                          <div className="flex items-center gap-2 border-b border-white/5 pb-1 mb-1 text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                            <Terminal size={10} />
                            <span>Terminal de Red Broadcast // Telemetry Stream</span>
                          </div>
                          {broadcastLogs.length === 0 ? (
                            <p className="text-zinc-700 text-[8px] tracking-widest italic animate-pulse">&gt; EN ESPERA DE COMANDOS CRÍTICOS...</p>
                          ) : (
                            broadcastLogs.map((log, i) => {
                              const isError = log.includes('[ERROR]');
                              const isSuccess = log.includes('[ÉXITO]');
                              const isWarning = log.includes('[PROGRESO]') || log.includes('[INICIO]');
                              return (
                                <p 
                                  key={i} 
                                  className={`text-[8.5px] leading-tight tracking-wider ${
                                    isError ? 'text-red-400' :
                                    isSuccess ? 'text-green-400 font-bold' :
                                    isWarning ? 'text-yellow-400' : 'text-zinc-500'
                                  }`}
                                >
                                  &gt; {log}
                                </p>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab !== 'METRICS' && (
                  <div className="bg-[#0A0A0B] border border-white/5 rounded-sm overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/5 border-b border-white/5">
                            <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] w-12">#</th>
                            {activeTab === 'USERS' && (
                              <>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Nodo / Usuario</th>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Organización</th>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Rol</th>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Estado</th>
                              </>
                            )}
                            {activeTab === 'PROPERTIES' && (
                              <>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Propiedad</th>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Ubicación</th>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Precio</th>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                              </>
                            )}
                            {activeTab === 'REQUESTS' && (
                              <>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Requerimientos</th>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Presupuesto</th>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Org ID</th>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Tipo</th>
                              </>
                            )}
                            {activeTab === 'APPOINTMENTS' && (
                              <>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Cliente</th>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Fecha/Hora</th>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Propiedad</th>
                                <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Estado</th>
                              </>
                            )}
                            <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((item: any, idx) => (
                            <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                              <td className="p-4 text-[10px] font-mono text-zinc-500">{idx + 1}</td>
                              
                              {activeTab === 'USERS' && (
                                <>
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center overflow-hidden">
                                        <img src={item.image} alt={`Avatar de ${item.name}`} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-white">{item.name}</p>
                                        <p className="text-[10px] text-zinc-500 font-mono">{item.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-[10px] text-zinc-400 font-mono uppercase bg-white/5 px-2 py-1 rounded">
                                      {item.organizationId}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                      item.role === 'superadmin' ? 'bg-yellow-500/20 text-yellow-500' :
                                      item.role === 'Admin' ? 'bg-blue-500/20 text-blue-500' :
                                      'bg-white/10 text-white/60'
                                    }`}>
                                      {item.role}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                      <span className="text-[10px] text-zinc-400 font-mono uppercase">ONLINE</span>
                                    </div>
                                  </td>
                                </>
                              )}

                              {activeTab === 'PROPERTIES' && (
                                <>
                                  <td className="p-4">
                                    <p className="text-xs font-bold text-white uppercase">{item.name}</p>
                                    <p className="text-[10px] text-zinc-500 font-mono">ID: {item.id.substring(0, 8)}...</p>
                                  </td>
                                  <td className="p-4">
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{item.location}</p>
                                  </td>
                                  <td className="p-4">
                                    <p className="text-xs font-mono font-black text-yellow-500">
                                      ${item.price?.toLocaleString()}
                                    </p>
                                  </td>
                                  <td className="p-4">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                      item.verifiedStatus === 'verified' ? 'bg-green-500/20 text-green-500' :
                                      item.verifiedStatus === 'rejected' ? 'bg-red-500/20 text-red-500' :
                                      item.verifiedStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                      'bg-white/10 text-white/40'
                                    }`}>
                                      {item.verifiedStatus || 'unverified'}
                                    </span>
                                  </td>
                                </>
                              )}

                              {activeTab === 'REQUESTS' && (
                                <>
                                  <td className="p-4 max-w-xs">
                                    <p className="text-[10px] text-zinc-300 line-clamp-1">{item.requirements}</p>
                                  </td>
                                  <td className="p-4">
                                    <p className="text-xs font-mono font-black text-green-500">
                                      ${item.budget?.toLocaleString()}
                                    </p>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-[10px] text-zinc-500 font-mono uppercase bg-white/5 px-2 py-1 rounded">
                                      {item.organizationId}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-[10px] font-black uppercase text-zinc-400 border border-white/10 px-2 py-1 rounded">
                                      {item.type}
                                    </span>
                                  </td>
                                </>
                              )}

                              {activeTab === 'APPOINTMENTS' && (
                                <>
                                  <td className="p-4">
                                    <p className="text-xs font-bold text-white">{item.userName}</p>
                                    <p className="text-[10px] text-zinc-500 font-mono">{item.userEmail || 'S/E'}</p>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      <Clock size={12} className="text-zinc-600" />
                                      <div>
                                        <p className="text-[10px] text-zinc-300 font-bold">{item.date}</p>
                                        <p className="text-[10px] text-zinc-500 font-mono">{item.time}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase truncate max-w-[150px]">
                                      {item.propertyName || 'Inquiry General'}
                                    </p>
                                  </td>
                                  <td className="p-4">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                      item.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                                      item.status === 'Cancelled' ? 'bg-red-500/20 text-red-500' :
                                      item.status === 'Confirmed' ? 'bg-blue-500/20 text-blue-500' :
                                      'bg-yellow-500/20 text-yellow-500'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </td>
                                </>
                              )}
                              
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    aria-label={`Editar ${activeTab === 'USERS' ? 'usuario ' + item.name : activeTab === 'PROPERTIES' ? 'propiedad ' + item.name : 'registro'}`}
                                    className="p-2 text-zinc-500 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-yellow-500/50 rounded-sm cursor-pointer"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button 
                                    aria-label={`Eliminar ${activeTab === 'USERS' ? 'usuario ' + item.name : activeTab === 'PROPERTIES' ? 'propiedad ' + item.name : 'registro'}`}
                                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors focus:outline-none focus:ring-1 focus:ring-red-500/50 rounded-sm cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                  <button 
                                    aria-label="Más opciones"
                                    className="p-2 text-zinc-500 hover:text-yellow-500 transition-colors focus:outline-none focus:ring-1 focus:ring-yellow-500/50 rounded-sm cursor-pointer"
                                  >
                                    <MoreHorizontal size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function NavItem({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`flex items-center justify-between p-2.5 @4xl:p-3 rounded-sm transition-all group shrink-0 select-none cursor-pointer border-b-2 @4xl:border-b-0 @4xl:border-r-2 ${
        active 
          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500' 
          : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-2 @4xl:gap-3">
        <span className={active ? 'text-yellow-500' : 'text-zinc-400 group-hover:text-white/40'}>
          {icon}
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
      </div>
      {count !== undefined && (
        <span className={`ml-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
          active ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-zinc-400 group-hover:text-white/40'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}
