import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../src/types.ts';
import { api, setAuthToken, getStoredAuthToken } from '../services/api.ts';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  isCourtAdmin: boolean;
  login: (email?: string, role?: UserRole) => Promise<void>;
  register: (params: { full_name: string; email: string; role: UserRole; dupr_id?: string }) => Promise<void>;
  logout: () => void;
  switchUser: (user: Profile) => void;
  refreshUser: () => Promise<void>;
  updateUserProfile: (params: { full_name?: string; email?: string; phone?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setSafeUser = (u: Profile | null) => {
    if (u && (u.full_name === 'Taylor Vance' || u.full_name === 'Frannnxx' || u.id === '00000000-0000-0000-0000-000000000002')) {
      setUser({
        ...u,
        full_name: 'Frannnxx',
        avatar_url: '/src/assets/images/frannnxx_avatar_1791277042121.jpg',
      });
    } else {
      setUser(u);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.getMe();
      if (res.user) {
        setSafeUser(res.user);
      }
    } catch (err) {
      console.warn('Could not refresh session:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getStoredAuthToken();
        if (storedToken) {
          await refreshUser();
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email?: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, role);
      setSafeUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: {
    full_name: string;
    email: string;
    role: UserRole;
    dupr_id?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(params);
      setSafeUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const switchUser = (newUser: Profile) => {
    setAuthToken(`usr_${newUser.id}`);
    setSafeUser(newUser);
  };

  const updateUserProfile = async (params: { full_name?: string; email?: string; phone?: string }) => {
    const res = await api.auth.updateProfile(params);
    if (res.user) {
      setSafeUser(res.user);
    }
  };

  const role = user?.role || null;
  const isCourtAdmin = role === 'court_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isCourtAdmin,
        login,
        register,
        logout,
        switchUser,
        refreshUser,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
