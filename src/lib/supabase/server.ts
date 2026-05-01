// Supabase Server Client for Server Components and API Routes
// Based on: https://supabase.com/docs/guides/auth/server-side/nextjs

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { headers } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

export async function createServerClientWrapper() {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return headers().then(h => h.get(name))
        },
      },
    }
  )

  return supabase
}

// For use in API Routes (server-side only)
export const supabaseServer = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
