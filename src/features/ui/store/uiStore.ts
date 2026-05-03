import { create } from 'zustand';
import { Property, Appointment } from '../../../types';

export type ModalType = 
  | 'none' 
  | 'login' 
  | 'add_property' 
  | 'edit_property' 
  | 'add_request' 
  | 'settings' 
  | 'add_appointment' 
  | 'notifications' 
  | 'edit_outcome' 
  | 'reschedule';

interface ModalData {
  propertyToEdit?: Property | null;
  selectedAppointment?: Appointment | null;
}

interface UIState {
  activeModal: ModalType;
  modalData: ModalData;
  setActiveModal: (modal: ModalType, data?: ModalData) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: 'none',
  modalData: {},
  setActiveModal: (modal, data = {}) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: 'none', modalData: {} }),
}));
