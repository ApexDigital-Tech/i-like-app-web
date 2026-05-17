import React from 'react';
import { Modal } from '../Modal';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useUIStore } from '../../features/ui/store/uiStore';
import { TRANSLATIONS } from '../../types';
import { Plus, Check } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface SettingsModalProps {
  lang: 'en' | 'es' | 'pt';
  setLang: (lang: 'en' | 'es' | 'pt') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ lang, setLang }) => {
  const { profile, user: currentUser } = useAuthStore();
  const closeModal = useUIStore((state) => state.closeModal);
  const t = TRANSLATIONS[lang];

  const handleUpdateProfile = async () => {
    if (!currentUser || !profile) return;
    
    const updatedProfile = {
      name: (document.getElementById('set-name') as HTMLInputElement).value,
      role: (document.getElementById('set-role') as HTMLSelectElement).value as any,
      phone: (document.getElementById('set-phone') as HTMLInputElement).value,
      bio: (document.getElementById('set-bio') as HTMLTextAreaElement).value,
      email: profile.email,
      image: profile.image,
      organizationId: profile.organizationId || 'default-org'
    };

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), updatedProfile);
      closeModal();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al guardar: ' + (error as any).message);
    }
  };

  return (
    <Modal title={t.profile_details}>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 p-1 relative group cursor-pointer shadow-md">
            <img src={profile?.image} className="w-full h-full object-cover rounded-full" alt="Profile" />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center">
             <h3 className="text-lg font-display font-black text-zinc-100 uppercase tracking-widest">{profile?.name}</h3>
             <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
               {profile?.role === 'Seller' ? t.seller : t.buyer}
             </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.name}</label>
            <input 
              id="set-name" 
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors" 
              defaultValue={profile?.name} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.user_role}</label>
            <select 
              id="set-role" 
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors" 
              defaultValue={profile?.role}
            >
              <option value="Seller">{t.seller}</option>
              <option value="Buyer">{t.buyer}</option>
              {profile?.role === 'superadmin' && (
                <option value="superadmin">Super Admin</option>
              )}
              {profile?.role === 'Admin' && (
                <option value="Admin">Admin</option>
              )}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.phone}</label>
          <input 
            id="set-phone" 
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors" 
            defaultValue={profile?.phone} 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.bio}</label>
          <textarea 
            id="set-bio" 
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs h-20 text-white focus:outline-none focus:border-primary/50 transition-colors resize-none" 
            defaultValue={profile?.bio} 
          />
        </div>

        {/* WhatsApp Premium Direct Support Panel */}
        <div className="p-4 bg-[#0f2c25] rounded-2xl border border-emerald-950/30 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.989-1.874-1.875-4.355-2.907-6.995-2.907-5.441 0-9.87 4.417-9.873 9.861-.001 1.702.443 3.366 1.29 4.843l-.994 3.63 3.793-.984zm11.304-4.816c-.302-.15-.1.353-.298-.444-.1-.19-.4-.3-.9-.55s-1.4-.7-1.625-.775-.375-.125-.525.1c-.15.225-.6.775-.725.925s-.275.15-.575.025c-.3-.15-1.275-.47-2.425-1.493-.896-.8-1.5-1.787-1.675-2.087-.175-.3-.02-.463.13-.613.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525-.6-1.45-1.05-2.525c-.347-.833-.669-.833-.925-.846-.15-.006-.325-.008-.5-.008-.175 0-.45.063-.687.313-.238.25-.913.887-.913 2.163 0 1.275.925 2.5 1.05 2.675.125.175 1.82 2.78 4.409 3.896.616.266 1.097.424 1.472.543.62.197 1.18.17 1.625.105.495-.072 1.5-.613 1.71-1.2s.21-1.1.15-1.2-.225-.15-.525-.3z"/>
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-300">Soporte por WhatsApp</h4>
              <p className="text-[9px] text-emerald-400/80">Atención personalizada con tu Asesor Directo</p>
            </div>
          </div>
          <a 
            href="https://wa.me/593999999999" 
            target="_blank" 
            rel="noreferrer"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-sm"
          >
            Chat
          </a>
        </div>

        {/* Unified Application Feedback & Suggestion Card */}
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 shadow-sm">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">¿Cómo podemos mejorar?</h4>
            <p className="text-[9px] text-zinc-400">Envíanos tus ideas, sugerencias de funciones o reportes de errores.</p>
          </div>
          <textarea 
            placeholder="Escribe tu propuesta o comentario aquí..." 
            className="w-full bg-zinc-950/50 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all h-20 resize-none placeholder-zinc-500"
          />
          <button 
            type="button"
            onClick={() => alert('¡Gracias por tus comentarios! Evaluaremos tu propuesta con alta prioridad.')}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
          >
            Enviar Comentarios
          </button>
        </div>

        {/* Language Selection Bar */}
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
          <p className="text-[10px] font-display font-bold text-zinc-400 tracking-widest uppercase mb-3">{t.language}</p>
          <div className="grid grid-cols-3 gap-2">
            {(['en', 'es', 'pt'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  lang === l ? 'bg-primary text-[#101420] font-black shadow-sm' : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:bg-zinc-800'
                }`}
              >
                {l}
                {lang === l && <Check className="w-3 h-3 text-[#101420]" />}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleUpdateProfile}
          className="w-full bg-primary text-[#101420] py-4 rounded-xl font-display font-black uppercase tracking-widest text-[10.5px] shadow-[0_0_20px_rgba(252,195,107,0.25)] hover:bg-primary-dim transition-colors"
        >
          {t.save_changes || 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
};
