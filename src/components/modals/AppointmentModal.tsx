import React from 'react';
import { Modal } from '../Modal';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useUIStore } from '../../features/ui/store/uiStore';
import { useCRMStore } from '../../features/crm/store/crmStore';
import { TRANSLATIONS, Appointment } from '../../types';
import { serverTimestamp } from 'firebase/firestore';

interface AppointmentModalProps {
  lang: 'en' | 'es' | 'pt';
  mode: 'add' | 'edit_outcome' | 'reschedule';
  selectedAppointment?: Appointment | null;
  propertyId?: string;
  propertyName?: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ 
  lang, 
  mode, 
  selectedAppointment,
  propertyId,
  propertyName 
}) => {
  const { profile, user: currentUser } = useAuthStore();
  const closeModal = useUIStore((state) => state.closeModal);
  const { addAppointment, updateAppointment } = useCRMStore();
  const t = TRANSLATIONS[lang];

  const handleSubmit = async () => {
    if (!currentUser) return;

    const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value;

    try {
      const organizationId = profile?.organizationId || 'default-org';
      
      if (mode === 'add') {
        const newAppt = {
          userId: currentUser.uid,
          userName: profile?.name || 'Client Alpha',
          propertyId: propertyId || 'general',
          propertyName: propertyName || 'General Inquiry',
          date: getVal('a-date'),
          time: getVal('a-time'),
          type: getVal('a-type') as any,
          status: 'Pending' as const,
          notes: getVal('a-notes'),
          createdAt: serverTimestamp() as any
        };
        await addAppointment(newAppt, currentUser.uid, organizationId);
      } else if (mode === 'edit_outcome' && selectedAppointment) {
        await updateAppointment(selectedAppointment.id, {
          outcome: getVal('a-outcome'),
          status: 'Completed'
        }, organizationId);
      } else if (mode === 'reschedule' && selectedAppointment) {
        await updateAppointment(selectedAppointment.id, {
          date: getVal('a-reschedule-date'),
          time: getVal('a-reschedule-time'),
          status: 'Confirmed'
        }, organizationId);
      }
      closeModal();
    } catch (error) {
      console.error('Error managing appointment:', error);
    }
  };

  const titles = {
    add: t.add_appointment,
    edit_outcome: 'Registrar Resultado',
    reschedule: 'Reprogramar Cita'
  };

  return (
    <Modal title={titles[mode]}>
      <div className="space-y-4">
        {mode === 'add' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.date}</label>
                <input id="a-date" type="date" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.time}</label>
                <input id="a-time" type="time" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.type}</label>
              <select id="a-type" className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white">
                <option value="Viewing">{t.viewing}</option>
                <option value="Meeting">{t.meeting}</option>
                <option value="Closing">{t.closing}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.notes}</label>
              <textarea id="a-notes" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs h-24 text-white" placeholder="Extra details..." />
            </div>
          </>
        )}

        {mode === 'edit_outcome' && (
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">Resultado de la Cita</label>
            <textarea id="a-outcome" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs h-32 text-white" placeholder="¿Cómo fue la visita? ¿Hay interés?" />
          </div>
        )}

        {mode === 'reschedule' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">Nueva Fecha</label>
              <input id="a-reschedule-date" type="date" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" defaultValue={selectedAppointment?.date} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">Nueva Hora</label>
              <input id="a-reschedule-time" type="time" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" defaultValue={selectedAppointment?.time} />
            </div>
          </div>
        )}

        <button 
          onClick={handleSubmit}
          className="w-full bg-primary text-black py-3 rounded-xl font-display font-black uppercase tracking-widest text-[10px] mt-4"
        >
          {t.confirm || 'Confirmar'}
        </button>
      </div>
    </Modal>
  );
};
