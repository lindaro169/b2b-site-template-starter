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
  const isTemplateMode = siteConfig.templateMode;
  const templateUser: AdminUser = {
    id: 'template-admin',
    email: siteConfig.adminEmail,
    name: `${siteConfig.shortName} Template Admin`,
    role: 'admin',
  };

  useEffect(() => {
    if (isTemplateMode) {
      return;
    }

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
  }, [session, isPending, error, isTemplateMode]);

  const login = () => {
    // Legacy support: just redirect or reload
    router.push('/admin/dashboard');
  };

  const logout = async () => {
    if (isTemplateMode) {
      router.push('/admin/dashboard');
      return;
    }

    await authClient.signOut();
    setUser(null);
    router.push('/login');
  };

  const updateUser = (updatedUser: AdminUser) => {
    setUser(updatedUser);
  };

  const resolvedUser = isTemplateMode ? templateUser : user;

  const value: AuthContextType = {
    user: resolvedUser,
    token: isTemplateMode ? 'template-admin-token' : session?.session?.token || null,
    isAuthenticated: isTemplateMode ? true : !!session?.user,
    isLoading: isTemplateMode ? false : isPending,
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
