import React from 'react';
import { Modal } from '../Modal';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useUIStore } from '../../features/ui/store/uiStore';
import { TRANSLATIONS } from '../../types';

interface LoginModalProps {
  lang: 'en' | 'es' | 'pt';
}

export const LoginModal: React.FC<LoginModalProps> = ({ lang }) => {
  const login = useAuthStore((state) => state.login);
  const closeModal = useUIStore((state) => state.closeModal);
  const t = TRANSLATIONS[lang];

  const handleLogin = async () => {
    await login(); // popup: waits for user to complete auth, then resolves
    closeModal();
  };

  return (
    <Modal title={t.login}>
      <div className="space-y-6 text-center">
        <p className="text-zinc-500 text-xs font-display tracking-widest uppercase mb-4">
          Select authentication protocol to access the metropolitan market network.
        </p>
        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-4 bg-white text-black py-4 rounded-xl font-display font-black uppercase tracking-widest text-[12px] shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-zinc-200 transition-all"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            className="w-5 h-5" 
            alt="Google" 
          />
          Sign in with Google
        </button>
      </div>
    </Modal>
  );
};
