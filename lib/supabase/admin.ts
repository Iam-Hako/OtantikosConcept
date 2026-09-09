import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tuphsfeowfcyzzciyvav.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key';

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[Admin Client] SUPABASE_SERVICE_ROLE_KEY not configured, falling back to anon key.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
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
