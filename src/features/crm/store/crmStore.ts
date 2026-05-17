import { create } from 'zustand';
import { PropertyRequest, Appointment, AppNotification, UserProfile } from '../../../types';
import { crmService } from '../services/crmService';

interface CRMState {
  requests: PropertyRequest[];
  appointments: Appointment[];
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;
  
  // Listeners
  initRequests: (organizationId: string) => () => void;
  initAppointments: (organizationId: string, userId: string | undefined, isAdmin: boolean) => () => void;
  initNotifications: (organizationId: string, userId: string | undefined, isAdmin: boolean) => () => void;
  
  // Actions - Requests
  addRequest: (request: Partial<PropertyRequest>, organizationId: string) => Promise<void>;
  
  // Actions - Appointments
  addAppointment: (appointment: Partial<Appointment>, userId: string | undefined, organizationId: string) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>, organizationId: string) => Promise<void>;
  
  // Actions - Notifications
  markNotificationRead: (id: string, organizationId: string) => Promise<void>;
  markAllNotificationsRead: (userId: string | undefined, isAdmin: boolean, organizationId: string) => Promise<void>;
  addNotification: (notification: Partial<AppNotification>, organizationId: string) => Promise<void>;
  broadcastNotification: (
    notification: Partial<AppNotification>,
    targetUsers: UserProfile[],
    senderId: string,
    organizationId: string,
    onProgress?: (sentCount: number, totalCount: number) => void
  ) => Promise<void>;
}

export const useCRMStore = create<CRMState>((set, get) => ({
  requests: [],
  appointments: [],
  notifications: [],
  loading: true,
  error: null,

  initRequests: (organizationId) => {
    return crmService.subscribeToRequests(organizationId, (reqs) => {
      set({ requests: reqs });
    });
  },

  initAppointments: (organizationId, userId, isAdmin) => {
    if (!userId) {
      set({ appointments: [] });
      return () => {};
    }
    return crmService.subscribeToAppointments(organizationId, userId, isAdmin, (apps) => {
      set({ appointments: apps });
    });
  },

  initNotifications: (organizationId, userId, isAdmin) => {
    if (!userId) {
      set({ notifications: [] });
      return () => {};
    }
    return crmService.subscribeToNotifications(organizationId, userId, isAdmin, (notes) => {
      set({ notifications: notes });
    });
  },

  addRequest: async (request, organizationId) => {
    await crmService.addRequest(request, organizationId);
  },

  addAppointment: async (appointment, userId, organizationId) => {
    if (!userId) return;
    await crmService.addAppointment(appointment, userId, organizationId);
  },

  updateAppointment: async (id, data, organizationId) => {
    await crmService.updateAppointment(id, data, organizationId);
  },

  markNotificationRead: async (id, organizationId) => {
    await crmService.markNotificationRead(id, organizationId);
  },

  markAllNotificationsRead: async (userId, isAdmin, organizationId) => {
    const { notifications } = get();
    const unread = notifications.filter(n => !n.read);
    const promises = unread.map(n => crmService.markNotificationRead(n.id, organizationId));
    await Promise.all(promises);
  },

  addNotification: async (notification, organizationId) => {
    await crmService.addNotification(notification, organizationId);
  },

  broadcastNotification: async (notification, targetUsers, senderId, organizationId, onProgress) => {
    await crmService.broadcastNotification(notification, targetUsers, senderId, organizationId, onProgress);
  }
}));


