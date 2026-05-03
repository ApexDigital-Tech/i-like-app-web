import React, { useState, useEffect, useMemo } from 'react';
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
  Clock
} from 'lucide-react';
import { UserProfile, Property, PropertyRequest, Appointment } from '../types';
import { authService } from '../features/auth/services/authService';
import { propertyService } from '../features/properties/services/propertyService';
import { crmService } from '../features/crm/services/crmService';

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
      icon: <Calendar className="w-5 h-5 text-purple-500" />,
      color: 'purple'
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
    <div className="fixed inset-0 z-[100] bg-black flex overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/5 bg-[#0A0A0B] flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-yellow-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="font-display font-black text-white text-sm tracking-tighter">VID-A CRM</h2>
              <p className="text-[10px] text-yellow-500 font-mono font-bold tracking-[0.2em] uppercase">SuperAdmin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            active={activeTab === 'METRICS'} 
            onClick={() => setActiveTab('METRICS')} 
            icon={<BarChart3 size={18} />} 
            label="Métricas Globales" 
          />
          <NavItem 
            active={activeTab === 'USERS'} 
            onClick={() => setActiveTab('USERS')} 
            icon={<Users size={18} />} 
            label="Gestión de Nodos" 
            count={users.length}
          />
          <NavItem 
            active={activeTab === 'PROPERTIES'} 
            onClick={() => setActiveTab('PROPERTIES')} 
            icon={<Building2 size={18} />} 
            label="Activos Inmobiliarios" 
            count={properties.length}
          />
          <NavItem 
            active={activeTab === 'REQUESTS'} 
            onClick={() => setActiveTab('REQUESTS')} 
            icon={<ClipboardList size={18} />} 
            label="Pipeline de Solicitudes" 
            count={requests.length}
          />
          <NavItem 
            active={activeTab === 'APPOINTMENTS'} 
            onClick={() => setActiveTab('APPOINTMENTS')} 
            icon={<Calendar size={18} />} 
            label="Agenda Ejecutiva" 
            count={appointments.length}
          />
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={onClose}
            className="w-full py-3 border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all text-xs font-bold uppercase tracking-widest"
          >
            Regresar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div>
            <h1 className="text-xl font-display font-black text-white uppercase tracking-tight">
              {activeTab === 'METRICS' ? 'Dashboard de Telemetría' : 
               activeTab === 'USERS' ? 'Control de Nodos (Usuarios)' :
               activeTab === 'PROPERTIES' ? 'Inventario Global de Activos' :
               activeTab === 'REQUESTS' ? 'Gestión de Solicitudes' : 'Agenda del Sistema'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Enlace Satelital Activo // Nodo SuperAdmin</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text"
                placeholder="BUSCAR EN EL SISTEMA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-sm py-2 pl-10 pr-4 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-yellow-500/50 w-64 font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                <Bell size={18} className="text-white/40" />
              </button>
              <button className="w-10 h-10 rounded border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                <Settings size={18} className="text-white/40" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 z-10 custom-scrollbar">
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
                  <div className="grid grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                      <div key={i} className="bg-[#0A0A0B] border border-white/5 p-6 rounded-sm relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          {stat.icon}
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{stat.label}</p>
                          <span className="text-[10px] text-green-500 font-mono font-bold bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <TrendingUp size={10} /> {stat.trend}
                          </span>
                        </div>
                        <div className="flex items-end gap-3">
                          <h3 className="text-4xl font-display font-black text-white tracking-tighter">{stat.value}</h3>
                          <p className="text-[10px] text-white/20 font-mono mb-2">REGISTROS</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {[1,2,3].map(j => (
                              <div key={j} className="w-6 h-6 rounded-full border border-black bg-white/10" />
                            ))}
                          </div>
                          <button className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                            Analizar <ArrowUpRight size={12} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Larger Metric Charts Placeholder */}
                    <div className="col-span-3 bg-[#0A0A0B] border border-white/5 rounded-sm p-8 h-[400px] flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-white font-bold uppercase tracking-widest text-xs">Crecimiento de la Red</h3>
                          <p className="text-[10px] text-white/30 font-mono mt-1">VOLUMEN DE ACTIVOS VS REGISTRO DE NODOS</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span className="text-[10px] text-white/40 font-bold uppercase">Nodos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-[10px] text-white/40 font-bold uppercase">Activos</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Fake Chart Visualization */}
                      <div className="flex-1 flex items-end justify-between gap-1 pb-4">
                        {[40, 60, 45, 80, 55, 90, 70, 85, 65, 100, 75, 95].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col gap-1 items-center group cursor-pointer">
                            <div 
                              className="w-full bg-blue-500/20 group-hover:bg-blue-500/40 transition-all duration-500 rounded-t-sm" 
                              style={{ height: `${h * 0.7}%` }} 
                            />
                            <div 
                              className="w-full bg-yellow-500/40 group-hover:bg-yellow-500/60 transition-all duration-500" 
                              style={{ height: `${h * 0.4}%` }} 
                            />
                            <span className="text-[8px] text-white/20 font-mono mt-2">M{i+1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="col-span-1 bg-[#0A0A0B] border border-white/5 rounded-sm p-6 flex flex-col">
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
                                <span className="text-[9px] text-white/30 uppercase font-mono">{log.node}</span>
                                <span className="text-[9px] text-white/20 font-mono">{log.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab !== 'METRICS' && (
                  <div className="bg-[#0A0A0B] border border-white/5 rounded-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/5 border-b border-white/5">
                            <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] w-12">#</th>
                            {activeTab === 'USERS' && (
                              <>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Nodo / Usuario</th>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Organización</th>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Rol</th>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Estado</th>
                              </>
                            )}
                            {activeTab === 'PROPERTIES' && (
                              <>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Propiedad</th>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Ubicación</th>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Precio</th>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Status</th>
                              </>
                            )}
                            {activeTab === 'REQUESTS' && (
                              <>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Requerimientos</th>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Presupuesto</th>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Org ID</th>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Tipo</th>
                              </>
                            )}
                            {activeTab === 'APPOINTMENTS' && (
                              <>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Cliente</th>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Fecha/Hora</th>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Propiedad</th>
                                <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Estado</th>
                              </>
                            )}
                            <th className="p-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((item: any, idx) => (
                            <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                              <td className="p-4 text-[10px] font-mono text-white/20">{idx + 1}</td>
                              
                              {activeTab === 'USERS' && (
                                <>
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center overflow-hidden">
                                        <img src={item.image} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-white">{item.name}</p>
                                        <p className="text-[10px] text-white/30 font-mono">{item.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-[10px] text-white/40 font-mono uppercase bg-white/5 px-2 py-1 rounded">
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
                                      <span className="text-[10px] text-white/60 font-mono uppercase">ONLINE</span>
                                    </div>
                                  </td>
                                </>
                              )}

                              {activeTab === 'PROPERTIES' && (
                                <>
                                  <td className="p-4">
                                    <p className="text-xs font-bold text-white uppercase">{item.name}</p>
                                    <p className="text-[10px] text-white/30 font-mono">ID: {item.id.substring(0, 8)}...</p>
                                  </td>
                                  <td className="p-4">
                                    <p className="text-[10px] text-white/60 font-bold uppercase">{item.location}</p>
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
                                    <p className="text-[10px] text-white/80 line-clamp-1">{item.requirements}</p>
                                  </td>
                                  <td className="p-4">
                                    <p className="text-xs font-mono font-black text-green-500">
                                      ${item.budget?.toLocaleString()}
                                    </p>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-[10px] text-white/40 font-mono uppercase bg-white/5 px-2 py-1 rounded">
                                      {item.organizationId}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-[10px] font-black uppercase text-white/40 border border-white/10 px-2 py-1 rounded">
                                      {item.type}
                                    </span>
                                  </td>
                                </>
                              )}

                              {activeTab === 'APPOINTMENTS' && (
                                <>
                                  <td className="p-4">
                                    <p className="text-xs font-bold text-white">{item.userName}</p>
                                    <p className="text-[10px] text-white/30 font-mono">{item.userEmail || 'S/E'}</p>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      <Clock size={12} className="text-white/20" />
                                      <div>
                                        <p className="text-[10px] text-white/80 font-bold">{item.date}</p>
                                        <p className="text-[10px] text-white/30 font-mono">{item.time}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <p className="text-[10px] text-white/60 font-bold uppercase truncate max-w-[150px]">
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
                                  <button className="p-2 text-white/20 hover:text-white transition-colors">
                                    <Edit size={14} />
                                  </button>
                                  <button className="p-2 text-white/20 hover:text-red-500 transition-colors">
                                    <Trash2 size={14} />
                                  </button>
                                  <button className="p-2 text-white/20 hover:text-yellow-500 transition-colors">
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
      className={`w-full flex items-center justify-between p-3 rounded-sm transition-all group ${
        active 
          ? 'bg-yellow-500/10 text-yellow-500 border-r-2 border-yellow-500' 
          : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? 'text-yellow-500' : 'text-white/20 group-hover:text-white/40'}>
          {icon}
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
          active ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-white/20 group-hover:text-white/40'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}
