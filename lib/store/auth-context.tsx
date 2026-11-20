'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/lib/types/ecommerce';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  loginWithGoogle: (redirectToPath?: string) => Promise<void>;
  loginWithGoogleIdToken: (idToken: string, redirectToPath?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isConfirmedOwnerUser(authUser: any): boolean {
  if (!authUser) return false;
  const cleanEmail = (authUser.email || '').toLowerCase().trim();
  return (
    (cleanEmail === 'chessvip11@gmail.com' || cleanEmail === 'admin@otantikosconcept.com') &&
    Boolean(authUser.email_confirmed_at)
  );
}

function buildResolvedUserProfile(authUser: any, profile: any): UserProfile {
  const hasAdminRole =
    profile?.role === 'admin' ||
    authUser?.app_metadata?.role === 'admin' ||
    isConfirmedOwnerUser(authUser);

  if (profile) {
    return {
      ...(profile as UserProfile),
      role: hasAdminRole ? 'admin' : profile.role,
    };
  }

  return {
    id: authUser.id,
    email: authUser.email || '',
    full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Kullanıcı',
    role: hasAdminRole ? 'admin' : 'customer',
    created_at: authUser.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          setUser(buildResolvedUserProfile(session.user, profile));
        } else {
          setUser(null);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        setUser(buildResolvedUserProfile(session.user, profile));
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogleIdToken = async (idToken: string, redirectToPath?: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        toast.error(`Google ile giriş yapılamadı: ${error.message}`);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        setUser(buildResolvedUserProfile(data.user, profile));
      }

      toast.success('Google ile giriş başarılı!');
      if (redirectToPath) {
        window.location.href = redirectToPath;
      }
      return { success: true };
    } catch (err: any) {
      toast.error('Google bağlantısı sağlanamadı.');
      return { success: false, error: err?.message || 'Bilinmeyen hata' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (redirectToPath?: string) => {
    try {
      const nextQuery = redirectToPath ? `?next=${encodeURIComponent(redirectToPath)}` : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback${nextQuery}`,
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      toast.success('Giriş başarılı!');
      return { success: true };
    } catch {
      return { success: false, error: 'Bir hata oluştu.' };
    }
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
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
    setUser(null);
    toast.info('Oturum kapatıldı.');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        loginWithGoogle,
        loginWithGoogleIdToken,
        loginWithEmail,
        signUpWithEmail,
        logout,
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
