'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'user';
}

export interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  updateUser: (user: AdminUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, isPending, error } = authClient.useSession();
  const [user, setUser] = useState<AdminUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('[AuthProvider] Session update:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      isPending,
      error
    });

    if (session?.user) {
      const sessionRole = (session.user as Record<string, unknown>).role;
      console.log('[AuthProvider] Setting user:', session.user.email);
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role:
          sessionRole === 'admin' || sessionRole === 'editor' || sessionRole === 'user'
            ? sessionRole
            : 'user',
      });
    } else {
      console.log('[AuthProvider] No user in session');
      setUser(null);
    }
  }, [session, isPending, error]);

  const login = () => {
    // Legacy support: just redirect or reload
    router.push('/dashboard');
  };

  const logout = async () => {
    await authClient.signOut();
    setUser(null);
    router.push('/login');
  };

  const updateUser = (updatedUser: AdminUser) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    token: session?.session?.token || null,
    isAuthenticated: !!session?.user,
    isLoading: isPending,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
