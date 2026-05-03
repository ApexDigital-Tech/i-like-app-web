import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

export const useAuthInit = () => {
  const { 
    setUser, 
    setProfile, 
    setUsers, 
    setLoading, 
    setInitialized,
    initialized,
    isAdmin,
    isSuperAdmin,
    profile
  } = useAuthStore();

  useEffect(() => {
    console.log('[AuthInit] Mount');
    
    const syncProfile = async (user: any) => {
      if (!user) {
        setProfile(null, false, false);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        console.log('[AuthInit] Syncing profile for:', user.email);
        const result = await authService.getOrCreateProfile(user);
        setProfile(result.profile, result.isAdmin, result.isSuperAdmin);
      } catch (error) {
        console.error('[AuthInit] Profile sync error:', error);
        // Fallback para SuperAdmin
        const userEmail = user.email?.toLowerCase().trim() || '';
        const isSuperUser = userEmail === 'apexdigital70@gmail.com';
        setProfile({
          name: user.displayName || 'System Administrator',
          email: user.email || '',
          image: user.photoURL || 'https://img.icons8.com/ios-filled/50/666666/user-male-circle.png',
          role: isSuperUser ? 'superadmin' : 'Buyer',
          organizationId: 'default-org'
        }, isSuperUser, isSuperUser);
      } finally {
        setLoading(false);
      }
    };

    // 1. Handle Redirect Result (for robust login after Google redirect)
    // onAuthStateChanged also fires after redirect, so this is a safety net
    authService.handleRedirectResult().then(({ user }) => {
      if (user) {
        console.log('[AuthInit] Redirect result detected for:', user.email);
        // onAuthStateChanged will also fire — let it handle the full sync
        // We just log here to confirm the redirect succeeded
      }
    }).catch((err) => {
      console.warn('[AuthInit] handleRedirectResult error (non-fatal):', err);
    });

    // 2. Subscribe to auth changes (handles both redirect return and persistent sessions)
    const unsubscribe = authService.subscribeToAuthChanges(async (user) => {
      console.log('[AuthInit] Auth change:', user?.email || 'None');
      setUser(user);
      if (user) {
        syncProfile(user);
      } else {
        setProfile(null, false, false);
        setLoading(false);
      }
      setInitialized(true);
    });

    // 3. Safety timeout - if auth doesn't respond in 8s, let the app load
    const timeout = setTimeout(() => {
      const currentState = useAuthStore.getState();
      if (!currentState.initialized) {
        console.warn('[AuthInit] CRITICAL: Auth initialization timed out after 8s. Forcing initialized=true');
        setInitialized(true);
        setLoading(false);
      }
    }, 8000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [setUser, setProfile, setLoading, setInitialized]); // Removed 'initialized' dependency to avoid re-run loops

  // Admin Users Listener
  useEffect(() => {
    if ((isAdmin || isSuperAdmin) && profile?.organizationId) {
      const unsubscribe = authService.subscribeToUsersList(profile.organizationId, (users) => {
        setUsers(users);
      });
      return unsubscribe;
    }
  }, [isAdmin, isSuperAdmin, profile?.organizationId, setUsers]);
};
