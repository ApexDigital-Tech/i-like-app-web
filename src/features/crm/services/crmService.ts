import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { PropertyRequest, Appointment, AppNotification } from '../../../types';

export const crmService = {
  /**
   * Suscribirse a las solicitudes de propiedades de la organización
   */
  subscribeToRequests: (organizationId: string, callback: (requests: PropertyRequest[]) => void): Unsubscribe => {
    const q = query(
      collection(db, 'requests'), 
      where('organizationId', '==', organizationId)
    );
    return onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PropertyRequest));
      // Sort in memory: newest first
      const sorted = [...reqs].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      callback(sorted);
    });
  },

  /**
   * Suscribirse a las citas (con aislamiento por organización y opcionalmente por usuario)
   */
  subscribeToAppointments: (organizationId: string, userId: string, isAdmin: boolean, callback: (appointments: Appointment[]) => void): Unsubscribe => {
    const baseQuery = query(collection(db, 'appointments'), where('organizationId', '==', organizationId));
    
    const q = isAdmin 
      ? baseQuery
      : query(baseQuery, where('userId', '==', userId));
      
    return onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      // Sort in memory: date ascending
      const sorted = [...apps].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      callback(sorted);
    });
  },

  /**
   * Suscribirse a las notificaciones de la organización
   */
  subscribeToNotifications: (organizationId: string, userId: string, isAdmin: boolean, callback: (notifications: AppNotification[]) => void): Unsubscribe => {
    const baseQuery = query(collection(db, 'notifications'), where('organizationId', '==', organizationId));
    
    const q = isAdmin 
      ? baseQuery
      : query(baseQuery, where('userId', '==', userId));

    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
      // Sort in memory: newest first
      const sorted = [...notes].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      callback(sorted);
    });
  },

  /**
   * Agregar una solicitud asociada a la organización
   */
  addRequest: async (request: Partial<PropertyRequest>, organizationId: string): Promise<void> => {
    await addDoc(collection(db, 'requests'), {
      ...request,
      organizationId,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Agregar una cita y notificar al admin de la organización
   */
  addAppointment: async (appointment: Partial<Appointment>, userId: string, organizationId: string): Promise<void> => {
    await addDoc(collection(db, 'appointments'), {
      ...appointment,
      userId,
      organizationId,
      createdAt: serverTimestamp(),
      status: 'Pending'
    });

    // Notificación automática al admin de la organización
    await crmService.addNotification({
      userId: 'admin',
      organizationId,
      title: 'Nueva Cita Agendada',
      message: `Nueva solicitud de cita de ${appointment.userName}.`,
      type: 'info',
    }, organizationId);
  },

  /**
   * Actualizar una cita
   */
  updateAppointment: async (id: string, data: Partial<Appointment>, organizationId: string): Promise<void> => {
    // Validamos consistencia de organización en la escritura
    await updateDoc(doc(db, 'appointments', id), {
      ...data,
      organizationId
    });
  },

  /**
   * Marcar notificación como leída
   */
  markNotificationRead: async (id: string, organizationId: string): Promise<void> => {
    // La regla de seguridad validará que el usuario/admin pertenezca a la org de la notificación
    await updateDoc(doc(db, 'notifications', id), { 
      read: true,
      organizationId 
    });
  },

  /**
   * Agregar una notificación para un usuario u organización
   */
  addNotification: async (notification: Partial<AppNotification>, organizationId: string): Promise<void> => {
    await addDoc(collection(db, 'notifications'), {
      ...notification,
      organizationId,
      read: false,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Suscribirse a TODAS las solicitudes del sistema (Solo SuperAdmin)
   */
  subscribeToAllRequests: (callback: (requests: PropertyRequest[]) => void): Unsubscribe => {
    const q = collection(db, 'requests');
    return onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PropertyRequest));
      const sorted = [...reqs].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      callback(sorted);
    });
  },

  /**
   * Suscribirse a TODAS las citas del sistema (Solo SuperAdmin)
   */
  subscribeToAllAppointments: (callback: (appointments: Appointment[]) => void): Unsubscribe => {
    const q = collection(db, 'appointments');
    return onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      const sorted = [...apps].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      callback(sorted);
    });
  }
};

