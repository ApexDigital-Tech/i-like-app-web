import { useEffect } from 'react';
import { useCRMStore } from '../store/crmStore';
import { useAuthStore } from '../../auth/store/authStore';

export const useCRMInit = () => {
  const { user, profile, isAdmin } = useAuthStore();
  const { initRequests, initAppointments, initNotifications } = useCRMStore();

  useEffect(() => {
    if (!profile?.organizationId) return;

    const unsubReqs = initRequests(profile.organizationId);
    return () => unsubReqs();
  }, [initRequests, profile?.organizationId]);

  useEffect(() => {
    if (!profile?.organizationId || !user?.uid) return;

    const unsubApps = initAppointments(profile.organizationId, user.uid, isAdmin);
    const unsubNotes = initNotifications(profile.organizationId, user.uid, isAdmin);
    return () => {
      unsubApps();
      unsubNotes();
    };
  }, [user?.uid, profile?.organizationId, isAdmin, initAppointments, initNotifications]);
};

