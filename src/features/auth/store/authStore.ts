import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../../../types';
import { authService } from '../services/authService';

interface AuthState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  users: UserProfile[];
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  initialized: boolean;
  
  setUser: (user: FirebaseUser | null) => void;
  setProfile: (profile: UserProfile | null, isAdmin: boolean, isSuperAdmin: boolean) => void;
  setUsers: (users: UserProfile[]) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (userId: string, nextRole: string, organizationId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  users: [],
  loading: true,
  isAdmin: false,
  isSuperAdmin: false,
  initialized: false,

  setUser: (user) => set({ user }),
  
  setProfile: (profile, isAdmin, isSuperAdmin) => set({ 
    profile, 
    isAdmin, 
    isSuperAdmin 
  }),

  setUsers: (users) => set({ users }),

  setLoading: (loading) => set({ loading }),

  setInitialized: (initialized) => set({ initialized }),

  login: async () => {
    try {
      set({ loading: true });
      await authService.login(); // popup resolves after auth completes
    } catch (error: any) {
      // COOP warning about window.closed is non-fatal — ignore it
      if (!error?.message?.includes('window.closed')) {
        console.error('[AuthStore] Login error:', error);
      }
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      await authService.logout();
      set({ 
        user: null, 
        profile: null, 
        users: [], 
        isAdmin: false, 
        isSuperAdmin: false, 
        loading: false 
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({ loading: false });
    }
  },

  updateUserRole: async (userId, nextRole, organizationId) => {
    try {
      await authService.updateUserRole(userId, nextRole, organizationId);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }
}));
