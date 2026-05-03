import React from 'react';
import { Modal } from '../Modal';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useUIStore } from '../../features/ui/store/uiStore';
import { useCRMStore } from '../../features/crm/store/crmStore';
import { TRANSLATIONS } from '../../types';
import { serverTimestamp } from 'firebase/firestore';

interface RequestModalProps {
  lang: 'en' | 'es' | 'pt';
}

export const RequestModal: React.FC<RequestModalProps> = ({ lang }) => {
  const { profile, user: currentUser } = useAuthStore();
  const closeModal = useUIStore((state) => state.closeModal);
  const addRequest = useCRMStore((state) => state.addRequest);
  const t = TRANSLATIONS[lang];

  const handleSubmit = async () => {
    if (!currentUser) return;
    
    const budget = Number((document.getElementById('r-budget') as HTMLInputElement).value) || 0;
    const requirements = (document.getElementById('r-reqs') as HTMLTextAreaElement).value || 'No specifics.';
    const type = (document.getElementById('r-type') as HTMLSelectElement).value as any;
    const minBeds = Number((document.getElementById('r-beds') as HTMLInputElement).value) || 0;
    const minSqft = Number((document.getElementById('r-sqft') as HTMLInputElement).value) || 0;

    const newRequest = {
      user: profile?.name || "Guest Alpha",
      userId: currentUser.uid,
      budget,
      requirements,
      type,
      location: "Global",
      minBeds,
      minSqft,
      createdAt: serverTimestamp() as any
    };

    try {
      const organizationId = profile?.organizationId || 'default-org';
      await addRequest(newRequest, organizationId);
      closeModal();
    } catch (error) {
      console.error('Error posting request:', error);
    }
  };

  return (
    <Modal title={t.add_request}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.budget}</label>
            <input id="r-budget" type="number" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" placeholder="e.g. 500000" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.type}</label>
            <select id="r-type" className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white">
              <option value="Buy">{t.buy}</option>
              <option value="Rent">{t.rent}</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.beds}</label>
            <input id="r-beds" type="number" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" placeholder="Min Rooms" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.sqft}</label>
            <input id="r-sqft" type="number" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" placeholder="Min Mts2" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.looking_for}</label>
          <textarea id="r-reqs" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs h-32 text-white" placeholder="Describe your dream property..." />
        </div>
        <button 
          onClick={handleSubmit}
          className="w-full bg-secondary text-black py-3 rounded-xl font-display font-black uppercase tracking-widest text-[10px] mt-4"
        >
          {t.post_request}
        </button>
      </div>
    </Modal>
  );
};
