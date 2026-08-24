import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tuphsfeowfcyzzciyvav.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('[CRITICAL] SUPABASE_SERVICE_ROLE_KEY is required for server-side admin operations.');
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
