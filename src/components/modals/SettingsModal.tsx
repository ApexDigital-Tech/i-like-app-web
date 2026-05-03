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
      // Campos obligatorios para cumplir con isValidProfile en firestore.rules
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
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 p-1 relative group cursor-pointer">
            <img src={profile?.image} className="w-full h-full object-cover rounded-full" alt="Profile" />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center">
             <h3 className="text-xl font-display font-black text-white uppercase tracking-widest">{profile?.name}</h3>
             <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
               {profile?.role === 'Seller' ? t.seller : t.buyer}
             </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.name}</label>
            <input id="set-name" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" defaultValue={profile?.name} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.user_role}</label>
            <select id="set-role" className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white" defaultValue={profile?.role}>
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
          <input id="set-phone" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" defaultValue={profile?.phone} />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.bio}</label>
          <textarea id="set-bio" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs h-20 text-white" defaultValue={profile?.bio} />
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[10px] font-display font-bold text-zinc-500 tracking-widest uppercase mb-4">{t.language}</p>
          <div className="grid grid-cols-3 gap-2">
            {(['en', 'es', 'pt'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  lang === l ? 'bg-primary text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {l}
                {lang === l && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleUpdateProfile}
          className="w-full bg-primary text-black py-4 rounded-xl font-display font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(255,200,1,0.2)] hover:scale-[1.02] transition-all"
        >
          {t.save_changes || 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
};
