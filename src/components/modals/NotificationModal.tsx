import React from 'react';
import { Modal } from '../Modal';
import { useCRMStore } from '../../features/crm/store/crmStore';
import { useAuthStore } from '../../features/auth/store/authStore';
import { TRANSLATIONS } from '../../types';
import { Check, Bell, Trash2 } from 'lucide-react';

interface NotificationModalProps {
  lang: 'en' | 'es' | 'pt';
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ lang }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useCRMStore();
  const { profile, user: currentUser, isAdmin } = useAuthStore();
  const t = TRANSLATIONS[lang];

  const organizationId = profile?.organizationId || 'default-org';

  return (
    <Modal title={t.notifications}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
        {notifications.length > 0 && (
          <button 
            onClick={() => markAllNotificationsRead(currentUser?.uid, isAdmin, organizationId)}
            className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold text-primary uppercase tracking-widest transition-all mb-4"
          >
            <Check className="w-4 h-4" />
            Marcar todas como leídas
          </button>
        )}
        
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-display">No hay nuevas notificaciones</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 rounded-2xl border transition-all ${
                  notif.read 
                    ? 'bg-transparent border-white/5 opacity-60' 
                    : 'bg-white/5 border-primary/20 shadow-[0_0_20px_rgba(255,200,1,0.05)]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`text-[10px] font-display font-black uppercase tracking-widest ${
                    notif.type === 'error' ? 'text-red-400' : 'text-primary'
                  }`}>
                    {notif.title}
                  </h4>
                  {!notif.read && (
                    <button 
                      onClick={() => markNotificationRead(notif.id, organizationId)}
                      className="text-[9px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest"
                    >
                      Leído
                    </button>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{notif.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
