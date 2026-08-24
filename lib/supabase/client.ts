import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tuphsfeowfcyzzciyvav.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: (url: RequestInfo | URL, options?: RequestInit) => {
        return fetch(url, {
          ...options,
          cache: 'no-store',
        });
      },
    },
  });
}
