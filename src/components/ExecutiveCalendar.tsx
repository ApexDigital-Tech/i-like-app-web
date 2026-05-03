import React, { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  startOfToday,
  parseISO,
  isWeekend
} from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  History,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  Edit2,
  FileText
} from 'lucide-react';
import { Appointment, TRANSLATIONS } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ExecutiveCalendarProps {
  appointments: Appointment[];
  lang: 'en' | 'es' | 'pt';
  onUpdateAppointment: (id: string, data: Partial<Appointment>) => void;
  onEditOutcome: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
}

const ExecutiveCalendar: React.FC<ExecutiveCalendarProps> = ({ 
  appointments, 
  lang, 
  onUpdateAppointment,
  onEditOutcome,
  onReschedule
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const t = TRANSLATIONS[lang];

  const locales = { es, en: enUS, pt: ptBR };
  const locale = locales[lang];

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const appointmentsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    appointments.forEach(app => {
      try {
        // Normalize date format to yyyy-MM-dd for comparison
        const dateObj = app.date.includes('-') ? parseISO(app.date) : new Date(app.date);
        const dateKey = format(dateObj, 'yyyy-MM-dd');
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(app);
      } catch (e) {
        const dateKey = app.date;
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(app);
      }
    });
    return map;
  }, [appointments]);

  const selectedDayAppointments = useMemo(() => {
    const key = format(selectedDate, 'yyyy-MM-dd');
    return appointmentsByDay[key] || [];
  }, [selectedDate, appointmentsByDay]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter glow-text-primary">
            {format(currentDate, 'MMMM yyyy', { locale })}
          </h2>
          <p className="text-zinc-500 font-display text-[10px] uppercase tracking-[0.2em] mt-1">
            {t.calendar} // {viewMode.toUpperCase()} VIEW
          </p>
        </div>

        <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/10">
          <button 
            onClick={() => setViewMode('month')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${viewMode === 'month' ? 'bg-primary text-[#172B36] shadow-lg scale-105' : 'text-zinc-500 hover:text-white'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> {t.month}
          </button>
          <button 
            onClick={() => setViewMode('week')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${viewMode === 'week' ? 'bg-primary text-[#172B36] shadow-lg scale-105' : 'text-zinc-500 hover:text-white'}`}
          >
            <List className="w-3.5 h-3.5" /> {t.week}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-1 text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20 rounded-full hover:bg-primary/10 transition-colors"
              >
                Today
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-4">
            {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((day) => (
              <div key={day} className="text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayApps = appointmentsByDay[dateKey] || [];
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, startOfToday());

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl transition-all group ${
                    !isCurrentMonth ? 'opacity-20 pointer-events-none' : 'hover:bg-white/5'
                  } ${isSelected ? 'bg-primary/20 border border-primary/50' : 'border border-transparent'}`}
                >
                  <span className={`text-xs font-black mb-1 ${isSelected ? 'text-primary' : isToday ? 'text-primary-dim' : 'text-zinc-400'}`}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="flex gap-0.5">
                    {dayApps.slice(0, 3).map((app, idx) => (
                      <div 
                        key={idx} 
                        className={`w-1 h-1 rounded-full ${
                          app.status === 'Confirmed' ? 'bg-primary-dim' : 
                          app.status === 'Completed' ? 'bg-primary' : 
                          'bg-zinc-600'
                        }`} 
                      />
                    ))}
                    {dayApps.length > 3 && <div className="w-1 h-1 rounded-full bg-zinc-600" />}
                  </div>

                  {isToday && !isSelected && (
                    <div className="absolute top-2 right-2 w-1 h-1 bg-primary-dim rounded-full shadow-[0_0_8px_rgba(255,153,50,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <History className="w-4 h-4 text-secondary" /> {format(selectedDate, 'EEEE d, MMMM', { locale })}
            </h3>
            <span className="text-[10px] font-black text-zinc-600 bg-white/5 px-3 py-1 rounded-full">
              {selectedDayAppointments.length} EVENTOS
            </span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {selectedDayAppointments.length === 0 ? (
              <div className="py-12 border border-dashed border-white/5 rounded-3xl text-center">
                <CalendarIcon className="w-10 h-10 text-zinc-800 mx-auto mb-4 opacity-50" />
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{t.no_notifications}</p>
              </div>
            ) : (
              selectedDayAppointments.map((app) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-panel p-5 rounded-3xl border border-white/5 group hover:border-primary/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wide group-hover:glow-text-primary transition-all">{app.userName}</h4>
                        <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
                          <Clock className="w-3 h-3" /> {app.time} // {app.status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                       <button 
                         onClick={() => onReschedule(app)}
                         title={t.reschedule}
                         className="p-2 hover:bg-white/5 text-zinc-500 hover:text-white rounded-xl transition-all"
                       >
                         <Edit2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  </div>

                  {app.notes && (
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4">
                      <p className="text-[10px] text-zinc-400 italic font-medium leading-relaxed font-mono">
                        "{app.notes}"
                      </p>
                    </div>
                  )}

                  {app.outcome ? (
                    <div className="border-t border-white/5 pt-4 mt-2">
                       <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-3 h-3 text-secondary" />
                          <span className="text-[8px] font-black uppercase text-secondary tracking-widest">{t.meeting_outcome}</span>
                       </div>
                       <p className="text-[10px] text-zinc-300 font-mono leading-relaxed bg-secondary/5 p-3 rounded-xl border border-secondary/10">
                          {app.outcome}
                       </p>
                    </div>
                  ) : app.status === 'Completed' && (
                    <button 
                      onClick={() => onEditOutcome(app)}
                      className="w-full py-3 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-secondary hover:text-black transition-all mt-2"
                    >
                      {t.complete_meeting}
                    </button>
                  )}

                  <div className="flex gap-2 mt-4">
                    {app.status === 'Pending' && (
                      <button 
                        onClick={() => onUpdateAppointment(app.id, { status: 'Confirmed' })}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-secondary/10 text-secondary hover:bg-secondary hover:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        <CheckCircle2 className="w-3 h-3" /> {t.confirm_meeting}
                      </button>
                    )}
                    {app.status === 'Confirmed' && (
                      <button 
                        onClick={() => onUpdateAppointment(app.id, { status: 'Completed' })}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        <CheckCircle2 className="w-3 h-3" /> {t.complete_meeting}
                      </button>
                    )}
                    {app.status !== 'Cancelled' && app.status !== 'Completed' && (
                      <button 
                        onClick={() => onUpdateAppointment(app.id, { status: 'Cancelled' })}
                        className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveCalendar;
