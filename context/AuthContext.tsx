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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await api.auth.getMe();
      if (res.user) {
        setUser(res.user);
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
      setUser(res.user);
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
      setUser(res.user);
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
    setUser(newUser);
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
