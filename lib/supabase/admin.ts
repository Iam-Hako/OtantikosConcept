import { createClient } from '@supabase/supabase-js';

function getServerAccessTokenFromCookies(): string | null {
  if (typeof window !== 'undefined') return null;
  try {
    // Dynamic require so client bundles never import next/headers
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { cookies } = require('next/headers');
    const cookieStore = cookies();
    const allCookies: Array<{ name: string; value: string }> =
      typeof cookieStore?.getAll === 'function' ? cookieStore.getAll() : [];
    if (!allCookies || allCookies.length === 0) return null;

    // Look for exact sb-*-auth-token or chunked sb-*-auth-token.0, .1, ...
    const authCookies = allCookies.filter((c) => /^sb-[^-]+-auth-token(\.\d+)?$/.test(c.name));
    if (authCookies.length === 0) return null;

    const exact = authCookies.find((c) => !/\.\d+$/.test(c.name));
    let rawValue = '';
    if (exact) {
      rawValue = exact.value;
    } else {
      const sortedChunks = [...authCookies].sort((a, b) => {
        const idxA = Number(a.name.split('.').pop() || 0);
        const idxB = Number(b.name.split('.').pop() || 0);
        return idxA - idxB;
      });
      rawValue = sortedChunks.map((c) => c.value).join('');
    }

    if (!rawValue) return null;
    try {
      rawValue = decodeURIComponent(rawValue);
    } catch {
      // keep rawValue
    }

    let jsonStr = rawValue;
    if (rawValue.startsWith('base64-')) {
      jsonStr = Buffer.from(rawValue.slice(7), 'base64').toString('utf8');
    }

    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed.access_token === 'string') {
      return parsed.access_token;
    }
    if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
      return parsed[0];
    }
  } catch {
    // Called outside request scope or cookies unavailable
  }
  return null;
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tuphsfeowfcyzzciyvav.supabase.co';
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy';

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (url: RequestInfo | URL, options?: RequestInit) => {
        const headers = new Headers(options?.headers);
        if (!hasServiceRoleKey) {
          const userJwt = getServerAccessTokenFromCookies();
          if (userJwt) {
            headers.set('Authorization', `Bearer ${userJwt}`);
          }
        }
        return fetch(url, {
          ...options,
          headers,
          cache: 'no-store',
        });
      },
    },
  });
}
