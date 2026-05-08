import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin client — uses SERVICE_ROLE_KEY.
 * Bypasses RLS. Only use in server-side code (Server Actions, Route Handlers).
 * NEVER expose this to the client.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
