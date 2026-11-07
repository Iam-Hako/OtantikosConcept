import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tuphsfeowfcyzzciyvav.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Protect Customer Account Pages (/hesabim)
  if (pathname.startsWith('/hesabim')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/giris';
      url.searchParams.set('redirect', pathname);
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }
  }

  // 2. Protect Admin API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Oturum açmanız gerekmektedir.' },
        { status: 401 }
      );
    }

    const hasAdminMeta = user.app_metadata?.role === 'admin';
    let isProfileAdmin = false;
    if (!hasAdminMeta) {
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
        // Ignore
      }
    }

    const isOwnerEmail =
      (user.email === 'chessvip11@gmail.com' || user.email === 'admin@otantikosconcept.com') &&
      Boolean(user.email_confirmed_at);

    if (!hasAdminMeta && !isProfileAdmin && !isOwnerEmail) {
      return NextResponse.json(
        { error: 'Erişim engellendi. Bu işlem için yönetici yetkisi gereklidir.' },
        { status: 403 }
      );
    }
  }

  // 3. Protect Admin Dashboard Pages (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/giris';
      url.searchParams.set('redirect', pathname);
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }

    const hasAdminMeta = user.app_metadata?.role === 'admin';

    // Check profiles table if exists
    let isProfileAdmin = false;
    if (!hasAdminMeta) {
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
        // Ignore
      }
    }

    const isOwnerEmail =
      (user.email === 'chessvip11@gmail.com' || user.email === 'admin@otantikosconcept.com') &&
      Boolean(user.email_confirmed_at);

    if (!hasAdminMeta && !isProfileAdmin && !isOwnerEmail) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }
  }

  return supabaseResponse;
}
