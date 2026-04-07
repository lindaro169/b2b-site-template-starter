'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { siteConfig } from '@/lib/site-config';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'user';
}

export interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  updateUser: (user: AdminUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

function RuntimeAuthProvider({ children }: AuthProviderProps) {
  const { data: session, isPending, error } = authClient.useSession();
  const [user, setUser] = useState<AdminUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      const sessionRole = (session.user as Record<string, unknown>).role;
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
      setUser(null);
    }
  }, [session, isPending, error]);

  const login = () => {
    // Legacy support: just redirect or reload
    router.push('/admin/dashboard');
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
    isAuthenticated: !!session?.user,
    isLoading: isPending,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  if (siteConfig.localPreviewMode) {
    const templateUser: AdminUser = {
      id: 'template-admin',
      email: siteConfig.previewAdminEmail,
      name: `${siteConfig.shortName} Template Admin`,
      role: 'admin',
    };

    const value: AuthContextType = {
      user: templateUser,
      isAuthenticated: true,
      isLoading: false,
      login: () => undefined,
      logout: () => undefined,
      updateUser: () => undefined,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }

  return <RuntimeAuthProvider>{children}</RuntimeAuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
