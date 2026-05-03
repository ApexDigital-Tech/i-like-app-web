import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useUIStore } from '../features/ui/store/uiStore';

interface ModalProps {
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, children }) => {
  const closeModal = useUIStore((state) => state.closeModal);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={closeModal}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="glass-panel w-full max-w-lg p-8 rounded-3xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={closeModal}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
          {title}
        </h2>
        {children}
      </motion.div>
    </motion.div>
  );
};
