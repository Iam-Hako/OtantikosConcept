import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

function getSafeRedirectUrl(next: string | null, origin: string): URL {
  const fallback = new URL('/', origin);
  if (!next) return fallback;

  // Strict check: must start with single '/', no consecutive slashes, no backslashes
  const isSafeRelativePath = /^\/(?!\/|\\)[a-zA-Z0-9_\-\/\?&=%#\.]*$/.test(next);
  if (!isSafeRelativePath) {
    return fallback;
  }

  try {
    const resolvedUrl = new URL(next, origin);
    if (resolvedUrl.origin !== origin) {
      return fallback;
    }
    return resolvedUrl;
  } catch {
    return fallback;
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next');

  if (code) {
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
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const safeRedirectUrl = getSafeRedirectUrl(rawNext, origin);
      return NextResponse.redirect(safeRedirectUrl);
    }
  }

  // Return to error or home page if exchange fails
  return NextResponse.redirect(`${origin}/giris?error=auth-failed`);
}
