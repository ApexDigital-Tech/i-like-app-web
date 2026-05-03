import { useEffect } from 'react';
import { usePropertyStore } from '../store/propertyStore';
import { useAuthStore } from '../../auth/store/authStore';

export const usePropertiesInit = () => {
  const { profile } = useAuthStore();
  const { initialize } = usePropertyStore();

  useEffect(() => {
    if (!profile?.organizationId) return;
    
    const unsubscribe = initialize(profile.organizationId);
    return () => unsubscribe();
  }, [initialize, profile?.organizationId]);
};

