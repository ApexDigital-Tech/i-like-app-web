import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where,
  onSnapshot 
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db, googleProvider, signInWithGoogle, logout as firebaseLogout } from '../../../lib/firebase';
import { UserProfile } from '../../../types';

const SUPER_ADMIN_EMAIL = 'apexdigital70@gmail.com'.toLowerCase();

export const authService = {
  async getOrCreateProfile(user: FirebaseUser): Promise<{ profile: UserProfile, isAdmin: boolean, isSuperAdmin: boolean }> {
    const userEmail = (user.email || '').toLowerCase().trim();
    const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL;
    const profileRef = doc(db, 'users', user.uid);
    
    console.log(`[AuthService] Syncing profile for ${userEmail}. isSuperAdmin=${isSuperAdmin}`);
    
    let snap;
    try {
      snap = await getDoc(profileRef);
    } catch (e) {
      console.error('[AuthService] Error fetching profile:', e);
      throw e;
    }

    if (snap && snap.exists()) {
      const profile = snap.data() as UserProfile;
      
      // Normalización de roles y org
      const shouldUpdate = (isSuperAdmin && profile.role !== 'superadmin') || !profile.organizationId;
      
      if (shouldUpdate) {
        try {
          const updates: any = {};
          if (!profile.organizationId) updates.organizationId = 'default-org';
          if (isSuperAdmin) updates.role = 'superadmin';
          
          await updateDoc(profileRef, updates);
          profile.role = isSuperAdmin ? 'superadmin' : profile.role;
          profile.organizationId = profile.organizationId || 'default-org';
        } catch (e) {
          console.warn('[AuthService] Could not update Firestore profile, using local override');
        }
      }

      return {
        profile,
        isAdmin: isSuperAdmin || ['Admin', 'admin', 'superadmin'].includes(profile.role),
        isSuperAdmin
      };
    }

    // Crear nuevo perfil
    const newProfile: UserProfile = {
      name: user.displayName || 'Usuario Vid-A',
      email: userEmail,
      image: user.photoURL || 'https://img.icons8.com/ios-filled/50/666666/user-male-circle.png',
      role: isSuperAdmin ? 'superadmin' : 'Buyer',
      bio: 'Miembro de la red Vid-A.',
      organizationId: 'default-org'
    };

    try {
      await setDoc(profileRef, newProfile);
    } catch (e) {
      console.error('[AuthService] Error creating profile:', e);
    }

    return {
      profile: newProfile,
      isAdmin: isSuperAdmin || newProfile.role === 'superadmin',
      isSuperAdmin
    };
  },

  async handleRedirectResult(): Promise<{ user: FirebaseUser | null }> {
    // No-op for popup mode — kept for API compatibility
    return { user: null };
  },

  subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  async login() {
    console.log('[AuthService] Starting Google sign-in (popup)...');
    return signInWithGoogle();
  },

  async logout() {
    return firebaseLogout();
  },

  async updateUserRole(userId: string, nextRole: string, organizationId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), { 
      role: nextRole,
      organizationId 
    });
  },

  subscribeToUsersList(organizationId: string, callback: (users: UserProfile[]) => void) {
    const q = query(
      collection(db, 'users'), 
      where('organizationId', '==', organizationId)
    );
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as UserProfile));
      const sortedUsers = [...users].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      callback(sortedUsers);
    });
  },

  subscribeToAllUsersList(callback: (users: UserProfile[]) => void) {
    const q = collection(db, 'users');
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as UserProfile));
      const sortedUsers = [...users].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      callback(sortedUsers);
    });
  }
};
