'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/lib/types/ecommerce';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  toggleDemoAdminRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = createClient();

  useEffect(() => {
    // Check initial session
    async function loadUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Check role from profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile as UserProfile);
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              role: session.user.email === 'admin@otantikosconcept.com' ? 'admin' : 'customer',
              created_at: session.user.created_at,
            });
          }
        } else {
          // Check if demo bypass is saved in localStorage
          const savedDemo = localStorage.getItem('otantikos_demo_user');
          if (savedDemo) {
            setUser(JSON.parse(savedDemo));
          }
        }
      } catch (err) {
        console.error('Auth load error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser(profile as UserProfile);
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            role: session.user.email === 'admin@otantikosconcept.com' ? 'admin' : 'customer',
            created_at: session.user.created_at,
          });
        }
      } else {
        const savedDemo = localStorage.getItem('otantikos_demo_user');
        if (!savedDemo) {
          setUser(null);
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error(`Google ile giriş yapılamadı: ${error.message}`);
      }
    } catch {
      toast.error('Google bağlantısı başlatılamadı.');
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      toast.success('Giriş başarılı! Hoş geldiniz.');
      return { success: true };
    } catch {
      return { success: false, error: 'Bir hata oluştu.' };
    }
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      toast.success('Hesabınız oluşturuldu!');
      return { success: true };
    } catch {
      return { success: false, error: 'Kayıt sırasında hata oluştu.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('otantikos_demo_user');
    setUser(null);
    toast.info('Oturum kapatıldı.');
  };

  const toggleDemoAdminRole = () => {
    if (user?.role === 'admin') {
      const newU: UserProfile = { ...user, role: 'customer' };
      setUser(newU);
      localStorage.setItem('otantikos_demo_user', JSON.stringify(newU));
      toast.info('Rol: Müşteri moduna geçildi.');
    } else {
      const newU: UserProfile = {
        id: user?.id || 'demo-admin-id',
        email: user?.email || 'admin@otantikosconcept.com',
        full_name: user?.full_name || 'Tahtakale Yönetici',
        role: 'admin',
        created_at: new Date().toISOString(),
      };
      setUser(newU);
      localStorage.setItem('otantikos_demo_user', JSON.stringify(newU));
      toast.success('Yönetici (Admin) moduna geçildi! /admin paneline erişebilirsiniz.');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        logout,
        toggleDemoAdminRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
