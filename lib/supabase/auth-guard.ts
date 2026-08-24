import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function verifyAdminAuth(): Promise<{ isAuthorized: boolean; user?: any; error?: string }> {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tuphsfeowfcyzzciyvav.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Read-only in route handlers
          }
        },
      },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return { isAuthorized: false, error: 'Oturum açılmamış. Lütfen giriş yapın.' };
    }

    const isOwnerEmail =
      user.email === 'chessvip11@gmail.com' ||
      user.email === 'admin@otantikosconcept.com';
    const hasAdminMeta = user.app_metadata?.role === 'admin';

    let isProfileAdmin = false;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile && profile.role === 'admin') {
        isProfileAdmin = true;
      }
    } catch {
      // Profile table fallback
    }

    if (isOwnerEmail || hasAdminMeta || isProfileAdmin) {
      return { isAuthorized: true, user };
    }

    return { isAuthorized: false, error: 'Bu işlem için yönetici yetkisi gereklidir.' };
  } catch (err: any) {
    return { isAuthorized: false, error: err.message || 'Yetki doğrulama hatası' };
  }
}
