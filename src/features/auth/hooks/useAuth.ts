import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    profile,
    users,
    loading,
    isAdmin,
    isSuperAdmin,
    initialized,
    login,
    logout,
    updateUserRole
  } = useAuthStore();

  return {
    user,
    profile,
    users,
    loading,
    isAdmin,
    isSuperAdmin,
    isLoggedIn: !!user,
    initialized,
    login,
    logout,
    updateUserRole
  };
};
